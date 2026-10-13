import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import rateLimit from "express-rate-limit";
import {
  GetCurrentUserResponse,
  LoginBody,
  LoginResponse,
  LogoutResponse,
  RegisterBody,
  RegisterResponse,
} from "@workspace/api-zod";
import { db, sessionsTable, usersTable } from "@workspace/db";
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  publicUser,
  requireAuthenticatedUser,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
  sessionCookieOptions,
  verifyPassword,
} from "../lib/auth";

const router: IRouter = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  let depth = 0;

  while (typeof current === "object" && current !== null && depth < 5) {
    const candidate = current as { code?: unknown; cause?: unknown };
    if (candidate.code === "23505") return true;
    current = candidate.cause;
    depth += 1;
  }

  return false;
}

router.post("/auth/register", registerLimiter, async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Enter a valid email and a password of at least 12 characters.",
    });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const passwordHash = await hashPassword(parsed.data.password);
  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  try {
    const user = await db.transaction(async (tx) => {
      const [createdUser] = await tx
        .insert(usersTable)
        .values({ email, passwordHash })
        .returning();

      await tx.insert(sessionsTable).values({
        userId: createdUser.id,
        tokenHash: hashSessionToken(token),
        expiresAt,
      });

      return createdUser;
    });

    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));
    res.status(201).json(RegisterResponse.parse(publicUser(user)));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "This email address is already registered." });
      return;
    }
    throw error;
  }
});

router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "Enter a valid email and password." });
    return;
  }

  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  const validPassword = await verifyPassword(
    user?.passwordHash,
    parsed.data.password,
  );

  if (!user || !validPassword) {
    res.status(401).json({ error: "Email or password is incorrect." });
    return;
  }

  const token = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db.insert(sessionsTable).values({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });

  res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));
  res.json(LoginResponse.parse(publicUser(user)));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];

  if (typeof token === "string" && token.length <= 128) {
    await db
      .delete(sessionsTable)
      .where(eq(sessionsTable.tokenHash, hashSessionToken(token)));
  }

  res.clearCookie(SESSION_COOKIE_NAME, sessionCookieOptions());
  res.json(LogoutResponse.parse({ loggedOut: true }));
});

router.get(
  "/auth/me",
  requireAuthenticatedUser,
  (req, res): void => {
    if (!req.authUser) {
      res.status(401).json({ error: "Authentication required." });
      return;
    }

    res.json(GetCurrentUserResponse.parse(publicUser(req.authUser)));
  },
);

export default router;
