import { Comment } from "./Comment";

export interface CommentList {
    totalComments: number,
    comments: Array<Comment>;
}