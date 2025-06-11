'use client'
import { Select, Form, Button, Input, Upload, message } from 'antd'
import { PlusOutlined, InfoCircleOutlined, UploadOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { useEffect, useState } from 'react'
import { Team } from '@/models/team'
import { FootballField } from '@/models/football_field'
import { addMatchSlice, getListMatchByFootballFieldIdSlice } from '@/features/match.slice'
import moment from 'moment';
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Notification } from '@/models/notification'
import { addNotificationSlice } from '@/features/notification.slice'
import { createTeam } from '@/api/team'
import { Match } from '@/models/match'
import { getOrdersByUserId } from '@/api/payment'
import { Order } from '@/models/payment'
import { upload } from '@/utils/upload'

const { Option } = Select

const CreateMatchPage = () => {
  const user = useAppSelector(state => state.auth)
  const footballField = useAppSelector(state => state.footballField.detail) as FootballField
  const allMatches = useAppSelector(state => state.match.value) as Match[]
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm()
  const [myOrder, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedBookingIds, setUsedBookingIds] = useState<string[]>([]);

  // Lấy danh sách trận đấu và đặt sân
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        // Lấy danh sách đặt sân thành công của người dùng
        const bookingResponse = await getOrdersByUserId(user.value.user._id as string);
        // Lọc chỉ lấy các đặt sân đã xác nhận và chưa diễn ra
        if (bookingResponse) {
          const confirmedBookings = bookingResponse.data.filter((booking: Order) => {
            // Kiểm tra trạng thái đặt sân
            if (booking.paymentStatus !== "success") return false;

            // Chuyển đổi chuỗi ngày từ định dạng "DD-MM-YYYY" sang moment
            const bookingDate = moment(booking.date, "DD-MM-YYYY");

            // Lấy ngày hiện tại (đầu ngày)
            const today = moment().startOf('day');

            // So sánh ngày đặt với ngày hiện tại
            return bookingDate.isSameOrAfter(today);
          });
          setMyOrders(confirmedBookings);
        }

      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (user.value?.user?._id) {
      fetchData();
    }
  }, [user.value?.user?._id, dispatch]);

  // Kiểm tra các orderId đã được sử dụng
  useEffect(() => {
    if (allMatches && allMatches.length > 0) {
      // Lấy danh sách orderId đã được sử dụng (chỉ lấy _id)
      const usedIds = allMatches
        .filter(match => match.orderId && match.orderId._id)
        .map(match => match.orderId._id);

      setUsedBookingIds(usedIds);
    }
  }, [allMatches]);

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

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {

      // 1. Xác định ảnh sử dụng (custom hoặc mặc định)
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
        user: user.value.user,
        contact: values.contact
      };

      // Gọi API tạo team
      const teamResponse = await createTeam(teamData);
      const createdTeam = teamResponse.data;

      if (createdTeam) {
        // 2. Tạo dữ liệu trận đấu mới với team vừa tạo
        const matchData = {
          club_A: createdTeam._id, // ID của team vừa tạo
          footballField: footballField._id,
          user: user.value.user._id,
          orderId: values.orderId,
          description: values.description,
        } as any;

        // Thêm trận đấu mới
        const matchResponse = await dispatch(addMatchSlice(matchData));

        // 3. Tạo thông báo
        const userNotification: Notification = {
          actor: 'user',
          notificationType: 'posted_opponent',
          title: 'Đã đăng tìm đối !',
          content: `Bạn đã đăng tìm đối thành công với đội "${createdTeam.teamName}". Vui lòng chờ đội bóng khác liên hệ để xác nhận.`,
          club_A: createdTeam,
          footballfield: footballField,
          targetUser: user.value.user._id,
          match: matchResponse.payload._id,
          orderId: values.orderId,
        };
        await dispatch(addNotificationSlice(userNotification));

        // 4. Tải lại danh sách trận đấu
        await dispatch(getListMatchByFootballFieldIdSlice(footballField._id as string));

        toast.success(`Tạo trận đấu thành công với đội "${createdTeam.teamName}"!`);
        router.push("/homepage/find-opponent");
      }
    } catch (error) {
      console.error("Lỗi khi tạo trận đấu:", error);
      toast.error("Có lỗi xảy ra khi tạo trận đấu. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  }

  // Hiển thị thông báo nếu không có đặt sân nào
  if (!loading && myOrder.length === 0) {
    return (
      <div className="p-4 bg-white">
        <h2 className="text-xl font-semibold text-center mb-6">Tạo Trận Đấu Mới</h2>
        <div className="text-center p-8">
          <div className="text-red-500 mb-4">
            Bạn chưa có đặt sân nào đã được xác nhận!
          </div>
          <p className="mb-4">
            Để tạo trận đấu mới, bạn cần đặt sân trước và được xác nhận.
          </p>
          <Button
            type="primary"
            onClick={() => router.push('/homepage/book-field')}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Đặt Sân Ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-white">
      <h2 className="text-xl font-semibold text-center mb-6">Tạo Trận Đấu Mới</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {/* Thông tin đội của tôi */}
        <div className="mb-6 rounded-lg">
          {/* Tên đội */}
          <Form.Item
            label="Tên đội"
            name="teamName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đội!' }]}
          >
            <Input
              placeholder="Nhập tên đội của bạn"
            />
          </Form.Item>

          {/* Số điện thoại liên hệ */}
          <Form.Item
            label="Số điện thoại liên hệ"
            name="contact"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
            ]}
          >
            <Input placeholder="Nhập số điện thoại liên hệ" />
          </Form.Item>

          {/* Trình độ */}
          <Form.Item
            label="Trình độ"
            name="teamLevel"
            rules={[{ required: true, message: 'Vui lòng chọn trình độ!' }]}
          >
            <Select placeholder="Chọn trình độ của đội">
              <Option value="Yếu">Yếu</Option>
              <Option value="Trung bình- yếu">Trung bình - yếu</Option>
              <Option value="Trung bình">Trung bình</Option>
              <Option value="Khá">Khá</Option>
              <Option value="Tốt">Tốt</Option>
            </Select>
          </Form.Item>

          {/* Upload ảnh đội (tùy chọn) */}
          <Form.Item label="Ảnh đại diện đội (tùy chọn)" name="teamImage">
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

          {/* Độ tuổi */}
          <Form.Item
            label="Độ tuổi"
            name="teamAgeGroup"
            rules={[{ required: true, message: 'Vui lòng chọn độ tuổi!' }]}
          >
            <Select placeholder="Chọn độ tuổi của đội">
              <Option value="U15">Dưới 15 tuổi</Option>
              <Option value="U18">Dưới 18 tuổi</Option>
              <Option value="U21">Dưới 21 tuổi</Option>
              <Option value="U25">Dưới 25 tuổi</Option>
              <Option value="25+">Trên 25 tuổi</Option>
            </Select>
          </Form.Item>
        </div>

        {/* Chọn đặt sân đã xác nhận */}
        <Form.Item
          label="Danh sách sân đã đặt của bạn"
          name="orderId"
          rules={[{ required: true, message: 'Vui lòng chọn đặt sân!' }]}
          extra="Chỉ hiển thị các đặt sân đã được xác nhận và chưa diễn ra"
        >
          <Select placeholder="Chọn đặt sân">
            {myOrder.map((order: Order) => {
              const orderId = order._id as string;
              const isUsed = usedBookingIds.includes(orderId);
              return (
                <Option
                  key={orderId}
                  value={orderId}
                  disabled={isUsed}
                >
                  {isUsed ? (
                    <div className="flex items-center">
                      <InfoCircleOutlined className="text-red-500 mr-2" />
                      <span className="line-through text-gray-400">
                        {`${order.fieldName}, ${order.date}, ${order.timeStart}`}
                      </span>
                      <span className="ml-2 text-xs text-red-500">(Đã tạo trận đấu)</span>
                    </div>
                  ) : (
                    `${order.fieldName}, ${order.date}, ${order.timeStart}`
                  )}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        {/* Mô tả */}
        <Form.Item label="Mô tả" name="description">
          <Input.TextArea placeholder="Sân 5, 7 hay 11 và tỉ lệ nếu có..." />
        </Form.Item>

        {/* Nút tạo trận đấu */}
        <Form.Item className="text-center">
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            loading={loading}
          >
            Tạo và tìm đối
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateMatchPage
