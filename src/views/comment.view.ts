export type CommentsView = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: CommentView[]
}
export type CommentView = {
    id: string,
    content: string,
    commentatorInfo: CommentatorInfo,
    createdAt: string,
    likesInfo: LikesInfo
}
export type CommentatorInfo = {
    userId: string,
    userLogin: string
}
export type LikesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
}



