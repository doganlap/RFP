/**
 * Pagination Utilities
 */

/**
 * Get pagination parameters for API calls
 */
export const getPaginationParams = (currentPage: number = 1, pageSize: number = 10) => {
  return {
    page: Math.max(1, currentPage),
    limit: pageSize,
    offset: Math.max(0, (currentPage - 1) * pageSize),
  };
};

/**
 * Calculate total pages
 */
export const calculateTotalPages = (totalItems: number, pageSize: number) => {
  if (totalItems === 0) return 1;
  return Math.ceil(totalItems / pageSize);
};

/**
 * Get previous page number
 */
export const getPreviousPage = (currentPage: number) => {
  return Math.max(1, currentPage - 1);
};

/**
 * Get next page number
 */
export const getNextPage = (currentPage: number, totalPages: number) => {
  return Math.min(totalPages, currentPage + 1);
};

/**
 * Check if has previous page
 */
export const hasPreviousPage = (currentPage: number) => {
  return currentPage > 1;
};

/**
 * Check if has next page
 */
export const hasNextPage = (currentPage: number, totalPages: number) => {
  return currentPage < totalPages;
};

/**
 * Generate array of page numbers to display
 * Shows current page and 2 pages on each side, with ellipsis for large gaps
 */
export const generatePageNumbers = (currentPage: number, totalPages: number, siblingsCount: number = 2) => {
  const totalPageNumbers = siblingsCount + 5; // current + 4 + siblingsCount

  if (totalPages <= totalPageNumbers) {
    // Show all pages if total is small
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const leftDots = '...';
  const rightDots = '...';

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftItemCount = 3 + 2 * siblingsCount;
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
    return [...leftRange, rightDots, totalPages];
  }

  if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightItemCount = 3 + 2 * siblingsCount;
    const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1);
    return [1, leftDots, ...rightRange];
  }

  if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from({ length: 1 + 2 * siblingsCount }, (_, i) => leftSiblingIndex + i);
    return [1, leftDots, ...middleRange, rightDots, totalPages];
  }

  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

/**
 * Sort array of items
 */
export const sortItems = (items: any[], sortBy: string, sortOrder: string = 'asc') => {
  const sorted = [...items];

  sorted.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];

    // Handle different types
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Filter items by search query
 */
export const filterBySearch = (items: any[], query: string, searchFields: string[] = ['name', 'title', 'description']) => {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter((item) => {
    return searchFields.some((field) => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(lowerQuery);
    });
  });
};

/**
 * Paginate items
 */
export const paginateItems = (items: any[], currentPage: number = 1, pageSize: number = 10) => {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
};

/**
 * Get pagination info
 */
export const getPaginationInfo = (items: any[], currentPage: number, pageSize: number) => {
  const total = items.length;
  const totalPages = calculateTotalPages(total, pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const itemsOnPage = endIndex - startIndex;

  return {
    currentPage,
    pageSize,
    totalItems: total,
    totalPages,
    startIndex,
    endIndex,
    itemsOnPage,
    hasPreviousPage: hasPreviousPage(currentPage),
    hasNextPage: hasNextPage(currentPage, totalPages),
  };
};

/**
 * Process items with pagination, sorting, and filtering
 */
interface ProcessItemsOptions {
  searchQuery?: string;
  searchFields?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  currentPage?: number;
  pageSize?: number;
}

export const processItems = <T>(
  items: T[],
  {
    searchQuery = '',
    searchFields = ['name'],
    sortBy = 'name',
    sortOrder = 'asc',
    currentPage = 1,
    pageSize = 10,
  }: ProcessItemsOptions = {}
) => {
  // Filter
  let processed = filterBySearch(items, searchQuery, searchFields) as T[];

  // Sort
  processed = sortItems(processed, sortBy, sortOrder) as T[];

  // Get pagination info
  const info = getPaginationInfo(processed, currentPage, pageSize);

  // Paginate
  const paginated = paginateItems(processed, currentPage, pageSize) as T[];

  return {
    items: paginated,
    info,
  };
};
