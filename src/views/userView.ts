export type userView = {
    id: string
    login: string
    email: string
    createdAt: string;
}

export type usersView = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: userView[];
}