'use client';
import { useState, useEffect, useMemo } from 'react';
import { Card, Typography, Button, Table, Modal, DatePicker, Space, message, Tabs } from 'antd';
import { CalendarOutlined, TeamOutlined, PhoneOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { FootballField } from '@/models/football_field';
import { getListMatchByFootballFieldIdSlice } from '@/features/match.slice';

const { Title, Text } = Typography;

const { TabPane } = Tabs;

import { Match } from '@/models/match';

const MatchManagement = () => {
    const [loading, setLoading] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
    const [activeTab, setActiveTab] = useState<string>('today');

    const dispatch = useAppDispatch();
    const footballField = useAppSelector((state) => state.footballField?.detail) as FootballField;
    const matches = useAppSelector((state) => state.match?.value) as Match[] || [];

    // Fetch matches
    const fetchMatches = async () => {
        if (!footballField?._id) return;

        setLoading(true);
        try {
            await dispatch(getListMatchByFootballFieldIdSlice(footballField._id));
        } catch (error) {
            console.error('Error fetching matches:', error);
            message.error('Không thể tải danh sách trận đấu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("useEffect triggered, footballField._id:", footballField?._id);
        fetchMatches();
    }, [footballField?._id, selectedDate]);

    // Debug Redux state
    useEffect(() => {
        console.log("Redux state changed:");
        console.log("- footballField:", footballField);
        console.log("- matches:", matches);
    }, [footballField, matches]);

    // Tính toán filtered matches cho từng tab
    const filteredMatchesData = useMemo(() => {
        const now = dayjs();
        const today = now.startOf('day');

        // 1. Nếu chọn ngày cụ thể từ DatePicker
        if (selectedDate) {
            const filtered = matches.filter(match => {
                if (!match?.orderId?.date) return false;
                const matchDate = dayjs(match.orderId.date, 'DD-MM-YYYY').startOf('day');
                return matchDate.isSame(selectedDate, 'day');
            });
            console.log(`Filtered by selectedDate: ${filtered.length} matches`);
            return {
                all: filtered,
                today: filtered,
                upcoming: filtered,
                past: filtered
            };
        }

        // 2. Lọc theo từng tab
        const todayMatches = matches.filter(match => {
            if (!match?.orderId?.date) return false;
            const matchDate = dayjs(match.orderId.date, 'DD-MM-YYYY').startOf('day');
            const isToday = matchDate.isSame(today, 'day');
            return isToday;
        });

        const upcomingMatches = matches.filter(match => {
            if (!match?.orderId?.date) return false;
            const matchDate = dayjs(match.orderId.date, 'DD-MM-YYYY').startOf('day');
            const isAfter = matchDate.isAfter(today);
            return isAfter;
        });

        const pastMatches = matches.filter(match => {
            if (!match?.orderId?.date) return false;
            const matchDate = dayjs(match.orderId.date, 'DD-MM-YYYY').startOf('day');
            const isBefore = matchDate.isBefore(today);
            return isBefore;
        }).sort((a, b) => {
            // Sắp xếp giảm dần theo ngày (gần nhất trước)
            const dateA = dayjs(a.orderId?.date, 'DD-MM-YYYY');
            const dateB = dayjs(b.orderId?.date, 'DD-MM-YYYY');
            return dateB.valueOf() - dateA.valueOf();
        });

        return {
            all: matches,
            today: todayMatches,
            upcoming: upcomingMatches,
            past: pastMatches
        };
    }, [matches, selectedDate, activeTab]);

    const columns = [
        {
            title: 'Ngày giờ',
            key: 'datetime',
            render: (record: Match) => (
                <div>
                    <div className="font-medium">
                        <CalendarOutlined className="mr-2" />
                        {record.orderId?.date ? dayjs(record.orderId.date, 'DD-MM-YYYY').format('DD/MM/YYYY') : 'N/A'}
                    </div>
                    <div className="text-gray-500">
                        <ClockCircleOutlined className="mr-2" />
                        {record.orderId?.timeStart}
                    </div>
                </div>
            ),
        },
        {
            title: 'Đội bóng',
            key: 'teams',
            render: (record: Match) => (
                <div className="flex items-center gap-3">
                    {/* Đội A */}
                    <div className="flex items-center gap-2">
                        <img
                            src={record.club_A?.teamImage || ''}
                            alt={record.club_A?.teamName || 'Đội A'}
                            className="w-8 h-8 rounded object-cover"
                            onError={(e) => {
                                e.currentTarget.src = '';
                            }}
                        />
                        <div>
                            <div className="font-medium text-sm">
                                {record.club_A?.teamName || 'Đội A'}
                            </div>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-gray-400 font-bold text-xs">VS</div>

                    {/* Đội B */}
                    {record.club_B ? (
                        <div className="flex items-center gap-2">
                            <img
                                src={record.club_B.teamImage || ''}
                                alt={record.club_B.teamName}
                                className="w-8 h-8 rounded object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '';
                                }}
                            />
                            <div>
                                <div className="font-medium text-sm">
                                    {record.club_B.teamName}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                                <TeamOutlined className="text-gray-400 text-xs" />
                            </div>
                            <div className="text-orange-500 text-sm">
                                Đang tìm đối thủ
                            </div>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (record: Match) => (
                <div>
                    <div>
                        {record.club_A?.contact}
                    </div>
                    {record.club_B?.contact && (
                        <div className="text-gray-600">
                            {record.club_B?.contact}
                        </div>
                    )}
                </div>
            ),
        },

        {
            title: 'Thao tác',
            key: 'actions',
            render: (record: Match) => (
                <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setSelectedMatch(record);
                        setModalVisible(true);
                    }}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Card className="shadow-sm rounded-xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <Title level={4} className="text-gray-800 font-bold mb-0">
                            Quản lý trận đấu - {footballField.name}
                        </Title>
                        <p className="text-gray-500 text-sm mt-1">
                            Quản lý tất cả trận đấu tại sân
                        </p>
                    </div>

                    <Space>
                        <DatePicker
                            placeholder="Chọn ngày cụ thể"
                            value={selectedDate}
                            onChange={setSelectedDate}
                            allowClear
                        />
                    </Space>
                </div>

                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    <TabPane tab="Hôm nay" key="today">
                        <Table
                            columns={columns}
                            dataSource={filteredMatchesData.today}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                    <TabPane tab="Sắp tới" key="upcoming">
                        <Table
                            columns={columns}
                            dataSource={filteredMatchesData.upcoming}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                    <TabPane tab="Đã qua" key="past">
                        <Table
                            columns={columns}
                            dataSource={filteredMatchesData.past}
                            rowKey="_id"
                            loading={loading}
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* Modal xem chi tiết */}
            <Modal
                title="Chi tiết trận đấu"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedMatch && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text strong>Ngày thi đấu:</Text>
                                <div>{selectedMatch.orderId?.date ? selectedMatch.orderId.date : 'N/A'}</div>
                            </div>
                            <div>
                                <Text strong>Giờ thi đấu:</Text>
                                <div>{selectedMatch.orderId?.timeStart}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mt-2">
                                    <img
                                        src={selectedMatch.club_A?.teamImage || ''}
                                        alt={selectedMatch.club_A?.teamName || 'Đội A'}
                                        className="w-10 h-10 rounded object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '';
                                        }}
                                    />
                                    <span>{selectedMatch.club_A?.teamName || 'Chưa có thông tin'}</span>
                                </div>
                            </div>

                            {selectedMatch.club_B && (
                                <div >
                                    <div className="flex items-center gap-2 mt-2">
                                        <img
                                            src={selectedMatch.club_B.teamImage || ''}
                                            alt={selectedMatch.club_B.teamName}
                                            className="w-10 h-10 rounded object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '';
                                            }}
                                        />
                                        <span>{selectedMatch.club_B.teamName}</span>
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text strong>Liên hệ:</Text>
                                <div>{selectedMatch.club_A?.contact}</div>
                            </div>
                            {selectedMatch.club_B?.contact && (
                                <div>
                                    <Text strong>Liên hệ:</Text>
                                    <div>{selectedMatch.club_B?.contact}</div>
                                </div>
                            )}
                        </div>


                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text strong>Lứa tuổi: </Text>
                                <div>{selectedMatch.club_A.ageGroup}</div>
                            </div>
                            {selectedMatch.club_B?.ageGroup && (
                                <div>
                                    <Text strong>Lứa tuổi:</Text>
                                    <div>{selectedMatch.club_B?.ageGroup}</div>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text strong>Trình độ: </Text>
                                <div>{selectedMatch.club_A.level}</div>
                            </div>
                            {selectedMatch.club_B?.level && (
                                <div>
                                    <Text strong>Trình độ:</Text>
                                    <div>{selectedMatch.club_B?.level}</div>
                                </div>
                            )}
                        </div>

                        {selectedMatch.description && (
                            <div>
                                <Text strong>Ghi chú:</Text>
                                <div>{selectedMatch.description}</div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>


        </div>
    );
};

export default MatchManagement;
