const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
  CHF: "CHF",
  JOD: "JD",
  NOK: "kr",
  SEK: "kr",
  DKK: "kr",
  TRY: "₺",
  PLN: "zł",
};

export const currencySymbol = (currencyCode?: string | null): string => {
  if (!currencyCode) {
    return "";
  }

  return CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;
};
