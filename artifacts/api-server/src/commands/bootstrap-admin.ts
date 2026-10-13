import { eq, sql } from "drizzle-orm";
import { db, pool, usersTable } from "@workspace/db";

async function bootstrapAdmin(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(
      "Usage: pnpm --filter @workspace/api-server run bootstrap-admin -- <registered-email>",
    );
  }

  const promotedUser = await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(583902144)`);

    const [existingAdmin] = await tx
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .limit(1);

    if (existingAdmin) {
      throw new Error(
        "Admin bootstrap refused: an administrator already exists.",
      );
    }

    const [user] = await tx
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.email, email))
      .returning({ id: usersTable.id, email: usersTable.email });

    if (!user) {
      throw new Error(
        "No registered user with that email was found. Register first, then run this command.",
      );
    }

    return user;
  });

  process.stdout.write(`Administrator enabled for ${promotedUser.email}.\n`);
}

try {
  await bootstrapAdmin();
} catch (error) {
  const message = error instanceof Error ? error.message : "Admin setup failed.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
