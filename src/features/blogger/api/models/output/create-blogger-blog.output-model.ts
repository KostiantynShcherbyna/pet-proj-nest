export type CreateBloggerBlogOutputModel = {
    id: string
    name: string
    description: string
    websiteUrl: string
    createdAt: string
    isMembership: boolean
}

export type BlogsOutputModel = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: CreateBloggerBlogOutputModel[];
}