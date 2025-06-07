import { Tabs } from 'antd';
import { ClockCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { BookingFilterType } from '@/types/common';

const { TabPane } = Tabs;

interface OrderTabsProps {
    activeKey: BookingFilterType;
    onChange: (key: BookingFilterType) => void;
}

const OrderTabs = ({ activeKey, onChange }: OrderTabsProps) => {
    return (
        <Tabs
            activeKey={activeKey}
            onChange={(key) => onChange(key as BookingFilterType)}
            className="mb-4 sm:mb-6"
            size="large"
        >
            <TabPane
                tab={
                    <span className="flex items-center text-sm sm:text-base">
                        <ClockCircleOutlined className="mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Sắp tới</span>
                        <span className="sm:hidden">Sắp tới</span>
                    </span>
                }
                key="upcoming"
            />
            <TabPane
                tab={
                    <span className="flex items-center text-sm sm:text-base">
                        <HistoryOutlined className="mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Lịch sử</span>
                        <span className="sm:hidden">Lịch sử</span>
                    </span>
                }
                key="history"
            />
        </Tabs>
    );
};

export default OrderTabs;
