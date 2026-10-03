import { z } from "zod";

export const PaginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export function paginate(input: PaginationInput) {
    const { page, pageSize } = input;
    return {
        skip: (page - 1) * pageSize,
        take: pageSize,
        page,
        pageSize,
    };
}

export interface Paginated<T> {
    data: T[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

export function toPaginated<T>(
    data: T[],
    total: number,
    page: number,
    pageSize: number,
): Paginated<T> {
    return {
        data,
        meta: {
            page,
            pageSize,
            total,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
    };
}