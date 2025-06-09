'use client'
import { setBreadcrumb } from '@/features/breadcrumb.slice'

import { useAppDispatch } from '@/store/hook'
import { Tabs, Select } from 'antd'
import { useEffect } from 'react'
import MainContent from './components/MainContent'
import MyTeamTab from './components/MyTeamTab'

export default function Home() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setBreadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Tìm đối', url: '/homepage/find-opponent' },
        ]));
    }, [dispatch])

    return (
        <div className="bg-white min-h-screen px-4 sm:px-0">
            {/* Header - time only */}
            <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Tìm đối</h1>
            <Tabs
                defaultActiveKey="1"
                centered
                className="border-gray-200"
                tabBarGutter={24}
                tabBarStyle={{ marginBottom: 0 }}
                items={[
                    {
                        key: "1",
                        label: <span className="text-sm sm:text-base font-medium">Cộng Đồng</span>,
                        children: <MainContent />
                    },
                    {
                        key: "2",
                        label: <span className="text-sm sm:text-base font-medium">Của Tôi</span>,
                        children: <MyTeamTab />
                    }
                ]}
            />
        </div>
    )
}
const { Option } = Select;
