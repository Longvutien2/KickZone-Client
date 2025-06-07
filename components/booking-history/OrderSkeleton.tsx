import { Skeleton } from 'antd';

const OrderSkeleton = () => (
    <div className="space-y-3 sm:space-y-4">
        {[1, 2, 3].map((item) => (
            <div key={item} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-2">
                    <Skeleton.Input style={{ width: 200 }} active />
                    <Skeleton.Button style={{ width: 80 }} active />
                </div>
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-3 lg:gap-4">
                    <div className="space-y-2">
                        <Skeleton.Input style={{ width: '100%' }} active />
                        <Skeleton.Input style={{ width: '80%' }} active />
                        <Skeleton.Input style={{ width: '90%' }} active />
                    </div>
                    <div className="flex flex-row lg:flex-col justify-between lg:justify-start items-center lg:items-end">
                        <Skeleton.Button style={{ width: 100 }} active />
                        <Skeleton.Input style={{ width: 120 }} active />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export default OrderSkeleton;
