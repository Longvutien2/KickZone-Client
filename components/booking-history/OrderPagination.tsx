import { Pagination } from 'antd';

interface OrderPaginationProps {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
}

const OrderPagination = ({ current, total, pageSize, onChange }: OrderPaginationProps) => {
    if (total <= pageSize) return null;

    return (
        <div className="flex justify-center mt-4 sm:mt-6">
            <Pagination
                current={current}
                total={total}
                pageSize={pageSize}
                onChange={onChange}
                className="custom-pagination"
                size="small"
                showSizeChanger={false}
                showQuickJumper={false}
                responsive={true}
            />
        </div>
    );
};

export default OrderPagination;
