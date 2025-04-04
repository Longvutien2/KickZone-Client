
'use client'
import { getTeamByUserId } from '@/api/team';
import { addBreadcrumb } from '@/features/breadcrumb.slice';
import { getMatchByIdSlice, updateMatchSlice } from '@/features/match.slice';
import { Team } from '@/models/team';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import Icon, { CalendarOutlined, ClockCircleOutlined, EditOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, Card, Form, Modal, Select } from 'antd';
import { Input } from 'antd/lib';
import moment from 'moment';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

interface FormValues {
    club_B: string;
    contactClubB: string;
}

const MatchDetail = () => {
    const match = useAppSelector((state: any) => state.match.detail)
    const auth = useAppSelector((state) => state.auth)
    const [dataTeam, setDataTeams] = useState<Team[]>();
    const router = useRouter();

    const { id } = useParams();
    const dispatch = useAppDispatch();
    const [visible, setVisible] = useState(false);


    const handleOpenModal = () => {
        if (!auth.isLoggedIn) {
            toast.warning("Bạn cần đăng nhập để tiếp tục !")
        } else if (match?.club_B) {
            toast.warning("Đã đủ đội tham gia, không thể gửi yêu cầu!")
        } else {
            setVisible(true);
        }
    };

    const handleCloseModal = () => {
        setVisible(false);
    };

    const handleSubmit = async (values: FormValues) => {
        console.log('Giá trị form:', values);
        if (match.club_A._id === values.club_B) {
            toast.warning("Bạn không thể gửi yêu cầu cho chính CLB của bạn !")
        } else {
            await dispatch(updateMatchSlice({ ...match, club_B: values.club_B, contactClubB: values.contactClubB }))
            toast.success("Gửi yêu cầu thành công!")
            router.push("/homepage/timDoi");
        }
        setVisible(false); // Đóng modal sau khi gửi yêu cầu
    };


    moment.locale('vi');
    useEffect(() => {
        const fetchData = async () => {
            const [matchData, teamData] = await Promise.all([
                dispatch(getMatchByIdSlice(id as string)),
                auth.isLoggedIn ? getTeamByUserId(auth.value.user._id as string) : null
            ]);
            if (teamData) {
                setDataTeams(teamData.data);
            }
        };
        fetchData();

        dispatch(addBreadcrumb({ name: 'Trận Đấu', url: `/homepage/timDoi/${id}` }));
    }, [id, auth.isLoggedIn]);

    return (
        <div className="bg-white mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold ">Trận Đấu</h2>
                <div className="flex items-center space-x-2">
                    <Button type="primary" className="bg-orange-500 text-white" onClick={handleOpenModal}>Gửi yêu cầu</Button>
                </div>
            </div>
            <Modal
                title={
                    <div className="text-center text-xl font-semibold">
                        Muốn giao lưu với đội này?
                    </div>
                }
                open={visible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="back" onClick={handleCloseModal} className="bg-gray-500 text-white">
                        Hủy
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        htmlType="submit" // Đảm bảo button này là submit form
                        form="requestForm" // Liên kết với form id
                        className="bg-orange-500 text-white"
                    >
                        Gửi Yêu Cầu Tham Gia
                    </Button>,
                ]}
            >
                <Form
                    id="requestForm"
                    layout="vertical"
                    onFinish={handleSubmit} // Xử lý khi form được submit
                >
                    <Form.Item
                        label="Chọn câu lạc bộ"
                        name="club_B"
                        rules={[{ required: true, message: 'Vui lòng chọn CLB!' }]}
                    >
                        <Select>
                            {
                                dataTeam && dataTeam?.map((item: Team) => (
                                    <Select.Option value={item._id}>{item.teamName}</Select.Option>
                                ))
                            }
                            {/* Thêm các lựa chọn khác nếu cần */}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số Điện Thoại"
                        name="contactClubB"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]} // Kiểm tra tính hợp lệ
                    >
                        <Input placeholder="0987654321" />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Match list */}
            <Card className="mt-8 space-y-4 mb-10 shadow">
                <div key={match._id} className="bg-white">
                    {/* 3 phần: Đội A - VS - Đội B */}
                    <div className="grid grid-cols-3 items-center mb-2">
                        {/* Đội A */}
                        <div>
                            <div className="flex items-center space-x-3">
                                <div className="relative w-20 h-20">
                                    <Image
                                        src={match.club_A?.teamImage}
                                        className="rounded-full object-cover"
                                        layout="fill"  // Lấp đầy toàn bộ container
                                        alt="bg"
                                    />
                                </div>
                                <div className="font-semibold text-sm">{match.club_A?.teamName}</div>
                            </div>
                            <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{match.club_A?.ageGroup}</span>
                                <span>⚡ 99</span>
                                <span>⭐ ?</span>
                                <span>👍 100</span>
                            </div>
                        </div>

                        {/* VS */}
                        <div className="text-center text-3xl font-bold">VS</div>

                        {/* Đội B nếu có */}
                        {match.club_B ? (
                            <div>
                                <div className="flex items-center justify-end space-x-3">
                                    <div className="font-semibold text-sm">{match.club_B?.teamName}</div>
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={match.club_B?.teamImage}
                                            className="rounded-full object-cover"
                                            layout="fill"  // Lấp đầy toàn bộ container
                                            alt="bg"
                                        />
                                    </div>
                                </div>
                                <div className='flex items-center justify-end space-x-3 text-sm mt-2 text-orange-500'>
                                    <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{match.club_B?.ageGroup}</span>
                                    <span>⚡ 99</span>
                                    <span>⭐ ?</span>
                                    <span>👍 100</span>
                                </div>
                            </div>

                        ) : (
                            <div className="flex flex-col items-end text-right">
                                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                    ?
                                </div>
                                <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                            </div>
                        )}
                    </div>

                    {/* Time + location */}
                    <div className="mt-3 text-sm text-gray-700">
                        <div className="flex items-center justify-between">
                            <span className='capitalize'>{match.time} | {moment(match.date).format('dddd, DD/MM/YYYY')}</span>
                            <span className="bg-orange-100 text-orange-500 rounded-md px-2 text-xs">
                                {match.time} ngày nữa
                            </span>
                        </div>
                        <div>{match.footballField?.name},  {` ${match.footballField?.address.detail ? `${match.footballField?.address.detail}, ` : ""} ${match.footballField?.address.ward}, ${match.footballField?.address.district}, ${match.footballField?.address.province}`}</div>
                    </div>
                </div>
            </Card>

            {/* Mô tả*/}
            <div className="bg-white mx-auto">
                <Card className="text-left">
                    <h3 className="text-xl font-bold mb-3">Thông tin</h3>
                    <div className="space-y-4">
                        {/* Ngày và Thời gian */}
                        <div className="flex items-center space-x-3">
                            <CalendarOutlined className="text-orange-500" />
                            <span className="text-sm text-gray-700 capitalize">
                                <strong>Thời gian: </strong>:
                                {moment(match.date).format('dddd - DD/MM/YYYY')}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <ClockCircleOutlined className="text-orange-500" />
                            <span className="text-sm text-gray-700">
                                <strong>Giờ đá: </strong>: {match.time} - <strong>Thời lượng</strong>: {match.duration} phút
                            </span>
                        </div>

                        {/* Sân bóng */}
                        <div className="flex items-center space-x-3">
                            <EnvironmentOutlined className="text-orange-500" />
                            <span className="text-sm text-gray-700"><strong>Sân bóng: </strong>{match.footballField?.name}</span>
                        </div>

                        {/* Địa điểm */}
                        <div className="flex items-center space-x-3">
                            <EnvironmentOutlined className="text-orange-500" />
                            <span className="text-sm text-gray-700"><strong>Địa chỉ: </strong>  {` ${match.footballField?.address.detail ? `${match.footballField?.address.detail}, ` : ""} ${match.footballField?.address.ward}, ${match.footballField?.address.district}, ${match.footballField?.address.province}`}</span>
                        </div>

                        {/* Liên hệ */}
                        <div className="flex items-center space-x-3">
                            <EditOutlined className="text-orange-500" />
                            <span className="text-sm text-gray-700"><strong>Liên hệ: </strong> {match.contact}</span>
                        </div>

                        <div className="flex items-center space-x-3">
                            <EditOutlined className="text-orange-500" />
                            <span className="text-sm text-gray-700"><strong>Mô tả: </strong> {match?.description}</span>
                        </div>
                    </div>
                </Card>

            </div>

            {/* Bình luận */}
            <div className="mt-6">
                <h3 className="font-semibold text-lg">Bình luận (0)</h3>
                <div className="flex items-center justify-between mt-2">
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Viết bình luận ..."
                    />
                </div>
            </div>
        </div>
    );
};

export default MatchDetail;
