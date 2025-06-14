import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Comment, CommentReply, CreateCommentRequest, CreateReplyRequest, UpdateCommentRequest, UpdateReplyRequest, DeleteCommentRequest, DeleteReplyRequest } from '@/models/comment';
import { 
    getCommentsByMatchId, 
    createComment, 
    updateComment, 
    deleteComment, 
    createReply, 
    updateReply, 
    deleteReply 
} from '@/api/comment';

// ==================== COMMENT ACTIONS ====================

// Action để lấy tất cả comments của một match
export const getCommentsSlice = createAsyncThunk(
    "comment/getComments",
    async (matchId: string) => {
        const response = await getCommentsByMatchId(matchId);
        return response.data;
    }
);

// Action để tạo comment mới
export const addCommentSlice = createAsyncThunk(
    "comment/addComment",
    async ({ matchId, data }: { matchId: string; data: CreateCommentRequest }) => {
        const response = await createComment(matchId, data);
        return response.data;
    }
);

// Action để cập nhật comment
export const updateCommentSlice = createAsyncThunk(
    "comment/updateComment",
    async ({ commentId, data }: { commentId: string; data: UpdateCommentRequest }) => {
        const response = await updateComment(commentId, data);
        return response.data;
    }
);

// Action để xóa comment
export const removeCommentSlice = createAsyncThunk(
    "comment/removeComment",
    async ({ commentId, data }: { commentId: string; data: DeleteCommentRequest }) => {
        await deleteComment(commentId, data);
        return commentId;
    }
);

// ==================== REPLY ACTIONS ====================

// Action để tạo reply
export const addReplySlice = createAsyncThunk(
    "comment/addReply",
    async ({ commentId, data }: { commentId: string; data: CreateReplyRequest }) => {
        const response = await createReply(commentId, data);
        return { commentId, reply: response.data };
    }
);

// Action để cập nhật reply
export const updateReplySlice = createAsyncThunk(
    "comment/updateReply",
    async ({ replyId, data }: { replyId: string; data: UpdateReplyRequest }) => {
        const response = await updateReply(replyId, data);
        return response.data;
    }
);

// Action để xóa reply
export const removeReplySlice = createAsyncThunk(
    "comment/removeReply",
    async ({ replyId, data }: { replyId: string; data: DeleteReplyRequest }) => {
        await deleteReply(replyId, data);
        return replyId;
    }
);

// ==================== SLICE ====================

interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    currentMatchId: string | null;
}

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null,
    currentMatchId: null
};

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        // Clear comments khi chuyển match
        clearComments: (state) => {
            state.comments = [];
            state.currentMatchId = null;
            state.error = null;
        },
        // Set loading state
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // ==================== GET COMMENTS ====================
        builder
            .addCase(getCommentsSlice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCommentsSlice.fulfilled, (state, action) => {
                state.loading = false;
                state.comments = action.payload || [];
                state.error = null;
            })
            .addCase(getCommentsSlice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Lỗi khi tải bình luận';
            });

        // ==================== ADD COMMENT ====================
        builder
            .addCase(addCommentSlice.pending, (state) => {
                state.loading = true;
            })
            .addCase(addCommentSlice.fulfilled, (state, action) => {
                state.loading = false;
                const newComment = { ...action.payload, replies: [] };
                state.comments.unshift(newComment); // Thêm vào đầu danh sách
            })
            .addCase(addCommentSlice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Lỗi khi thêm bình luận';
            });

        // ==================== UPDATE COMMENT ====================
        builder
            .addCase(updateCommentSlice.fulfilled, (state, action) => {
                const index = state.comments.findIndex(comment => comment._id === action.payload._id);
                if (index !== -1) {
                    state.comments[index] = { ...state.comments[index], ...action.payload };
                }
            })
            .addCase(updateCommentSlice.rejected, (state, action) => {
                state.error = action.error.message || 'Lỗi khi cập nhật bình luận';
            });

        // ==================== DELETE COMMENT ====================
        builder
            .addCase(removeCommentSlice.fulfilled, (state, action) => {
                state.comments = state.comments.filter(comment => comment._id !== action.payload);
            })
            .addCase(removeCommentSlice.rejected, (state, action) => {
                state.error = action.error.message || 'Lỗi khi xóa bình luận';
            });

        // ==================== ADD REPLY ====================
        builder
            .addCase(addReplySlice.fulfilled, (state, action) => {
                const { commentId, reply } = action.payload;
                const commentIndex = state.comments.findIndex(comment => comment._id === commentId);
                if (commentIndex !== -1) {
                    if (!state.comments[commentIndex].replies) {
                        state.comments[commentIndex].replies = [];
                    }
                    state.comments[commentIndex].replies!.push(reply);
                }
            })
            .addCase(addReplySlice.rejected, (state, action) => {
                state.error = action.error.message || 'Lỗi khi thêm trả lời';
            });

        // ==================== UPDATE REPLY ====================
        builder
            .addCase(updateReplySlice.fulfilled, (state, action) => {
                const updatedReply = action.payload;
                state.comments.forEach(comment => {
                    if (comment.replies) {
                        const replyIndex = comment.replies.findIndex(reply => reply._id === updatedReply._id);
                        if (replyIndex !== -1) {
                            comment.replies[replyIndex] = { ...comment.replies[replyIndex], ...updatedReply };
                        }
                    }
                });
            })
            .addCase(updateReplySlice.rejected, (state, action) => {
                state.error = action.error.message || 'Lỗi khi cập nhật trả lời';
            });

        // ==================== DELETE REPLY ====================
        builder
            .addCase(removeReplySlice.fulfilled, (state, action) => {
                const replyId = action.payload;
                state.comments.forEach(comment => {
                    if (comment.replies) {
                        comment.replies = comment.replies.filter(reply => reply._id !== replyId);
                    }
                });
            })
            .addCase(removeReplySlice.rejected, (state, action) => {
                state.error = action.error.message || 'Lỗi khi xóa trả lời';
            });
    },
});

export const { clearComments, setLoading, clearError } = commentSlice.actions;
export default commentSlice.reducer;
