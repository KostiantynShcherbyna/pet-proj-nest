export type postView = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string
    blogName: string
    createdAt: string;
}

export type postsView = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: postView[];
}