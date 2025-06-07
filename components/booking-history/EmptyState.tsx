import { Empty } from 'antd';
import { BookingFilterType } from '@/types/common';

interface EmptyStateProps {
    bookingFilter: BookingFilterType;
}

const EmptyState = ({ bookingFilter }: EmptyStateProps) => {
    const getDescription = () => {
        switch (bookingFilter) {
            case 'upcoming':
                return 'Không có lịch đặt sân sắp tới';
            case 'history':
                return 'Không có lịch sử đặt sân';
            default:
                return 'Không có đơn đặt sân nào';
        }
    };

    return (
        <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
                <span className="text-gray-500">
                    {getDescription()}
                </span>
            }
            className="py-12"
        />
    );
};

export default EmptyState;
