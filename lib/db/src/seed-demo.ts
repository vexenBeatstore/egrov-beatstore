import { db, pool } from "./index";
import { beatsTable, licensesTable } from "./schema";
import {
  demoBeats,
  demoBasicPricesMinor,
  demoLicenses,
} from "./seed/demo-catalog";

async function seedDemoCatalog(): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: beatsTable.id })
      .from(beatsTable)
      .limit(1);

    if (existing.length > 0) {
      throw new Error(
        "Demo import refused: the beats table is not empty. No records were changed.",
      );
    }

    const insertedBeats = await tx
      .insert(beatsTable)
      .values(
        demoBeats.map((beat) => ({
          ...beat,
          coverUrl: null,
          previewUrl: null,
          published: true,
        })),
      )
      .returning({ id: beatsTable.id, slug: beatsTable.slug });

    const insertedLicenses = insertedBeats.flatMap((beat) =>
      demoLicenses.map((license) => ({
        beatId: beat.id,
        name: license.name,
        description: license.description,
        priceMinor:
          license.name === "Basic lease"
            ? demoBasicPricesMinor[beat.slug]
            : license.priceMinor,
        currency: "USD",
        active: true,
      })),
    );

    await tx.insert(licensesTable).values(insertedLicenses);
  });
}

try {
  await seedDemoCatalog();
  process.stdout.write(
    `Imported ${demoBeats.length} example beats and ${demoBeats.length * demoLicenses.length} example licenses.\n`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
