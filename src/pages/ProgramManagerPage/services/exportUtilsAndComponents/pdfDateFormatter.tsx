export const formatPDFDate = (
  dateString: string
) => {
  const date = new Date(dateString);

  const month = date.toLocaleString("en-US", {
    month: "long",
  });

  const day = String(date.getDate()).padStart(
    2,
    "0"
  );

  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
};

export const formatPDFDateRange = (
  range: string
) => {
  const [start, end] = range.split(" - ");

  if (!start || !end) return range;

  return `${formatPDFDate(
    start
  )} - ${formatPDFDate(end)}`;
};