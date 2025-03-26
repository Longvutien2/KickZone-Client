'use client'

import { Select, Form, Button, Input, DatePicker, TimePicker } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { useEffect } from 'react'
import { getListTeamsSlice } from '@/features/team.slice'
import { Team } from '@/models/team'
import { FootballField } from '@/models/football_field'
import { addMatchSlice } from '@/features/match.slice'
import moment from 'moment';
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const { Option } = Select

const CreateMatchPage = () => {
  const user = useAppSelector(state => state.auth)
  const teams = useAppSelector(state => state.team.value)
  const footballFields = useAppSelector(state => state.footballField.value)
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    const formattedTime = moment(values.time.$d).format('HH:mm');
    const newData = {
      ...values,
      date: values.date.$d,
      time: formattedTime,
      user: user.value.user._id
    }
    const data = await dispatch(addMatchSlice(newData))
    toast.success("Tạo trận đấu thành công !")
    router.push("/homepage/timDoi");
    console.log('Received values:', data.payload)
    // Xử lý dữ liệu gửi đi
  }

  useEffect(() => {
    const getData = async () => {
      await dispatch(getListTeamsSlice())
    }
    getData();
  }, [])

  return (
    <div className="p-4 bg-white">
      <h2 className="text-xl font-semibold text-center mb-6">Tạo Trận Đấu Mới</h2>
      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {/* Chọn câu lạc bộ */}
        <Form.Item label="Chọn câu lạc bộ" name="club_A" rules={[{ required: true }]}>
          <Select placeholder="Chọn câu lạc bộ">
            {teams.length > 0 && teams.map((item: Team) => (
              <Option value={item._id}>{item.teamName}</Option>
            ))

            }
          </Select>
        </Form.Item>

        {/* Chọn sân bóng với tính năng tìm kiếm */}
        <Form.Item label="Sân bóng" name="footballField" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="Chọn sân"
            optionFilterProp="children"
            filterOption={(input, option: any) =>
              option?.children.toLowerCase().includes(input.toLowerCase())
            }
          >
            {footballFields.map((court: FootballField) => (
              <Option key={court._id} value={court._id}>
                {court.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Ngày đấu */}
        <Form.Item label="Ngày đấu" name="date" rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>

        {/* Giờ đấu */}
        <Form.Item label="Giờ đấu" name="time" rules={[{ required: true }]}>
          <TimePicker className="w-full" format="HH:mm" />
        </Form.Item>

        {/* Thời lượng */}
        <Form.Item label="Thời lượng" name="duration" rules={[{ required: true }]}>
          <Select placeholder="Chọn thời lượng">
            <Option value="60">60 phút</Option>
            <Option value="90">90 phút</Option>
            <Option value="120">120 phút</Option>
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
          >
            Tạo và tìm đối
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CreateMatchPage
