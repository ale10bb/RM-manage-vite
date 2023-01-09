export interface QueueItem {
    current: number,
    id: string,
    name: string,
    pages_diff: number,
    phone: string,
    role: number,
    status: number,
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
    urgent: number
    company: string,
    names: Map<string, string>,
}

export interface UserItem {
    id: string,
    name: string,
    phone: string,
    role: number,
    status: number,
}