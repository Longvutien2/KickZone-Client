import { 
    Comment, 
    CommentReply, 
    CreateCommentRequest, 
    UpdateCommentRequest, 
    CreateReplyRequest, 
    UpdateReplyRequest, 
    DeleteCommentRequest, 
    DeleteReplyRequest 
} from "@/models/comment";
import { API_NodeJS } from "./utils/axios";

// ==================== COMMENT APIs ====================

// 1. Lấy tất cả comments của một match
export const getCommentsByMatchId = (matchId: string) => {
    return API_NodeJS.get<Comment[]>(`comments/match/${matchId}`);
};

// 2. Tạo comment mới cho match
export const createComment = (matchId: string, data: CreateCommentRequest) => {
    return API_NodeJS.post<Comment>(`comments/match/${matchId}`, data);
};

// 3. Cập nhật comment
export const updateComment = (commentId: string, data: UpdateCommentRequest) => {
    return API_NodeJS.put<Comment>(`comments/${commentId}`, data);
};

// 4. Xóa comment
export const deleteComment = (commentId: string, data: DeleteCommentRequest) => {
    return API_NodeJS.delete(`comments/${commentId}`, { data });
};

// ==================== REPLY APIs ====================

// 5. Tạo reply cho comment
export const createReply = (commentId: string, data: CreateReplyRequest) => {
    return API_NodeJS.post<CommentReply>(`comments/${commentId}/replies`, data);
};

// 6. Cập nhật reply
export const updateReply = (replyId: string, data: UpdateReplyRequest) => {
    return API_NodeJS.put<CommentReply>(`comments/replies/${replyId}`, data);
};

// 7. Xóa reply
export const deleteReply = (replyId: string, data: DeleteReplyRequest) => {
    return API_NodeJS.delete(`comments/replies/${replyId}`, { data });
};

// ==================== UTILITY FUNCTIONS ====================

// 8. Lấy số lượng comments của một match
export const getCommentsCount = async (matchId: string): Promise<number> => {
    try {
        const response = await getCommentsByMatchId(matchId);
        if (response.status === 200 && response.data) {
            return response.data.length;
        }
        return 0;
    } catch (error) {
        console.error('Error getting comments count:', error);
        return 0;
    }
};

// 9. Kiểm tra user có quyền chỉnh sửa comment không
export const canEditComment = (comment: Comment, currentUserId: string): boolean => {
    if (typeof comment.userId === 'string') {
        return comment.userId === currentUserId;
    }
    return comment.userId._id === currentUserId;
};

// 10. Kiểm tra user có quyền chỉnh sửa reply không
export const canEditReply = (reply: CommentReply, currentUserId: string): boolean => {
    if (typeof reply.userId === 'string') {
        return reply.userId === currentUserId;
    }
    return reply.userId._id === currentUserId;
};

// 11. Format comment data cho UI
export const formatCommentForUI = (comment: Comment) => {
    return {
        ...comment,
        user: typeof comment.userId === 'string' ? { name: 'Unknown User' } : comment.userId,
        replies: comment.replies?.map(reply => ({
            ...reply,
            user: typeof reply.userId === 'string' ? { name: 'Unknown User' } : reply.userId
        })) || []
    };
};

// 12. Validate comment content
export const validateCommentContent = (content: string): { isValid: boolean; message?: string } => {
    if (!content || !content.trim()) {
        return { isValid: false, message: 'Nội dung bình luận không được để trống' };
    }
    
    if (content.trim().length > 1000) {
        return { isValid: false, message: 'Nội dung bình luận không được vượt quá 1000 ký tự' };
    }
    
    return { isValid: true };
};
