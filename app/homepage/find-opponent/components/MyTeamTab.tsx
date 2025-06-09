'use client'
import { getTeamByUserId } from '@/api/team'
import { Match } from '@/models/match'
import { Team } from '@/models/team'
import { useAppSelector } from '@/store/hook'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Pagination, Tabs } from 'antd'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo, memo } from 'react'
import MatchCard from './MatchCard'

const MyTeamTab = memo(() => {
    const router = useRouter()
    const matchs = useAppSelector(state => state.match.value)
    const auth = useAppSelector(state => state.auth)
    const [myTeam, setmyTeam] = useState<Team>();
    const [matchsHome, setMatchsHome] = useState<Match[]>([]);
    const [matchsAway, setMatchsAway] = useState<Match[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    const handleCreateMatch = () => {
        // Chuyển đến trang tạo trận đấu mới
        router.push('/homepage/find-opponent/add')
    }

    useEffect(() => {
        const getData = async () => {
            if (!auth.value.user._id || !matchs || matchs.length === 0) return;
            
            const data = await getTeamByUserId(auth.value.user._id as string)
            if (data.data.length > 0) {
                // Lấy tất cả ID của các đội của người dùng
                const myTeamIds = data.data.map(team => team._id);

                // Lọc bỏ các trận đấu trong quá khứ - chỉ lấy từ ngày hiện tại trở đi
                const today = moment().startOf('day');
                const futureMatches = matchs?.filter((match: Match) => {
                    // Nếu có orderId.date, sử dụng nó
                    if (match.orderId?.date) {
                        const matchDate = moment(match.orderId.date, "DD-MM-YYYY").startOf('day');
                        return matchDate.isSameOrAfter(today);
                    }
                    return false; // Nếu không có ngày, loại bỏ
                });

                // Lọc tất cả các trận đấu có club_A._id nằm trong danh sách myTeamIds
                const matchesForMyTeamsHome = futureMatches.filter((item: Match) =>
                    item.club_A && myTeamIds.includes(item.club_A._id)
                );
                const matchesForMyTeamsAway = futureMatches.filter((item: Match) =>
                    item.club_B && myTeamIds.includes(item.club_B._id)
                );

                setMatchsHome(matchesForMyTeamsHome);
                setMatchsAway(matchesForMyTeamsAway);
                setmyTeam(data.data[0]); // Vẫn giữ đội đầu tiên làm đội mặc định
            }
        }
        getData();
    }, [matchs, auth.value.user._id]);

    // Paginated matches for home team - Optimized with useMemo
    const paginatedHomeMatches = useMemo(() => {
        return matchsHome.slice((currentPage - 1) * 5, currentPage * 5);
    }, [matchsHome, currentPage]);

    // Paginated matches for away team - Optimized with useMemo
    const paginatedAwayMatches = useMemo(() => {
        return matchsAway.slice((currentPage - 1) * 5, currentPage * 5);
    }, [matchsAway, currentPage]);

    const CreateMatchButton = memo(() => (
        <div className="flex flex-col items-center justify-center text-center px-4">
            <Button
                type="primary"
                className="bg-orange-500 mt-4 px-4 sm:px-6 rounded-full h-10 sm:h-12 flex items-center text-sm sm:text-base"
                icon={<PlusOutlined className="text-base sm:text-xl mr-1" />}
                onClick={handleCreateMatch}
                size="large"
            >
                <span className="hidden sm:inline">Tạo Trận Đấu Mới</span>
                <span className="sm:hidden">Tạo Trận Đấu</span>
            </Button>
        </div>
    ));

    const EmptyState = memo(() => (
        <div className="flex flex-col items-center justify-center text-center mt-8 sm:mt-10 px-4">
            <p className="text-gray-500 mb-2 text-xs sm:text-sm leading-relaxed">
                Chưa có trận đấu nào? Bắt đầu tạo trận đấu mới để tham gia vào bảng xếp hạng của Sporta ngay!
            </p>
            <CreateMatchButton />
        </div>
    ));

    const MatchList = memo(({ matches, title }: { matches: Match[], title: string }) => (
        <div>
            {auth.isLoggedIn ? (
                <div>
                    <div className="mt-6 sm:mt-8 px-0 sm:px-4 space-y-3 sm:space-y-4 pb-10">
                        {matches.map((match: Match) => (
                            <MatchCard key={match._id} match={match} />
                        ))}

                        <div className="flex justify-center mt-4">
                            <Pagination
                                current={currentPage}
                                total={matches.length}
                                pageSize={5}
                                onChange={(page) => setCurrentPage(page)}
                                hideOnSinglePage={true}
                            />
                        </div>
                    </div>
                    <CreateMatchButton />
                </div>
            ) : (
                <EmptyState />
            )}
        </div>
    ));

    return (
        <div className="mt-4 sm:mt-6 px-0 sm:px-4">
            <Tabs
                defaultActiveKey="home"
                centered
                tabBarGutter={20}
                items={[
                    {
                        key: 'home',
                        label: <span className="text-xs sm:text-sm font-medium">Vai Trò Đội Nhà</span>,
                        children: <MatchList matches={paginatedHomeMatches} title="Đội Nhà" />
                    },
                    {
                        key: 'away',
                        label: <span className="text-xs sm:text-sm font-medium">Vai Trò Đội Khách</span>,
                        children: <MatchList matches={paginatedAwayMatches} title="Đội Khách" />
                    }
                ]}
            />
        </div>
    )
})

MyTeamTab.displayName = 'MyTeamTab'

export default MyTeamTab
