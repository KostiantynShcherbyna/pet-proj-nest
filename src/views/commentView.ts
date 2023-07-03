
export type commentsView = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: commentView[]
}
export type commentView = {
    id: string,
    content: string,
    commentatorInfo: commentatorInfo,
    createdAt: string,
    likesInfo: likesInfo
}
export type commentatorInfo = {
    userId: string,
    userLogin: string
}
export type likesInfo = {
    likesCount: number,
    dislikesCount: number,
    myStatus: string,
}



