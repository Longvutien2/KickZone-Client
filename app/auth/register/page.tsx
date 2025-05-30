'use client';
import { Form, Input, Button, Checkbox } from "antd";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { signup } from "@/api/auth";
import { toast } from "react-toastify";
import { IUser } from "@/models/auth";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";

const Register = () => {

  const router = useRouter();

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
      router.push("/auth/login");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
    console.log("Success:", values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden">
        {/* Left Content */}
        <div className="hidden lg:block lg:w-1/2 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
            <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 right-20 w-16 h-16 border-2 border-white rounded-full"></div>
          </div>

          <div className="relative z-10">
            <div className="mb-8">
              <Image src="/222.png" alt="KichZone Logo" width={180} height={90} priority className="h-20 w-auto filter brightness-0 invert" />
            </div>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Tham gia KichZone ngay hôm nay</h1>
            <p className="text-orange-100 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">Khởi đầu hành trình bóng đá của bạn</p>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8  bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Tìm sân nhanh chóng</h3>
                  <p className="text-orange-100">Hệ thống tìm kiếm thông minh, đặt sân chỉ trong vài phút</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8  bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Tìm đối thủ phù hợp</h3>
                  <p className="text-orange-100">Kết nối với các đội bóng cùng trình độ trong khu vực</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8  bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white font-bold">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-xl mb-1">Hệ thống xếp hạng chuyên nghiệp</h3>
                  <p className="text-orange-100">Theo dõi thành tích và nhận thưởng hấp dẫn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 p-4 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-center min-h-screen lg:min-h-0">
          <div className="max-w-md mx-auto w-full">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-6 sm:mb-8">
              <Image src="/222.png" alt="KichZone Logo" width={120} height={60} priority className="h-12 sm:h-16 w-auto mx-auto" />
            </div>

            <div className="text-center mb-4 sm:mb-6 lg:mb-8">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Đăng ký tài khoản</h2>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Tạo tài khoản mới để bắt đầu</p>
            </div>

            {/* Register Form */}
            <Form
              layout="vertical"
              onFinish={onFinish}
              className="space-y-3 sm:space-y-4"
            >
              <Form.Item
                label={<span className="text-gray-700 font-medium text-sm sm:text-base">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: 'email', message: "Email không hợp lệ!" }
                ]}
                className="mb-2 sm:mb-3"
              >
                <Input
                  prefix={<MailOutlined className="text-gray-400" />}
                  placeholder="Nhập email của bạn"
                  size="large"
                  className="rounded-lg border-gray-300 hover:border-orange-200 focus:border-orange-300 transition-colors duration-200 h-10 sm:h-12"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium text-sm sm:text-base">Tên người dùng</span>}
                name="name"
                rules={[{ required: true, message: "Vui lòng nhập tên người dùng!" }]}
                className="mb-2 sm:mb-3"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập tên người dùng"
                  size="large"
                  className="rounded-lg border-gray-300 hover:border-orange-200 focus:border-orange-300 transition-colors duration-200 h-10 sm:h-12"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium text-sm sm:text-base">Mật khẩu</span>}
                name="password"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                ]}
                className="mb-2 sm:mb-3"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                  className="rounded-lg border-gray-300 hover:border-orange-200 focus:border-orange-300 transition-colors duration-200 h-10 sm:h-12"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium text-sm sm:text-base">Nhập lại mật khẩu</span>}
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: "Vui lòng nhập lại mật khẩu!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu không khớp!'));
                    },
                  }),
                ]}
                className="mb-2 sm:mb-3"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập lại mật khẩu"
                  size="large"
                  className="rounded-lg border-gray-300 hover:border-orange-200 focus:border-orange-300 transition-colors duration-200 h-10 sm:h-12"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item className="mb-4 sm:mb-6 mt-4 sm:mt-6">
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  className="rounded-lg font-semibold h-10 sm:h-12 text-sm sm:text-base shadow-md hover:shadow-lg transition-all duration-200 border-none"
                  style={{
                    background: 'linear-gradient(to right, #FFA07A, #FF7F50, #FF4500)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FF7F50, #FF4500, #FF6347)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(to right, #FFA07A, #FF7F50, #FF4500)';
                  }}
                >
                  Đăng ký
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-4 sm:mt-6">
              <p className="text-gray-600 text-xs sm:text-sm">
                Đã có tài khoản? {' '}
                <Link href="./login" className="text-orange-400 hover:text-orange-500 font-semibold">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

