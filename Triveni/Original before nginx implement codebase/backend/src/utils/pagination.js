const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 200;

function parsePagination(query) {
  let page = parseInt(query.page, 10);
  let pageSize = parseInt(query.pageSize, 10);
  if (!Number.isFinite(page) || page < 1) page = DEFAULT_PAGE;
  if (!Number.isFinite(pageSize) || pageSize < 1) pageSize = DEFAULT_PAGE_SIZE;
  if (pageSize > MAX_PAGE_SIZE) pageSize = MAX_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  return { page, pageSize, offset, limit: pageSize };
}

function buildMeta({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

module.exports = { parsePagination, buildMeta };
