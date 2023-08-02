export type CommentsView = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: GetCommentsOutputModel[]
}
export type GetCommentsOutputModel = {
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



