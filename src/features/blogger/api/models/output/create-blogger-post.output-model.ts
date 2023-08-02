export type CreateBloggerPostOutputModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string
    blogName: string
    createdAt: string;
}

export type PostsView = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: CreateBloggerPostOutputModel[];
}