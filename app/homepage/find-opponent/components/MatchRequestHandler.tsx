'use client'
import { Match } from '@/models/match'
import { Team } from '@/models/team'
import { Notification } from '@/models/notification'
import { Button, Card, Space, Tag, Avatar, Modal } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons'
import { useAppDispatch } from '@/store/hook'
import { updateMatchSlice, getListMatchByFootballFieldIdSlice } from '@/features/match.slice'
import { addNotificationSlice } from '@/features/notification.slice'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { MatchRequest } from '@/models/matchRequest'
import { deleteMatchRequest } from '@/api/matchRequest'
import { updateMatchRequestStatusSlice } from '@/features/matchRequest.slice'

interface MatchRequestHandlerProps {
    match: Match
    requestedMatch?: MatchRequest | any
    isOwner: boolean
    onRequestHandled?: () => void
}

const MatchRequestHandler = ({ match, requestedMatch, isOwner, onRequestHandled }: MatchRequestHandlerProps) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [actionType, setActionType] = useState<'accept' | 'reject'>('accept')
    // Hiển thị thông tin yêu cầu nếu có
    if (!requestedMatch) {
        return null
    }
    console.log("requestedTeamaaa2222", requestedMatch);

    const handleAcceptRequest = async () => {
        setLoading(true)
        try {
            // Cập nhật trận đấu - chấp nhận yêu cầu
            const updatedMatch = {
                ...match,
                club_B: requestedMatch.club_B, // Gán team đã gửi yêu cầu làm club_B
            }

            const result = await dispatch(updateMatchSlice(updatedMatch))

            if (result.payload) {
                // Tải lại danh sách trận đấu
                await dispatch(getListMatchByFootballFieldIdSlice("67ce9ea74c79326f98b8bf8e" as string))
                await dispatch(updateMatchRequestStatusSlice({ requestId: requestedMatch._id, status: 'accepted' }))

                // Gửi thông báo cho team đã gửi yêu cầu
                const acceptNotification: Notification = {
                    actor: 'user',
                    notificationType: 'request_accepted',
                    title: 'Yêu cầu được chấp nhận!',
                    content: `Đội "${match.club_A?.teamName}" đã chấp nhận yêu cầu tham gia trận đấu của bạn. Hãy chuẩn bị cho trận đấu!`,
                    footballfield: match.footballField,
                    club_A: match.club_A,
                    club_B: requestedMatch.club_B,
                    targetUser: requestedMatch.club_B?.user,
                    match: match,
                    orderId: match.orderId
                }
                await dispatch(addNotificationSlice(acceptNotification))

                toast.success('Đã chấp nhận yêu cầu tham gia!')
                onRequestHandled?.()
            }
        } catch (error) {
            console.error('Lỗi khi chấp nhận yêu cầu:', error)
            toast.error('Có lỗi xảy ra khi chấp nhận yêu cầu!')
        } finally {
            setLoading(false)
            setShowConfirmModal(false)
        }
    }

    const handleRejectRequest = async () => {
        setLoading(true)
        try {
            const result = await dispatch(updateMatchRequestStatusSlice({ requestId: requestedMatch._id, status: 'rejected' }))
            console.log("result", result);

            // Gửi thông báo cho team đã gửi yêu cầu
            // const rejectNotification: Notification = {
            //     actor: 'user',
            //     notificationType: 'request_rejected',
            //     title: 'Yêu cầu bị từ chối',
            //     content: `Đội "${match.club_A?.teamName}" đã từ chối yêu cầu tham gia trận đấu của bạn. Hãy tìm kiếm trận đấu khác!`,
            //     footballfield: match.footballField,
            //     club_A: match.club_A,
            //     club_B: requestedMatch.club_B,
            //     targetUser: requestedMatch.club_B?.user,
            //     match: match,
            //     orderId: match.orderId
            // }
            // await dispatch(addNotificationSlice(rejectNotification))

            // toast.success('Đã từ chối yêu cầu tham gia!')
            // onRequestHandled?.()
        } catch (error) {
            console.error('Lỗi khi từ chối yêu cầu:', error)
            toast.error('Có lỗi xảy ra khi từ chối yêu cầu!')
        } finally {
            setLoading(false)
            setShowConfirmModal(false)
        }
    }

    const showConfirm = (type: 'accept' | 'reject') => {
        setActionType(type)
        setShowConfirmModal(true)
    }

    return (
        <>
            <Card className="mb-4 border-orange-200 bg-orange-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Avatar
                            size={48}
                            src={requestedMatch.club_B.teamImage}
                            icon={<UserOutlined />}
                        />
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-base">
                                    {requestedMatch?.club_B.teamName || 'Đội bóng'}
                                </span>
                                <Tag color="orange">Yêu cầu tham gia</Tag>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <PhoneOutlined />
                                <span>{requestedMatch.club_B.contact || 'Không có thông tin'}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Trình độ: {requestedMatch?.club_B?.level} | Độ tuổi: {requestedMatch?.club_B?.ageGroup}
                            </div>
                            {match.message && (
                                <div className="text-xs text-purple-600 mt-2 italic">
                                    "{match.message}"
                                </div>
                            )}
                        </div>
                    </div>

                    {isOwner && (
                        <Space>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => showConfirm('accept')}
                                loading={loading && actionType === 'accept'}
                                className="bg-green-500 hover:bg-green-600 border-green-500"
                            >
                                Chấp nhận
                            </Button>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => showConfirm('reject')}
                                loading={loading && actionType === 'reject'}
                            >
                                Từ chối
                            </Button>
                        </Space>
                    )}
                </div>
            </Card>

            <Modal
                title={actionType === 'accept' ? 'Xác nhận chấp nhận' : 'Xác nhận từ chối'}
                open={showConfirmModal}
                onCancel={() => setShowConfirmModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowConfirmModal(false)}>
                        Hủy
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        loading={loading}
                        onClick={actionType === 'accept' ? handleAcceptRequest : handleRejectRequest}
                        className={actionType === 'accept' ? 'bg-green-500 hover:bg-green-600' : ''}
                        danger={actionType === 'reject'}
                    >
                        {actionType === 'accept' ? 'Chấp nhận' : 'Từ chối'}
                    </Button>
                ]}
            >
                <p>
                    {actionType === 'accept'
                        ? `Bạn có chắc chắn muốn chấp nhận đội "${requestedMatch?.club_B.teamName}" tham gia trận đấu?`
                        : `Bạn có chắc chắn muốn từ chối đội "${requestedMatch?.club_B.teamName}" tham gia trận đấu?`
                    }
                </p>
                {actionType === 'accept' && (
                    <p className="text-sm text-gray-600 mt-2">
                        Sau khi chấp nhận, trận đấu sẽ được xác nhận và không thể thay đổi.
                    </p>
                )}
            </Modal>
        </>
    )
}

export default MatchRequestHandler
