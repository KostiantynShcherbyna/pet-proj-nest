export type CreateUserOutputModel = {
    id: string
    login: string
    email: string
    createdAt: string;
}

export type UsersView = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: CreateUserOutputModel[];
}