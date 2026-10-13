import { and, asc, eq, min } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { ListLicensesResponse } from "@workspace/api-zod";
import { beatsTable, db, licensesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/licenses", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      name: licensesTable.name,
      description: licensesTable.description,
      startingPriceMinor: min(licensesTable.priceMinor),
      currency: licensesTable.currency,
    })
    .from(licensesTable)
    .innerJoin(beatsTable, eq(licensesTable.beatId, beatsTable.id))
    .where(
      and(
        eq(licensesTable.active, true),
        eq(beatsTable.published, true),
      ),
    )
    .groupBy(
      licensesTable.name,
      licensesTable.description,
      licensesTable.currency,
    )
    .orderBy(asc(min(licensesTable.priceMinor)));

  res.json(ListLicensesResponse.parse(rows));
});

export default router;
