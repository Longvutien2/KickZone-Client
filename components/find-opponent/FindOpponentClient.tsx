'use client'
import MainContent from '@/components/find-opponent/MainContent'
import MyTeamTab from '@/components/find-opponent/MyTeamTab'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { useAppDispatch } from '@/store/hook'
import { Tabs } from 'antd'
import { useEffect } from 'react'

interface FindOpponentClientProps {
  initialData: {
    matches: any[];
    addresses: any[];
    timeSlots: any[];
  };
}

export default function FindOpponentClient({ initialData }: FindOpponentClientProps) {
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
                        children: <MainContent initialData={initialData} />
                    },
                    {
                        key: "2",
                        label: <span className="text-sm sm:text-base font-medium">Của Tôi</span>,
                        children: <MyTeamTab initialData={initialData} />
                    }
                ]}
            />
        </div>
    )
}
