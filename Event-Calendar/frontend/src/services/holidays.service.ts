import { format } from "date-fns";

export interface PublicHoliday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

/**
 * Fetches public holidays for a given year and country.
 * Uses the public-holidays.eu API (date.nager.at).
 * @param year The year for which to retrieve holidays.
 * @param countryCode The two-letter country code (e.g., 'BG' for Bulgaria).
 * @returns A Promise that resolves to an array of PublicHoliday objects.
 */
export const getPublicHolidays = async (
  year: number,
  countryCode: string
): Promise<PublicHoliday[]> => {
  try {
    const response = await fetch(
      `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`
    );

    if (!response.ok) {
      console.error(
        `Failed to fetch public holidays: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const data: PublicHoliday[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching public holidays:", error);
    return [];
  }
};

/**
 * Checks if a given date is a public holiday.
 * @param date The date to check.
 * @param holidays An array of PublicHoliday objects.
 * @returns true if the date is a holiday, false otherwise.
 */
export const isPublicHoliday = (date: Date, holidays: PublicHoliday[]): boolean => {
  const dateString = format(date, "yyyy-MM-dd");
  return holidays.some((holiday) => holiday.date === dateString);
};

/**
 * Returns the local name of a public holiday for a given date.
 * @param date The date to check.
 * @param holidays An array of PublicHoliday objects.
 * @returns The local name of the holiday, or null if it's not a holiday.
 */
export const getHolidayName = (date: Date, holidays: PublicHoliday[]): string | null => {
  const dateString = format(date, "yyyy-MM-dd");
  const holiday = holidays.find((h) => h.date === dateString);
  return holiday ? holiday.localName : null;
};
