import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";
import argon2 from "argon2";
import { db, sessionsTable, usersTable } from "@workspace/db";

export const SESSION_COOKIE_NAME = "vexen_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "user" | "admin";
  emailVerifiedAt: Date | null;
  createdAt: Date;
};

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUser;
    }
  }
}

const argonOptions = {
  type: argon2.argon2id as 2,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
  hashLength: 32,
};

const dummyPasswordHash = argon2.hash(
  randomBytes(32).toString("hex"),
  argonOptions,
);

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function publicUser(
  user: Pick<
    AuthenticatedUser,
    "id" | "email" | "role" | "emailVerifiedAt" | "createdAt"
  >,
): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt,
    createdAt: user.createdAt,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, argonOptions);
}

export async function verifyPassword(
  passwordHash: string | undefined,
  password: string,
): Promise<boolean> {
  const targetHash = passwordHash ?? (await dummyPasswordHash);
  const matches = await argon2.verify(targetHash, password).catch(() => false);
  return Boolean(passwordHash) && matches;
}

export function sessionCookieOptions(expiresAt?: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api",
    ...(expiresAt ? { expires: expiresAt } : {}),
  };
}

export async function createUserSession(
  userId: string,
  response: Response,
): Promise<void> {
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessionsTable).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  response.cookie(
    SESSION_COOKIE_NAME,
    token,
    sessionCookieOptions(expiresAt),
  );
}

export async function requireAuthenticatedUser(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const token = request.cookies?.[SESSION_COOKIE_NAME];

  if (typeof token !== "string" || token.length < 32 || token.length > 128) {
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  const tokenHash = hashSessionToken(token);
  const [record] = await db
    .select({
      id: usersTable.id,
      email: usersTable.email,
      role: usersTable.role,
      emailVerifiedAt: usersTable.emailVerifiedAt,
      createdAt: usersTable.createdAt,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.tokenHash, tokenHash),
        gt(sessionsTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!record) {
    await db.delete(sessionsTable).where(eq(sessionsTable.tokenHash, tokenHash));
    response.status(401).json({ error: "Authentication required." });
    return;
  }

  request.authUser = publicUser(record);
  next();
}
