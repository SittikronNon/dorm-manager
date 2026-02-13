

export type StatusFilter = 'all' | 'active' | 'inactive';

export function isStatusFilter(value: string | null): value is StatusFilter {
    return value === "all" || value === "active" || value === "inactive";
}