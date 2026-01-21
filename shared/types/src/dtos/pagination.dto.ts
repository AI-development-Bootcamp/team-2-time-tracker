/**
 * Pagination metadata
 */
export interface PaginationDto {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
