export function getVerificarPeriod(year: number, now = new Date()) {
  if (!Number.isInteger(year) || year < 2020 || year > 2100) {
    throw new RangeError("El año debe estar entre 2020 y 2100.");
  }
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const currentYear = Number(today.find(part => part.type === "year")!.value);
  const currentMonth = Number(today.find(part => part.type === "month")!.value) - 1;
  const referenceMonth = year === currentYear ? currentMonth : 11;
  const date = (month: number) => new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  // Current year: latest complete month. Other years: December of the selected year.
  const lastMonth = year === currentYear ? referenceMonth - 1 : referenceMonth;
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const trend = Array.from({ length: 6 }, (_, index) => {
    const month = referenceMonth - 5 + index;
    return {
      start: date(month),
      end: date(month + 1),
      label: `${monthNames[(month + 12) % 12]} ${new Date(Date.UTC(year, month, 1)).getUTCFullYear()}`,
    };
  });
  return {
    yearStart: `${year}-01-01`,
    yearEnd: `${year + 1}-01-01`,
    monthStart: date(lastMonth),
    monthEnd: date(lastMonth + 1),
    monthLabel: `${monthNames[(lastMonth + 12) % 12]} ${new Date(Date.UTC(year, lastMonth, 1)).getUTCFullYear()}`,
    trend,
    accidentsStart: [date(0), date(referenceMonth - 5), date(lastMonth)].sort()[0],
  };
}
