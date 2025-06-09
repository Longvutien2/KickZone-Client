'use client'
import { Match } from '@/models/match'
import { Tag, Button, Space } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

interface MatchStatusProps {
    match: Match
    onAccept?: () => void
    onReject?: () => void
    isOwner?: boolean
}

const MatchStatus = ({ match, onAccept, onReject, isOwner }: MatchStatusProps) => {
    const getStatusTag = () => {
        switch (match.status) {
            case 'open':
                return (
                    <Tag color="blue" icon={<ExclamationCircleOutlined />}>
                        Đang tìm đối thủ
                    </Tag>
                )
            case 'pending':
                return (
                    <Tag color="orange" icon={<ClockCircleOutlined />}>
                        Chờ xác nhận
                    </Tag>
                )
            case 'confirmed':
                return (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                        Đã xác nhận
                    </Tag>
                )
            case 'cancelled':
                return (
                    <Tag color="red">
                        Đã hủy
                    </Tag>
                )
            default:
                return (
                    <Tag color="blue">
                        Đang tìm đối thủ
                    </Tag>
                )
        }
    }

    const showActionButtons = match.status === 'pending' && isOwner && match.requestedBy

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
                {getStatusTag()}
                {match.status === 'pending' && match.requestedBy && (
                    <span className="text-sm text-gray-600">
                        Có đội muốn tham gia
                    </span>
                )}
            </div>
            
            {showActionButtons && (
                <Space>
                    <Button 
                        type="primary" 
                        size="small"
                        onClick={onAccept}
                        className="bg-green-500 hover:bg-green-600"
                    >
                        Chấp nhận
                    </Button>
                    <Button 
                        size="small"
                        onClick={onReject}
                        danger
                    >
                        Từ chối
                    </Button>
                </Space>
            )}
        </div>
    )
}

export default MatchStatus
