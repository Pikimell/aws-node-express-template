const parseString = (value) => {
    if (Array.isArray(value)) {
        return typeof value[0] === "string" ? value[0] : undefined;
    }
    return typeof value === "string" ? value : undefined;
};
const parseNumber = (value, fallback) => {
    if (Array.isArray(value)) {
        return parseNumber(value[0], fallback);
    }
    const parsed = typeof value === "string" ? Number(value) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
export const parseNewsQuery = (query) => {
    const page = parseNumber(query.page, 1);
    const perPage = parseNumber(query.perPage, 10);
    const sortField = parseString(query.sortField) || "createdAt";
    const sortOrder = parseString(query.sortOrder) === "asc" ? 1 : -1;
    const filters = {};
    const topic = parseString(query.topic);
    if (topic)
        filters.topic = topic;
    const typeAccount = parseString(query.typeAccount);
    if (typeAccount)
        filters.typeAccount = typeAccount;
    const userId = parseString(query.userId);
    if (userId)
        filters.userId = userId;
    const type = parseString(query.type);
    if (type)
        filters.type = type;
    return {
        pagination: { page, perPage, sort: { [sortField]: sortOrder } },
        filters,
    };
};
