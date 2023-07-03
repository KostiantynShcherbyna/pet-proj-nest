export type blogView = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type blogsView = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: blogView[];
}