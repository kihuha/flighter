import { db } from "@/lib/db";
import { AirportData } from "@/lib/dto/destinations";

export const searchAirports = async (query: string, limit = 3) => {
  const searchTerm = `%${query.toLowerCase().trim()}%`;

  return (await db.$queryRaw`
    SELECT 
      airport_id,
      name,
      city,
      iata_code
    FROM airports
    WHERE 
      LOWER(name) ILIKE ${searchTerm} OR
      LOWER(city) ILIKE ${searchTerm} OR
      LOWER(iata_code) ILIKE ${searchTerm}
    LIMIT ${limit}
  `) as AirportData[];
};
