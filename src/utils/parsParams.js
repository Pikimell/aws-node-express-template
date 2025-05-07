export const parsPaginationParams = (query = {}) => {
  const page = +query.page || 1;
  const perPage = +query.perPage || 50;
  return { page, perPage };
};
export const parsUsersSortParams = (query = {}) => {
  const defaultSort = { lastActivity: -1 }; // Default sorting by lastActivity descending

  // Extract sorting parameters from the query
  const { sortBy, sortOrder = 'desc' } = query;

  if (sortBy && sortOrder) {
    const validSortOrder = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
    return { [sortBy]: validSortOrder }; // Return sorting based on query parameters
  }

  return defaultSort; // Return default sort if no parameters are provided
};
