export type ListParams = Record<string, string | number | boolean | undefined>;

export const toQueryParams = (params: ListParams) => {
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      cleaned[key] = String(value);
    }
  }
  return cleaned;
};
