export const demoBeats = [
  {
    slug: "after-hours",
    title: "After Hours",
    genre: "Trap",
    bpm: 142,
    key: "F minor",
    description:
      "Пример карточки VEXEN BeatStore. Аудиофайл пока не загружен.",
  },
  {
    slug: "glass-city",
    title: "Glass City",
    genre: "R&B",
    bpm: 96,
    key: "C# minor",
    description:
      "Пример карточки VEXEN BeatStore. Аудиофайл пока не загружен.",
  },
  {
    slug: "no-signal",
    title: "No Signal",
    genre: "Drill",
    bpm: 140,
    key: "G minor",
    description:
      "Пример карточки VEXEN BeatStore. Аудиофайл пока не загружен.",
  },
  {
    slug: "soft-focus",
    title: "Soft Focus",
    genre: "Lo-fi",
    bpm: 84,
    key: "A minor",
    description:
      "Пример карточки VEXEN BeatStore. Аудиофайл пока не загружен.",
  },
  {
    slug: "pressure-room",
    title: "Pressure Room",
    genre: "Trap",
    bpm: 150,
    key: "D minor",
    description:
      "Пример карточки VEXEN BeatStore. Аудиофайл пока не загружен.",
  },
  {
    slug: "blue-hour",
    title: "Blue Hour",
    genre: "R&B",
    bpm: 102,
    key: "E major",
    description:
      "Пример карточки VEXEN BeatStore. Аудиофайл пока не загружен.",
  },
] as const;

export const demoLicenses = [
  {
    name: "Basic lease",
    description:
      "Пример условий. Файлы, права и лимиты публикации требуют настройки.",
    priceMinor: 2900,
  },
  {
    name: "Premium lease",
    description:
      "Пример условий. Файлы, права и лимиты публикации требуют настройки.",
    priceMinor: 7900,
  },
  {
    name: "Unlimited lease",
    description:
      "Пример условий. Файлы, права и лимиты публикации требуют настройки.",
    priceMinor: 14900,
  },
  {
    name: "Exclusive",
    description:
      "Пример условий. Наличие и эксклюзивные права требуют отдельного согласования.",
    priceMinor: 29900,
  },
] as const;

export const demoBasicPricesMinor: Record<string, number> = {
  "after-hours": 2900,
  "glass-city": 2500,
  "no-signal": 3200,
  "soft-focus": 2200,
  "pressure-room": 2900,
  "blue-hour": 2500,
};
