'use client'
import { Match } from '@/models/match'
import { Team } from '@/models/team'
import { Notification } from '@/models/notification'
import { Button, Card, Space, Tag, Avatar, Modal, Pagination } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, UserOutlined, PhoneOutlined } from '@ant-design/icons'
import { useAppDispatch } from '@/store/hook'
import { updateMatchSlice, getListMatchByFootballFieldIdSlice } from '@/features/match.slice'
import { addNotificationSlice } from '@/features/notification.slice'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { MatchRequest } from '@/models/matchRequest'
import { deleteMatchRequest } from '@/api/matchRequest'
import { deleteMatchRequestSlice, updateMatchRequestStatusSlice } from '@/features/matchRequest.slice'

interface MatchRequestHandlerProps {
    match: Match
    requestedMatch?: MatchRequest[] | any
    isOwner: boolean
    onRequestHandled?: () => void
}

const MatchRequestHandler = ({ match, requestedMatch, isOwner, onRequestHandled }: MatchRequestHandlerProps) => {
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [actionType, setActionType] = useState<'accept' | 'reject'>('accept')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedRequest, setSelectedRequest] = useState<MatchRequest>(requestedMatch[0])
    // Hiển thị thông tin yêu cầu nếu có
    if (!requestedMatch || requestedMatch.length === 0) {
        return null
    }

    // Tính toán item hiện tại dựa trên trang
    const currentItem = requestedMatch[currentPage - 1]

    const handleAcceptRequest = async (value: MatchRequest) => {
        setLoading(true)
        try {
            // Cập nhật trận đấu - chấp nhận yêu cầu
            const updatedMatch = {
                ...match,
                club_B: value.club_B, // Gán team đã gửi yêu cầu làm club_B
            }

            const result = await dispatch(updateMatchSlice(updatedMatch))
            // cập nhật yêu cầu thành accepted và xóa các yêu cầu còn lại
            await dispatch(updateMatchRequestStatusSlice({ requestId: value._id, status: 'accepted' }))
            requestedMatch.map(async (item: MatchRequest) => {
                if (item._id !== value._id && item.match._id === match._id) {
                    await dispatch(deleteMatchRequestSlice(item._id as string))
                }
            })

            if (result.payload) {
                // Gửi thông báo cho team đã gửi yêu cầu
                const acceptNotification: Notification = {
                    actor: 'user',
                    notificationType: 'request_accepted',
                    title: 'Yêu cầu được chấp nhận!',
                    content: `Đội "${match.club_A?.teamName}" đã chấp nhận yêu cầu tham gia trận đấu của bạn. Hãy chuẩn bị cho trận đấu!`,
                    footballfield: match.footballField,
                    club_A: match.club_A,
                    club_B: currentItem.club_B,
                    targetUser: currentItem.club_B?.user,
                    match: match,
                    orderId: match.orderId
                }

                  // Gửi thông báo cho team chủ sân
                const acceptNotification2: Notification = {
                    actor: 'user',
                    notificationType: 'opponent_found',
                    title: 'Đã tìm thấy đối thủ!',
                    content: `Đã tìm thấy đối thủ cho trận đấu của bạn. Hãy chuẩn bị cho trận đấu!`,
                    footballfield: match.footballField,
                    club_A: match.club_A,
                    club_B: currentItem.club_B,
                    targetUser: match.user._id,
                    match: match,
                    orderId: match.orderId
                }
                await dispatch(addNotificationSlice(acceptNotification))
                await dispatch(addNotificationSlice(acceptNotification2))

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

    const handleRejectRequest = async (value: MatchRequest) => {
        setLoading(true)
        try {
            await dispatch(deleteMatchRequestSlice(value._id as string))

            // Gửi thông báo cho team đã gửi yêu cầu
            const rejectNotification: Notification = {
                actor: 'user',
                notificationType: 'request_rejected',
                title: 'Yêu cầu bị từ chối',
                content: `Đội "${match.club_A?.teamName}" đã từ chối yêu cầu tham gia trận đấu của bạn. Hãy tìm kiếm trận đấu khác!`,
                footballfield: match.footballField,
                club_A: match.club_A,
                club_B: currentItem.club_B,
                targetUser: currentItem.club_B?.user,
                match: match,
                orderId: match.orderId
            }
            await dispatch(addNotificationSlice(rejectNotification))

            onRequestHandled?.()
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
            <div>
                {requestedMatch.slice((currentPage - 1) * 3, currentPage * 3).map((item: MatchRequest) => (
                    <Card className="mb-4 border-orange-200 bg-orange-50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    size={48}
                                    src={item.club_B?.teamImage}
                                    icon={<UserOutlined />}
                                />
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-base">
                                            {item.club_B?.teamName || 'Đội bóng'}
                                        </span>
                                        <Tag color="orange">Yêu cầu tham gia</Tag>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        Liên hệ: 
                                        <span>{item.club_B?.contact || 'Không có thông tin'}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Trình độ: {item.club_B?.level || ''} | Độ tuổi: {item.club_B?.ageGroup || ''}
                                    </div>
                                    {item?.description && (
                                        <div className="text-xs text-purple-600 mt-1">
                                            Lời nhắn: {item.description}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {isOwner && (
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircleOutlined />}
                                        onClick={() => {
                                            setSelectedRequest(item)
                                            showConfirm('accept')
                                        }}
                                        loading={loading && actionType === 'accept'}
                                        className="bg-green-500 hover:bg-green-600 border-green-500"
                                    >
                                        Chấp nhận
                                    </Button>
                                    <Button
                                        danger
                                        icon={<CloseCircleOutlined />}
                                        onClick={() => {
                                            setSelectedRequest(item)
                                            showConfirm('reject')
                                        }}
                                        loading={loading && actionType === 'reject'}
                                    >
                                        Từ chối
                                    </Button>
                                </Space>
                            )}
                        </div>
                    </Card>
                ))

                }

                {/* Phân trang */}
                {requestedMatch.length > 3 && (
                    <div className="flex justify-center mt-4">
                        <Pagination
                            current={currentPage}
                            total={requestedMatch.length}
                            pageSize={3}
                            onChange={(page) => setCurrentPage(page)}
                            showSizeChanger={false}
                            showQuickJumper={false}
                        />
                    </div>
                )}
            </div>

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
                        onClick={() => actionType === 'accept' ? handleAcceptRequest(selectedRequest) : handleRejectRequest(selectedRequest)}
                        className={actionType === 'accept' ? 'bg-green-500 hover:bg-green-600' : ''}
                        danger={actionType === 'reject'}
                    >
                        {actionType === 'accept' ? 'Chấp nhận' : 'Từ chối'}
                    </Button>
                ]}
            >
                <p>
                    {actionType === 'accept'
                        ? `Bạn có chắc chắn muốn chấp nhận đội "${selectedRequest?.club_B?.teamName || 'Đội bóng'}" tham gia trận đấu?`
                        : `Bạn có chắc chắn muốn từ chối đội "${selectedRequest?.club_B?.teamName || 'Đội bóng'}" tham gia trận đấu?`
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
