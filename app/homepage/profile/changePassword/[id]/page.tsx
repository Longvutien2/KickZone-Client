'use client'

import { changepass } from '@/features/auth.slice';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { Button, Form, Input } from 'antd'
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { toast } from 'react-toastify';

const ChangePassword = () => {

  const auth = useAppSelector((state) => state.auth.value)
  // const [form] = Form.useForm();
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const [updating, setUpdating] = useState(false);
  const router = useRouter()
  console.log(auth.user);

  const handleSubmit = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      toast.error('Mật khẩu mới không khớp!');
      return;
    } else if (values.newPassword === values.password) {
      toast.error('Mật khẩu mới không được giống mật khẩu cũ!');
      return;
    }

    setUpdating(true);
    try {
      // Sử dụng cấu trúc dữ liệu giống như code ban đầu
      const userData = {
        ...auth.user,
        oldPassword: values.password,
        password: values.newPassword
      };

      console.log("Sending data:", userData);

      const result = await dispatch(changepass(userData)).unwrap();
      console.log("API response:", result);
      if (result.message) {
        toast.error(result.message)
      } else {
        toast.success('Đổi mật khẩu thành công!');
        router.push('/homepage/profile');
      }
    } catch (error: any) {
      console.error("Error changing password:", error);
      const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại!';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className='p-6 sm:p-0'>
      <h1 className="text-2xl font-semibold mb-8">Đổi mật khẩu</h1>
      <Form
        // initialValues={auth.user}
        layout="vertical" onFinish={handleSubmit}>

        <Form.Item name="_id" hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu cũ"
          rules={[{ required: true, message: "Vui lòng nhập!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu cũ..." />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="Mật khẩu mới"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự!" },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
              message: "Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường và 1 số!"
            }
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu cũ..."
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Nhập lại mật khẩu"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: "Vui lòng nhập lại mật khẩu mới!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="Nhập lại mật khẩu mới..." />
        </Form.Item>
        
        <Button
          type="primary"
          htmlType="submit"
          className="bg-orange-500 text-white"
          loading={updating}
        >
          Cập nhật
        </Button>
      </Form>
    </div>
  )
}

export default ChangePassword
