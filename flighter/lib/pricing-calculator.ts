const seasonalMultiplier = (month: number) => {
  if ([12, 1, 2].includes(month)) return 1.15;
  if ([6, 7, 8].includes(month)) return 1.25;
  if ([4, 5, 9, 10].includes(month)) return 1.05;
  return 0.95;
};

export const computePrices = (
  distanceKm: number,
  stops: number,
  month: number,
) => {
  const base = distanceKm * 0.12 + stops * 22 + 85;
  const season = seasonalMultiplier(month);
  const withSeason = base * season;
  const round = (value: number) => Math.max(79, Math.round(value));

  return {
    economy: round(withSeason),
    premium: round(withSeason * 1.45),
    business: round(withSeason * 2.65),
    first: round(withSeason * 3.6),
  };
};
