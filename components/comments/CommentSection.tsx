'use client'
import { UserOutlined, MessageOutlined } from '@ant-design/icons';
import { Button, Card, Avatar, Input, Spin } from 'antd';
import moment from 'moment';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import {
    getCommentsSlice,
    addCommentSlice,
    addReplySlice,
    clearComments
} from '@/features/comment.slice';

interface CommentSectionProps {
    matchId: string;
    isLoggedIn: boolean;
    currentUser?: {
        name?: string;
        _id?: string;
        image?: string;
    };
}

const CommentSection = ({ matchId, isLoggedIn, currentUser }: CommentSectionProps) => {
    // Redux
    const dispatch = useAppDispatch();
    const { comments, loading } = useAppSelector((state) => state.comment);

    // States cho bình luận
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyContent, setReplyContent] = useState('');

    // Load comments khi component mount hoặc matchId thay đổi
    useEffect(() => {
        if (matchId) {
            dispatch(getCommentsSlice(matchId));
        }

        // Cleanup khi unmount hoặc chuyển match
        return () => {
            dispatch(clearComments());
        };
    }, [matchId, dispatch]);

    // Xử lý gửi bình luận
    const handleSubmitComment = async () => {
        if (!newComment.trim()) {
            toast.warning("Vui lòng nhập nội dung bình luận!");
            return;
        }

        if (!isLoggedIn || !currentUser?._id) {
            toast.warning("Bạn cần đăng nhập để bình luận!");
            return;
        }

        try {
            await dispatch(addCommentSlice({
                matchId,
                data: {
                    content: newComment.trim(),
                    userId: currentUser._id
                }
            })).unwrap();

            setNewComment('');
            toast.success("Đã thêm bình luận!");
        } catch (error) {
            toast.error("Lỗi khi thêm bình luận!");
            console.error('Error adding comment:', error);
        }
    };

    // Xử lý trả lời bình luận
    const handleReply = (commentId: string) => {
        setReplyingTo(commentId);
        setReplyContent('');
    };

    const handleSubmitReply = async (commentId: string) => {
        if (!replyContent.trim()) {
            toast.warning("Vui lòng nhập nội dung trả lời!");
            return;
        }

        if (!isLoggedIn || !currentUser?._id) {
            toast.warning("Bạn cần đăng nhập để trả lời!");
            return;
        }

        try {
            await dispatch(addReplySlice({
                commentId,
                data: {
                    content: replyContent.trim(),
                    userId: currentUser._id
                }
            })).unwrap();

            setReplyContent('');
            setReplyingTo(null);
            toast.success("Đã thêm trả lời!");
        } catch (error) {
            toast.error("Lỗi khi thêm trả lời!");
            console.error('Error adding reply:', error);
        }
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
        setReplyContent('');
    };

    return (
        <div className="mt-6">
            <Card className="rounded-lg sm:rounded-xl">
                <h3 className="font-semibold text-lg mb-4">Bình luận ({comments.length})</h3>

                {/* Form thêm bình luận */}
                <div className="mb-6">
                    <div className="flex items-start gap-4">
                        <Avatar
                            size={40}
                            src={currentUser?.image}
                            icon={!currentUser?.image ? <UserOutlined /> : undefined}
                            className="flex-shrink-0 mt-1"
                            shape="square"
                        />
                        <div className="flex-1">
                            <Input.TextArea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmitComment();
                                    }
                                }}
                                placeholder="Nhập bình luận của bạn..."
                                rows={3}
                                className="resize-none"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Danh sách bình luận */}
                <div className="space-y-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <Spin size="large" />
                            <p className="mt-2 text-gray-500">Đang tải bình luận...</p>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="text-4xl mb-2">💬</div>
                            <p>Chưa có bình luận nào</p>
                            <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
                        </div>
                    ) : (
                        comments.map((comment: any) => {
                            const user = typeof comment.userId === 'object' ? comment.userId : { name: 'Unknown User' };
                            return (
                                <div key={comment._id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                    {/* Bình luận chính */}
                                    <div className="flex items-start gap-4">
                                        <Avatar
                                            size={40}
                                            src={user.image || user.avatar}
                                            icon={!user.image && !user.avatar ? <UserOutlined /> : undefined}
                                            className="flex-shrink-0 mt-1"
                                            shape="square"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-medium text-sm text-blue-600">{user.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    {moment(comment.createdAt).format('HH:mm, DD-MM-YYYY')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 leading-relaxed mb-1">
                                                {comment.content}
                                            </p>

                                            {/* Nút trả lời */}
                                            <div className="flex items-center space-x-4">
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    icon={<MessageOutlined />}
                                                    onClick={() => handleReply(comment._id)}
                                                    className="text-gray-500 hover:text-orange-500 p-0 h-auto"
                                                    disabled={loading}
                                                >
                                                    <span className="text-xs">Trả lời</span>
                                                </Button>
                                            </div>

                                            {/* Form trả lời */}
                                            {replyingTo === comment._id && (
                                                <div className="mt-4 pl-4 border-l-2 border-gray-200">
                                                    <div className="flex items-start gap-3">
                                                        <Avatar
                                                            size={32}
                                                            src={currentUser?.image}
                                                            icon={!currentUser?.image ? <UserOutlined /> : undefined}
                                                            className="flex-shrink-0 mt-1"
                                                            shape="square"
                                                        />
                                                        <div className="flex-1">
                                                            <Input.TextArea
                                                                value={replyContent}
                                                                onChange={(e) => setReplyContent(e.target.value)}
                                                                onPressEnter={(e) => {
                                                                    if (!e.shiftKey) {
                                                                        e.preventDefault();
                                                                        handleSubmitReply(comment._id);
                                                                    }
                                                                }}
                                                                placeholder="Nhập câu trả lời của bạn..."
                                                                rows={2}
                                                                className="resize-none"
                                                            />
                                                            <div className="flex justify-end space-x-2 mt-2">
                                                                <Button
                                                                    size="small"
                                                                    onClick={handleCancelReply}
                                                                >
                                                                    Hủy
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Hiển thị các trả lời */}
                                            {comment.replies && comment.replies.length > 0 && (
                                                <div className="mt-2 space-y-3">
                                                    {comment.replies.map((reply: any) => {
                                                        const replyUser = typeof reply.userId === 'object' ? reply.userId : { name: 'Unknown User' };
                                                        return (
                                                            <div key={reply._id} className="flex items-start gap-3 pl-4 border-l-2 border-gray-200">
                                                                <Avatar
                                                                    size={32}
                                                                    src={replyUser.image || replyUser.avatar}
                                                                    icon={!replyUser.image && !replyUser.avatar ? <UserOutlined /> : undefined}
                                                                    className="flex-shrink-0 mt-1"
                                                                    shape="square"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className="font-medium text-sm text-blue-600">{replyUser.name}</span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {moment(reply.createdAt).format('HH:mm, DD-MM-YYYY')}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-gray-700 leading-relaxed">
                                                                        {reply.content}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>
        </div>
    );
};

export default CommentSection;
