import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  lte,
  min,
  or,
  type SQL,
} from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  GetBeatParams,
  GetBeatResponse,
  ListBeatsQueryParams,
  ListBeatsResponse,
} from "@workspace/api-zod";
import { beatsTable, db, licensesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/beats", async (req, res): Promise<void> => {
  const parsed = ListBeatsQueryParams.safeParse(req.query);

  if (!parsed.success) {
    res.status(400).json({ error: "One or more catalog filters are invalid." });
    return;
  }

  const params = parsed.data;

  if (
    params.minBpm !== undefined &&
    params.maxBpm !== undefined &&
    params.minBpm > params.maxBpm
  ) {
    res.status(400).json({ error: "Minimum BPM must not exceed maximum BPM." });
    return;
  }

  const conditions: SQL[] = [eq(beatsTable.published, true)];

  if (params.genre) conditions.push(eq(beatsTable.genre, params.genre));
  if (params.minBpm !== undefined) {
    conditions.push(gte(beatsTable.bpm, params.minBpm));
  }
  if (params.maxBpm !== undefined) {
    conditions.push(lte(beatsTable.bpm, params.maxBpm));
  }
  if (params.q) {
    const searchTerm = `%${params.q.trim()}%`;
    const searchCondition = or(
      ilike(beatsTable.title, searchTerm),
      ilike(beatsTable.genre, searchTerm),
      ilike(beatsTable.key, searchTerm),
      ilike(beatsTable.description, searchTerm),
    );
    if (searchCondition) conditions.push(searchCondition);
  }

  const startingPrice = min(licensesTable.priceMinor);
  const priceCondition =
    params.maxPriceMinor === undefined
      ? undefined
      : lte(startingPrice, params.maxPriceMinor);

  let ordering: SQL;
  switch (params.sort) {
    case "price-asc":
      ordering = asc(startingPrice);
      break;
    case "price-desc":
      ordering = desc(startingPrice);
      break;
    case "bpm-asc":
      ordering = asc(beatsTable.bpm);
      break;
    default:
      ordering = desc(beatsTable.createdAt);
      break;
  }

  const rows = await db
    .select({
      id: beatsTable.id,
      slug: beatsTable.slug,
      title: beatsTable.title,
      genre: beatsTable.genre,
      bpm: beatsTable.bpm,
      key: beatsTable.key,
      description: beatsTable.description,
      coverUrl: beatsTable.coverUrl,
      previewUrl: beatsTable.previewUrl,
      startingPriceMinor: startingPrice,
      currency: min(licensesTable.currency),
      createdAt: beatsTable.createdAt,
    })
    .from(beatsTable)
    .leftJoin(
      licensesTable,
      and(
        eq(licensesTable.beatId, beatsTable.id),
        eq(licensesTable.active, true),
      ),
    )
    .where(and(...conditions))
    .groupBy(beatsTable.id)
    .having(priceCondition)
    .orderBy(ordering);

  res.json(ListBeatsResponse.parse(rows));
});

router.get("/beats/:slug", async (req, res): Promise<void> => {
  const parsedParams = GetBeatParams.safeParse(req.params);

  if (!parsedParams.success) {
    res.status(400).json({ error: "Invalid beat identifier." });
    return;
  }

  const [beat] = await db
    .select()
    .from(beatsTable)
    .where(
      and(
        eq(beatsTable.slug, parsedParams.data.slug),
        eq(beatsTable.published, true),
      ),
    )
    .limit(1);

  if (!beat) {
    res.status(404).json({ error: "Beat not found." });
    return;
  }

  const licenses = await db
    .select({
      id: licensesTable.id,
      name: licensesTable.name,
      description: licensesTable.description,
      priceMinor: licensesTable.priceMinor,
      currency: licensesTable.currency,
    })
    .from(licensesTable)
    .where(
      and(
        eq(licensesTable.beatId, beat.id),
        eq(licensesTable.active, true),
      ),
    )
    .orderBy(asc(licensesTable.priceMinor));

  const currency = licenses[0]?.currency ?? null;
  const sameCurrencyLicenses = licenses.filter(
    (license) => license.currency === currency,
  );
  const responseBeat = {
    ...beat,
    startingPriceMinor:
      sameCurrencyLicenses.length > 0
        ? Math.min(...sameCurrencyLicenses.map((license) => license.priceMinor))
        : null,
    currency,
  };

  res.json(
    GetBeatResponse.parse({
      beat: responseBeat,
      licenses,
    }),
  );
});

export default router;
