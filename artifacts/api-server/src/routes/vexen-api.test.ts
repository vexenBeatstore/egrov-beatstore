import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import request from "supertest";
import { and, eq } from "drizzle-orm";
import app from "../app";
import { hashSessionToken } from "../lib/auth";
import {
  beatsTable,
  db,
  pool,
  sessionsTable,
  usersTable,
} from "@workspace/db";

const createdEmails: string[] = [];
const hiddenBeatSlug = `test-hidden-${randomUUID()}`;

function cookiePair(setCookie: string | string[] | undefined): string {
  const values = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const cookie = values.find((value) => value.startsWith("vexen_session="));
  if (!cookie) throw new Error("Session cookie was not set.");
  return cookie.split(";")[0] ?? "";
}

function sessionToken(cookie: string): string {
  return cookie.slice("vexen_session=".length);
}

describe("VEXEN BeatStore API", () => {
  afterAll(async () => {
    if (createdEmails.length > 0) {
      await db
        .delete(usersTable)
        .where(and(eq(usersTable.email, createdEmails[0]!)));
    }
    await db.delete(beatsTable).where(eq(beatsTable.slug, hiddenBeatSlug));
    await pool.end();
  });

  it("registers safely, rejects bad credentials, and revokes or expires sessions", async () => {
    const email = `vexen-${randomUUID()}@example.com`;
    createdEmails.push(email);
    const password = "test-only-long-password-4821";

    const registration = await request(app)
      .post("/api/auth/register")
      .send({ email: email.toUpperCase(), password, role: "admin" });

    expect(registration.status).toBe(201);
    expect(registration.body).toMatchObject({
      email,
      role: "user",
      emailVerifiedAt: null,
    });
    expect(registration.body.passwordHash).toBeUndefined();

    const registrationCookie = cookiePair(registration.headers["set-cookie"]);
    expect(registration.headers["set-cookie"]?.[0]).toContain("HttpOnly");
    expect(registration.headers["set-cookie"]?.[0]).toContain("SameSite=Lax");
    expect(registration.headers["set-cookie"]?.[0]).toContain("Path=/api");

    const storedUsers = await db
      .select({ passwordHash: usersTable.passwordHash })
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);
    expect(storedUsers[0]?.passwordHash).not.toBe(password);
    expect(storedUsers[0]?.passwordHash).toContain("$argon2id$");

    const currentUser = await request(app)
      .get("/api/auth/me")
      .set("Cookie", registrationCookie);
    expect(currentUser.status).toBe(200);
    expect(currentUser.body.role).toBe("user");

    const duplicate = await request(app)
      .post("/api/auth/register")
      .send({ email, password });
    expect(duplicate.status).toBe(409);

    const wrongPassword = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "definitely-wrong-password" });
    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body.error).toBe("Email or password is incorrect.");

    const unknownEmail = await request(app)
      .post("/api/auth/login")
      .send({ email: `missing-${randomUUID()}@example.com`, password });
    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.error).toBe(wrongPassword.body.error);

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.role).toBe("user");
    const loginCookie = cookiePair(login.headers["set-cookie"]);

    const logout = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", loginCookie);
    expect(logout.status).toBe(200);
    expect(logout.body.loggedOut).toBe(true);

    const afterLogout = await request(app)
      .get("/api/auth/me")
      .set("Cookie", loginCookie);
    expect(afterLogout.status).toBe(401);

    const secondLogin = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    const expiringCookie = cookiePair(secondLogin.headers["set-cookie"]);
    await db
      .update(sessionsTable)
      .set({ expiresAt: new Date(Date.now() - 1000) })
      .where(
        eq(
          sessionsTable.tokenHash,
          hashSessionToken(sessionToken(expiringCookie)),
        ),
      );

    const afterExpiration = await request(app)
      .get("/api/auth/me")
      .set("Cookie", expiringCookie);
    expect(afterExpiration.status).toBe(401);
  });

  it("serves published catalog data and excludes unpublished beats", async () => {
    await db.insert(beatsTable).values({
      slug: hiddenBeatSlug,
      title: "Hidden test record",
      genre: "Test",
      bpm: 100,
      key: "C minor",
      description: "Only a test fixture.",
      published: false,
    });

    const hidden = await request(app)
      .get("/api/beats")
      .query({ q: hiddenBeatSlug });
    expect(hidden.status).toBe(200);
    expect(hidden.body).toEqual([]);

    const filtered = await request(app)
      .get("/api/beats")
      .query({
        genre: "Trap",
        minBpm: 140,
        maxBpm: 145,
        maxPriceMinor: 3000,
      });
    expect(filtered.status).toBe(200);
    expect(filtered.body.length).toBeGreaterThan(0);
    expect(
      filtered.body.every(
        (beat: { genre: string; bpm: number; startingPriceMinor: number }) =>
          beat.genre === "Trap" &&
          beat.bpm >= 140 &&
          beat.bpm <= 145 &&
          beat.startingPriceMinor <= 3000,
      ),
    ).toBe(true);

    const detail = await request(app).get("/api/beats/after-hours");
    expect(detail.status).toBe(200);
    expect(detail.body.beat.slug).toBe("after-hours");
    expect(detail.body.licenses.length).toBeGreaterThan(0);

    const licenseList = await request(app).get("/api/licenses");
    expect(licenseList.status).toBe(200);
    expect(licenseList.body.length).toBeGreaterThan(0);

    const hiddenDetail = await request(app).get(`/api/beats/${hiddenBeatSlug}`);
    expect(hiddenDetail.status).toBe(404);
  });
});
