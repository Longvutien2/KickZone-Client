'use client'
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';
import { playNotificationSound } from '@/utils/notificationSound';



interface UseRealtimeNotificationsProps {
    userId?: string;
    matchId?: string;
    onNewMatchRequest?: (data: any) => void;
    onMatchRequestStatusUpdate?: (data: any) => void;
    onMatchRequestUpdate?: (data: any) => void;
    onMatchRequestDeleted?: (data: any) => void;
}

export const useRealtimeNotifications = ({
    userId,
    matchId,
    onNewMatchRequest,
    onMatchRequestStatusUpdate,
    onMatchRequestUpdate,
    onMatchRequestDeleted
}: UseRealtimeNotificationsProps) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!userId) return;

        // Tạo kết nối Socket.IO
        const socket = io(process.env.NEXT_PUBLIC_API_BACKEND_IO, {
            transports: ['websocket'],
            upgrade: false,
            rememberUpgrade: false,
            timeout: 20000,
            forceNew: false,
            query: {
                userId: userId
            }
        });

        socketRef.current = socket;

        // Lắng nghe yêu cầu thi đấu mới (cho chủ sân)
        socket.on('newMatchRequest', (data: any) => {
            if (data.targetUserId === userId && (!matchId || data.matchRequest?.match?._id === matchId)) {
                // Phát âm thanh thông báo
                playNotificationSound();

                // Hiển thị toast notification
                toast.success(data.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Callback tùy chỉnh
                onNewMatchRequest?.(data);
            }
        });

        // Lắng nghe cập nhật trạng thái yêu cầu (cho người gửi yêu cầu)
        socket.on('matchRequestStatusUpdate', (data: any) => {
            if (data.targetUserId === userId && (!matchId || data.matchRequest?.match?._id === matchId)) {
                // Phát âm thanh thông báo
                playNotificationSound();

                // Hiển thị toast notification với màu khác nhau
                const toastType = data.status === 'accepted' ? toast.success : toast.warning;
                toastType(data.message, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });

                // Callback tùy chỉnh
                onMatchRequestStatusUpdate?.(data);
            }
        });

        // Lắng nghe cập nhật yêu cầu (cho chủ sân)
        socket.on('matchRequestUpdate', (data: any) => {
            if (data.targetUserId === userId && (!matchId || data.matchRequest?.match?._id === matchId)) {
                // Callback tùy chỉnh (không hiển thị thông báo cho update)
                onMatchRequestUpdate?.(data);
            }
        });

        // Lắng nghe xóa yêu cầu
        socket.on('matchRequestDeleted', (data: any) => {
            if (data.targetUserId === userId && (!matchId || data.matchId === matchId)) {
                toast.info(data.message, {
                    position: "top-right",
                    autoClose: 3000,
                });

                // Callback tùy chỉnh
                onMatchRequestDeleted?.(data);
            }
        });

        // Cleanup khi component unmount
        return () => {
            socket.off('newMatchRequest');
            socket.off('matchRequestStatusUpdate');
            socket.off('matchRequestUpdate');
            socket.off('matchRequestDeleted');
            socket.disconnect();
        };
    }, [userId, matchId, onNewMatchRequest, onMatchRequestStatusUpdate, onMatchRequestUpdate, onMatchRequestDeleted]);

    return {
        socket: socketRef.current,
        disconnect: () => socketRef.current?.disconnect(),
    };
};

export default useRealtimeNotifications;
