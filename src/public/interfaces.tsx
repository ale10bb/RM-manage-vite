export interface ProjectItem {
  id: string | number;
  author_id: string;
  author_name: string;
  reviewer_id: string;
  reviewer_name: string;
  start: number;
  end: number;
  page: number;
  urgent: 0 | 1;
  company: string;
  names: Map<string, string>;
}

export interface UserItem {
  id: string | undefined;
  name: string | undefined;
  role: 0 | 1 | undefined;
  status: 0 | 1 | 2 | undefined;
  pages_diff: number | undefined;
  current: number | undefined;
  skipped: number | undefined;
  priority: number | undefined;
}

export interface HistoryTableConfig {
  code: string;
  name: string;
  company: string;
  author: string;
  current: number;
  pageSize: number;
}

export interface MyToken {
  sub: string;
}