export type BlogView = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogsView = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: BlogView[];
}