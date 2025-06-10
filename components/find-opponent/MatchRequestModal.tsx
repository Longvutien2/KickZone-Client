'use client'
import { Team } from '@/models/team'
import { Modal, Form, Select, Input, Button, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { createMatchRequestSlice } from '@/features/matchRequest.slice'
import { toast } from 'react-toastify'
import { upload } from '@/utils/upload'
import { Match } from '@/models/match'
import { createTeam } from '@/api/team'
import { Notification } from '@/models/notification'
import { addNotificationSlice } from '@/features/notification.slice'

interface MatchRequestModalProps {
    visible: boolean
    onCancel: () => void
    onSuccess?: () => void
    // dataTeam: Team[]
    match: Match
    userId: string
}

interface FormValues {
    club_B: string
    contactClubB: string
    contact: string
    teamName: string
    teamLevel: string
    teamAgeGroup: string
    teamImage?: string
    description?: string
}

// Hàm tạo ảnh mặc định cho đội
const generateDefaultTeamImage = (teamName: string, level: string) => {
    // Tạo màu sắc dựa trên trình độ
    const colors = {
        'Yếu': '#9E9E9E',              // Xám
        'Trung bình- yếu': '#FF9800',  // Cam nhạt
        'Trung bình': '#2196F3',       // Xanh dương
        'Khá': '#4CAF50',              // Xanh lá
        'Tốt': '#F44336'               // Đỏ
    };

    const bgColor = colors[level as keyof typeof colors] || '#2196F3';
    // Lấy 2 chữ cái đầu của tên đội
    const initials = teamName.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);

    // Tạo URL ảnh placeholder với UI Avatars
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${bgColor.slice(1)}&color=ffffff&size=200&font-size=0.6&bold=true&format=png`;
};

const MatchRequestModal = ({ visible, onCancel, onSuccess, match, userId }: MatchRequestModalProps) => {
    const [form] = Form.useForm()
    const dispatch = useAppDispatch()
    // const { loading } = useAppSelector(state => state.matchRequest)

    const handleSubmit = async (values: FormValues) => {
        try {
            const finalImage = generateDefaultTeamImage(values.teamName, values.teamLevel);
            let image = finalImage;
            if (values.teamImage) {
                image = await upload(values.teamImage);
            }

            // 2. Tạo team mới với thông tin người dùng nhập
            const teamData: Team = {
                teamName: values.teamName,
                teamImage: image,
                ageGroup: values.teamAgeGroup,
                level: values.teamLevel,
                user: userId,
                contact: values.contact
            };

            // Gọi API tạo team
            const teamResponse = await createTeam(teamData);
            const createdTeam = teamResponse.data;

            if (createdTeam) {
                // 2. Tạo yêu cầu thi đấu mới
                const requestData = {
                    match: match._id,
                    user: userId,
                    club_B: createdTeam._id,
                    targetUser: match.user._id,
                    description: values.description
                }

                const matchRequest = await dispatch(createMatchRequestSlice(requestData));
                if (matchRequest.payload.message) {
                    toast.warning(matchRequest.payload.message)
                    return
                }

                // 3. Tạo thông báo cho 2 user
                const userNotificationClubB: Notification = {
                    actor: 'user',
                    notificationType: 'request_sent',
                    title: 'Bạn đã gửi yêu cầu tham gia trận đấu!',
                    content: `Bạn đã gửi yêu cầu tham gia trận đấu thành công với đội "${match.club_A?.teamName}". Vui lòng chờ đội bóng khác liên hệ để xác nhận.`,
                    club_A: match.club_A,
                    club_B: createdTeam,
                    targetUser: userId,
                    match: match,
                };
                await dispatch(addNotificationSlice(userNotificationClubB));

                const userNotificationClubA: Notification = {
                    actor: 'user',
                    notificationType: 'match_request',
                    title: 'Có đội muốn tham gia trận đấu!',
                    content: `Đội "${createdTeam.teamName}" muốn tham gia trận đấu của bạn. Vui lòng xem chi tiết và xác nhận.`,
                    club_A: match.club_A,
                    club_B: createdTeam,
                    targetUser: match.user._id,
                    match: match,
                };
                await dispatch(addNotificationSlice(userNotificationClubA));

                toast.success('Gửi yêu cầu tham gia thành công!')
                form.resetFields()
                onCancel()
                onSuccess?.()
            }

        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra khi gửi yêu cầu!')
        }
    }

    const handleCancel = () => {
        form.resetFields()
        onCancel()
    }

    return (
        <Modal
            title="Muốn giao lưu với đội này?"
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel} className="bg-gray-500 text-white">
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    htmlType="submit"
                    form="requestForm"
                    // loading={loading}
                    className="bg-orange-500 text-white"
                >
                    Gửi Yêu Cầu Tham Gia
                </Button>,
            ]}
        >
            <p className="text-center text-gray-600 mb-4">
                Điền thông tin để gửi yêu cầu tham gia trận đấu
            </p>

            <Form
                id="requestForm"
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Thông tin đội bóng</h4>

                    <Form.Item
                        label="Tên đội"
                        name="teamName"
                        rules={[{ required: true, message: 'Vui lòng chọn đội bóng!' }]}
                    >
                        <Input placeholder="Nhập tên đội" />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại liên hệ"
                        name="contact"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại liên hệ" />
                    </Form.Item>

                    <Form.Item
                        label="Trình độ"
                        name="teamLevel"
                        rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
                    >
                        <Select placeholder="Chọn trình độ của đội">
                            <Select.Option value="Yếu">Yếu</Select.Option>
                            <Select.Option value="Trung bình- yếu">Trung bình - yếu</Select.Option>
                            <Select.Option value="Trung bình">Trung bình</Select.Option>
                            <Select.Option value="Khá">Khá</Select.Option>
                            <Select.Option value="Tốt">Tốt</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Ảnh đại diện đội (tùy chọn)" name="teamImage">
                        <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
                        </Upload>
                    </Form.Item>

                    <Form.Item
                        label="Độ tuổi"
                        name="teamAgeGroup"
                        rules={[{ required: true, message: 'Vui lòng chọn độ tuổi!' }]}
                    >
                        <Select placeholder="Chọn độ tuổi của đội">
                            <Select.Option value="U15">Dưới 15 tuổi</Select.Option>
                            <Select.Option value="U18">Dưới 18 tuổi</Select.Option>
                            <Select.Option value="U21">Dưới 21 tuổi</Select.Option>
                            <Select.Option value="U25">Dưới 25 tuổi</Select.Option>
                            <Select.Option value="25+">Trên 25 tuổi</Select.Option>
                        </Select>
                    </Form.Item>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Lời nhắn</h4>

                    <Form.Item
                        label="Tin nhắn cho đội chủ nhà (tùy chọn)"
                        name="description"
                    >
                        <Input.TextArea
                            placeholder="Viết lời chào hoặc thông tin thêm về đội bóng của bạn..."
                            rows={3}
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    )
}

export default MatchRequestModal
