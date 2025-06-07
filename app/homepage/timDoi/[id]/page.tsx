
'use client'
import { getTeamByUserId } from '@/api/team';
import { addBreadcrumb } from '@/features/breadcrumb.slice';
import { getListMatchByFootballFieldIdSlice, getMatchByIdSlice, updateMatchSlice } from '@/features/match.slice';
import { addNotificationSlice } from '@/features/notification.slice';
import { Notification } from '@/models/notification';
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
import dayjs from 'dayjs';

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
    dayjs.locale("vi");


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
        if (match.club_A._id === values.club_B) {
            toast.warning("Bạn không thể gửi yêu cầu cho chính CLB của bạn !")
        } else {
            const data = await dispatch(updateMatchSlice({ ...match, club_B: values.club_B, contactClubB: values.contactClubB }))
            toast.success("Gửi yêu cầu thành công!")
            if (data.payload) {
                await dispatch(getListMatchByFootballFieldIdSlice("67ce9ea74c79326f98b8bf8e" as string))
            }

            // Tìm team được chọn từ danh sách
            const selectedTeam = dataTeam?.find((team: Team) => team._id === values.club_B);

            // Thông báo cho người tạo trận đấu (club_A) - đã tìm được đối thủ
            const ownerNotification: Notification = {
                actor: 'user',
                notificationType: 'opponent_found',
                title: 'Đã tìm thấy đối thủ!',
                content: `Đã có đội bóng phù hợp với yêu cầu tìm đối của bạn. Vui lòng kiểm tra thông tin và liên hệ.`,
                footballfield: match.footballField,
                club_A: match.club_A,
                club_B: selectedTeam,
                targetUser: match.user._id, // ID của người tạo trận đấu
                match: match._id,
                orderId: match.orderId
            }
            await dispatch(addNotificationSlice(ownerNotification));

            // Thông báo cho người tham gia trận đấu (club_B) - đã đăng ký tham gia
            const participantNotification: Notification = {
                actor: 'user',
                notificationType: 'opponent_found',
                title: 'Đã tìm thấy đối thủ!',
                content: `Bạn đã tìm đối thành công. Vui lòng kiểm tra thông tin và liên hệ.`,
                footballfield: match.footballField,
                club_A: match.club_A,
                club_B: selectedTeam,
                targetUser: auth.value.user._id,
                match: match._id,
                orderId: match.orderId
            }
            await dispatch(addNotificationSlice(participantNotification));
            router.push("/homepage/timDoi");
        }
        setVisible(false); // Đóng modal sau khi gửi yêu cầu
    };


    moment.locale('vi');
    useEffect(() => {
        const fetchData = async () => {
            const [matchData, teamData] = await Promise.all([
                await dispatch(getMatchByIdSlice(id as string)),
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
        match && (
            <div className="bg-white mx-auto px-4 sm:px-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-3 sm:gap-0">
                    <h2 className="text-xl sm:text-2xl font-semibold">Trận Đấu</h2>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <Button
                            type="primary"
                            className="bg-orange-500 text-white w-full sm:w-auto"
                            onClick={handleOpenModal}
                            size="large"
                        >
                            <span className="hidden sm:inline">Gửi yêu cầu</span>
                            <span className="sm:hidden">Gửi yêu cầu tham gia</span>
                        </Button>
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
                <Card className="mt-6 sm:mt-8 space-y-4 mb-6 sm:mb-10 shadow rounded-lg sm:rounded-xl">
                    <div key={match._id} className="bg-white">
                        {/* Mobile Layout */}
                        <div className="block sm:hidden">
                            {/* Đội A */}
                            <div className="mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                        <Image
                                            src={match?.club_A?.teamImage || "/images/default-team.png"}
                                            className="rounded-full object-cover"
                                            layout="fill"
                                            alt="bg"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-base">{match.club_A?.teamName}</div>
                                        <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                            <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{match.club_A?.ageGroup}</span>
                                            <span>⚡ 99</span>
                                            <span>⭐ ?</span>
                                            <span>👍 100</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* VS */}
                            <div className="text-center text-2xl font-bold my-4">VS</div>

                            {/* Đội B */}
                            {match.club_B ? (
                                <div className="mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                                            <Image
                                                src={match.club_B?.teamImage}
                                                className="rounded-full object-cover"
                                                layout="fill"
                                                alt="bg"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-base">{match.club_B?.teamName}</div>
                                            <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">{match.club_B?.ageGroup}</span>
                                                <span>⚡ 99</span>
                                                <span>⭐ ?</span>
                                                <span>👍 100</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-center mb-4">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                        ?
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                                </div>
                            )}
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:grid sm:grid-cols-3 items-center mb-2">
                            {/* Đội A */}
                            <div>
                                <div className="flex items-center space-x-3">
                                    <div className="relative w-20 h-20">
                                        <Image
                                            src={match?.club_A?.teamImage || "/images/default-team.png"}
                                            className="rounded-full object-cover"
                                            layout="fill"
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
                                                layout="fill"
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
                        <div className="mt-3 text-xs sm:text-sm text-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                                <span className='capitalize text-sm sm:text-base font-medium'>
                                    {match.orderId?.timeStart} | {
                                        match.orderId?.date ?
                                            moment(match.orderId.date, "DD-MM-YYYY")
                                                .locale('vi')
                                                .format('dddd, DD-MM-YYYY')
                                            : moment(match.date).format('dddd, DD/MM/YYYY')
                                    }
                                </span>
                                {(() => {
                                    // Kiểm tra xem match.orderId có tồn tại không
                                    if (!match.orderId?.date) {
                                        return (
                                            <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                Không có thông tin ngày
                                            </span>
                                        );
                                    }

                                    // Chuyển đổi ngày trận đấu sang định dạng chuẩn
                                    const matchDate = moment(match.orderId.date, "DD-MM-YYYY").startOf('day');
                                    // Lấy ngày hiện tại ở đầu ngày (00:00:00)
                                    const today = moment().startOf('day');

                                    // So sánh ngày
                                    const isSameDay = matchDate.isSame(today, 'day');
                                    const diffDays = matchDate.diff(today, 'day');

                                    if (isSameDay) {
                                        // Nếu là ngày hôm nay và chưa có đối thủ
                                        if (!match.club_B) {
                                            return (
                                                <span className="bg-red-100 text-red-600 rounded-md px-2 py-1 text-xs font-bold flex items-center self-start sm:self-center">
                                                    <ClockCircleOutlined className="mr-1" />
                                                    <span className="hidden sm:inline">Hôm nay, {match.orderId?.timeStart || match.time}</span>
                                                    <span className="sm:hidden">Hôm nay</span>
                                                </span>
                                            );
                                        } else {
                                            // Nếu là ngày hôm nay nhưng đã có đối thủ
                                            return (
                                                <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                    <span className="hidden sm:inline">Hôm nay, {match.orderId?.timeStart || match.time}</span>
                                                    <span className="sm:hidden">Hôm nay</span>
                                                </span>
                                            );
                                        }
                                    } else if (diffDays > 0) {
                                        // Nếu là ngày trong tương lai
                                        return (
                                            <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                {diffDays} ngày nữa
                                            </span>
                                        );
                                    } else {
                                        // Nếu là ngày trong quá khứ
                                        return (
                                            <span className="bg-gray-100 text-gray-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                                Đã diễn ra
                                            </span>
                                        );
                                    }
                                })()}
                            </div>
                            <div className="mt-2 text-xs sm:text-sm text-gray-600 break-words">
                                {match.footballField?.name || "Không có thông tin sân"}
                                {match.footballField ?
                                    (`, ${match.footballField?.address?.detail ? `${match.footballField?.address?.detail}, ` : ""}
                                    ${match.footballField?.address?.ward || ""},
                                    ${match.footballField?.address?.district || ""},
                                    ${match.footballField?.address?.province || ""}`) :
                                    ", Không có thông tin địa chỉ"
                                }
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Mô tả*/}
                <div className="bg-white mx-auto">
                    <Card className="text-left rounded-lg sm:rounded-xl">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Thông tin</h3>
                        <div className="space-y-3 sm:space-y-4">
                            {/* Ngày và Thời gian */}
                            <div className="flex items-start sm:items-center space-x-3">
                                <CalendarOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-700 capitalize break-words">
                                    <strong>Thời gian: </strong>
                                     {match.orderId?.timeStart} | {
                                        match.orderId?.date ?
                                            moment(match.orderId.date, "DD-MM-YYYY")
                                                .locale('vi')
                                                .format('dddd, DD-MM-YYYY')
                                            : moment(match.date).format('dddd, DD/MM/YYYY')
                                    }
                                </span>
                            </div>

                            <div className="flex items-start sm:items-center space-x-3">
                                <ClockCircleOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-700 break-words">
                                    <strong>Giờ đá: </strong>{match.orderId?.timeStart || "Không có thông tin"}
                                </span>
                            </div>

                            {/* Sân bóng */}
                            <div className="flex items-start sm:items-center space-x-3">
                                <EnvironmentOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-700 break-words">
                                    <strong>Sân bóng: </strong>{match.footballField?.name || "Không có thông tin"}
                                </span>
                            </div>

                            {/* Địa điểm */}
                            <div className="flex items-start sm:items-center space-x-3">
                                <EnvironmentOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-700 break-words">
                                    <strong>Địa chỉ: </strong>
                                    {match.footballField?.address ?
                                        (`${match.footballField?.address.detail ? `${match.footballField?.address.detail}, ` : ""}
                                        ${match.footballField?.address.ward || ""},
                                        ${match.footballField?.address.district || ""},
                                        ${match.footballField?.address.province || ""}`) :
                                        "Không có thông tin địa chỉ"
                                    }
                                </span>
                            </div>

                            {/* Liên hệ */}
                            <div className="flex items-start sm:items-center space-x-3">
                                <EditOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-700 break-words">
                                    <strong>Liên hệ: </strong> {match.contact || "Không có thông tin"}
                                </span>
                            </div>

                            <div className="flex items-start sm:items-center space-x-3">
                                <EditOutlined className="text-orange-500 mt-0.5 sm:mt-0 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-700 break-words">
                                    <strong>Mô tả: </strong> {match?.description || "Không có mô tả"}
                                </span>
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
        )
    );
};

export default MatchDetail;
