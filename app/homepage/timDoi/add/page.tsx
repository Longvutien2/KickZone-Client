'use client'

import { Select, Form, Button, Input, DatePicker, TimePicker, Tooltip } from 'antd'
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { useEffect, useState } from 'react'
import { getListTeamsSlice, getTeamByUserIdSlice } from '@/features/team.slice'
import { Team } from '@/models/team'
import { FootballField } from '@/models/football_field'
import { addMatchSlice, getListMatchByFootballFieldIdSlice } from '@/features/match.slice'
import moment from 'moment';
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { Notification } from '@/models/notification'
import { addNotificationSlice } from '@/features/notification.slice'
import { getTeamByUserId } from '@/api/team'
import { getBookingsByUserId } from '@/api/booking'
import { Booking } from '@/models/booking'
import { Match } from '@/models/match'
import { getOrdersByUserId } from '@/api/payment'
import { Order } from '@/models/payment'

const { Option } = Select

const CreateMatchPage = () => {
  const user = useAppSelector(state => state.auth)
  const footballField = useAppSelector(state => state.footballField.detail) as FootballField
  const allMatches = useAppSelector(state => state.match.value) as Match[]
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm()
  const [myTeam, setmyTeam] = useState<Team[]>([]);
  const [myOrder, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedBookingIds, setUsedBookingIds] = useState<string[]>([]);

  console.log("myOrder", myOrder);
  
  // Lấy danh sách trận đấu và đặt sân
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách đội của người dùng
        const teamResponse = await getTeamByUserId(user.value.user._id as string);
        teamResponse.data && setmyTeam(teamResponse.data);

        // Lấy danh sách đặt sân thành công của người dùng
        const bookingResponse = await getOrdersByUserId(user.value.user._id as string);

        // Lọc chỉ lấy các đặt sân đã xác nhận và chưa diễn ra
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

  const handleSubmit = async (values: any) => {
    try {
      // Tạo dữ liệu trận đấu mới
      const newData = {
        ...values,
        footballField: footballField._id, // ID sân bóng
        user: user.value.user._id,
        orderId: values.orderId // Lưu ID đặt sân để tham chiếu
      }

      // Thêm trận đấu mới
      const data = await dispatch(addMatchSlice(newData));

      // Tạo thông báo
      const userNotification: Notification = {
        actor: 'user',
        notificationType: 'posted_opponent',
        title: 'Đã đăng tìm đối !',
        content: `Bạn đã đăng tìm đối thành công. Vui lòng chờ đội bóng khác liên hệ để xác nhận.`,
        club_A: values.club_A,
        footballfield: footballField._id,
        targetUser: user.value.user._id,
      }
      await dispatch(addNotificationSlice(userNotification));

      // Tải lại danh sách trận đấu
      await dispatch(getListMatchByFootballFieldIdSlice(footballField._id as string));

      toast.success("Tạo trận đấu thành công!");
      router.push("/homepage/timDoi");
    } catch (error) {
      console.error("Lỗi khi tạo trận đấu:", error);
      toast.error("Có lỗi xảy ra khi tạo trận đấu. Vui lòng thử lại!");
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
            onClick={() => router.push('/homepage/datSan')}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Đặt Sân Ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-semibold text-center mb-6">Tạo Trận Đấu Mới</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {/* Chọn câu lạc bộ */}
        <Form.Item label="Chọn câu lạc bộ" name="club_A" rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ!' }]}>
          <Select placeholder="Chọn câu lạc bộ của bạn">
            {myTeam.length > 0 && myTeam.map((item: Team) => (
              <Option key={item._id} value={item._id}>{item.teamName}</Option>
            ))}
          </Select>
        </Form.Item>

        {/* Chọn đặt sân đã xác nhận */}
        <Form.Item
          label="Danh sách sân đã đặt"
          name="orderId"
          rules={[{ required: true, message: 'Vui lòng chọn đặt sân!' }]}
          extra="Chỉ hiển thị các đặt sân đã được xác nhận và chưa diễn ra"
        >
          <Select placeholder="Chọn đặt sân">
            {myOrder.map((order: Order) => {
              // Đảm bảo booking._id là string
              const orderId = order._id as string;
              // Kiểm tra xem orderId có trong danh sách usedBookingIds không
              const isUsed = usedBookingIds.includes(orderId);

              console.log(`Booking ${orderId} isUsed:`, isUsed); // Log để debug

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

        {/* Số điện thoại liên hệ */}
        <Form.Item
          label="Số điện thoại liên hệ"
          name="contact"
          rules={[
            { required: true, message: 'Vui lòng nhập số điện thoại!' },
            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' },
          ]}
        >
          <Input placeholder="Nhập số điện thoại" />
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
