export type BannedBlogUsersView = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BannedBlogUserView[]
}
export type BannedBlogUserView = {
    id: string,
    login: string,
    banInfo: {
        isBanned: boolean,
        banDate: string | null,
        banReason: string | null,
    }
}



