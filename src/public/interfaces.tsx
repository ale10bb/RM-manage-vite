export interface QueueItem {
    id: string,
    name: string,
    role: 0 | 1,
    status: 0 | 1 | 2,
    pages_diff: number,
    current: number,
    skipped: 0 | 1,
}

export interface ProjectItem {
    id: number | string,
    author_id: string,
    author_name: string,
    reviewer_id: string,
    reviewer_name: string,
    start: number,
    end: number,
    page: number,
    urgent: 0 | 1
    company: string,
    names: Map<string, string>,
}

export interface UserItem {
    id: string,
    name: string,
    role: 0 | 1,
    status: 0 | 1 | 2,
}