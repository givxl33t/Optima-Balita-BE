export const metaBuilder = (
  offset: number,
  limit: number,
  rowCount: number,
): {
  page: number;
  per_page: number;
  page_size: number;
  total_data: number;
} => {
  const meta = {
    page: offset / limit + 1,
    per_page: limit,
    page_size: Math.ceil(rowCount / limit),
    total_data: rowCount,
  };

  return meta;
};
