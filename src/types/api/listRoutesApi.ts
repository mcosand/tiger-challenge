export interface ListRoutesItem {
  id: string;
  title: string;
  description?: string;
}

export interface ListRoutesApiResult {
  list: ListRoutesItem[];
}