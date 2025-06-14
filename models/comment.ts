import { IUser } from "./auth";

export interface Comment {
    _id: string;
    matchId: string;
    userId: IUser | string;
    content: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    replies?: CommentReply[];
}

export interface CommentReply {
    _id: string;
    commentId: string;
    userId: IUser | string;
    content: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// DTOs for API requests
export interface CreateCommentRequest {
    content: string;
    userId: string;
}

export interface UpdateCommentRequest {
    content: string;
    userId: string;
}

export interface CreateReplyRequest {
    content: string;
    userId: string;
}

export interface UpdateReplyRequest {
    content: string;
    userId: string;
}

export interface DeleteCommentRequest {
    userId: string;
}

export interface DeleteReplyRequest {
    userId: string;
}
