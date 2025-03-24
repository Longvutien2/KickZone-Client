'use client';
import { Form, Input, Button, Checkbox } from "antd";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { signup } from "@/api/auth";
import { toast } from "react-toastify";
import { IUser } from "@/models/auth";

const Register = () => {

  const onFinish = async (values: IUser) => {
    try {
      const user = {
        name:values.name,
        email: values.email,
        password: values.password
      }
      const newUsser = await signup(user);
      console.log("newUsser", newUsser);
      
      toast.success("Đăng ký thành công");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
    console.log("Success:", values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-7xl flex ">
        {/* Left Content */}
        <div className="w-1/2 ">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-orange-500">
          <Image src="/222.png" alt="logo" width={200} height={100} priority  className="h-24 w-auto" />
          </h2>
          <div className="mt-6 space-y-6">
            <div className="flex items-start space-x-2 text-xl">
              <span className="text-black-500">✔</span>
              <div>
                <p className="font-semibold">Tìm sân nhanh chóng</p>
                <p className="text-gray-500 text-sm">Tìm sân bóng quanh bạn nhanh chóng</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-xl">
              <span className="text-black-500 text-xl">✔</span>
              <div>
                <p className="font-semibold">Tìm đối thủ phù hợp</p>
                <p className="text-gray-500 text-sm">Đánh giá đối thủ hạn chế chơi xấu</p>
              </div>
            </div>
            <div className="flex items-start space-x-2 text-xl">
              <span className="text-black-500 text-xl">✔</span>
              <div>
                <p className="font-semibold">Tranh hạng câu lạc bộ như FIFA</p>
                <p className="text-gray-500 text-sm">Nhận quà hấp dẫn từ KichZone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="rounded-lg w-1/2 p-10 bg-white">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Đăng ký tài khoản mới</h2>


          {/* Login Form */}
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item label="Tên người dùng" name="name" rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}>
              <Input placeholder="Tên người dùng" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
              <Input.Password placeholder="Mật khẩu" />
            </Form.Item>

            <Form.Item label="Nhập lại mật khẩu" name="confirmPassword" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ tôi</Checkbox>
              </Form.Item>
              <a className="" href="#">Quên mật khẩu?</a>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block className="bg-green-500 border-none hover:bg-orange-600">
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <p className="text-gray-500 text-center">
            Bạn đã có tài khoản? <Link href={'./login'} className="text-green-500">Đăng Nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

