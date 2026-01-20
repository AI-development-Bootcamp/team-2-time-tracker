export interface PaginationOptions {
    page?: number;
    pageSize?: number;
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export const getPaginationOptions = (
    query: { page?: string; pageSize?: string }
): { page: number; pageSize: number; skip: number; take: number } => {
    const page = Math.max(1, parseInt(query.page || '1'));
    const pageSize = Math.max(1, Math.min(100, parseInt(query.pageSize || '20')));
    const skip = (page - 1) * pageSize;

    return { page, pageSize, skip, take: pageSize };
};

export const createPaginationResult = <T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number
): PaginationResult<T> => {
    const totalPages = Math.ceil(total / pageSize);

    return {
        data,
        pagination: {
            page,
            pageSize,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
        },
    };
};
