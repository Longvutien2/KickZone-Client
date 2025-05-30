
'use client';
import { Form, Input, Button, Checkbox } from "antd";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { IUser } from "@/models/auth";
import { login } from "@/features/auth.slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, LockOutlined } from '@ant-design/icons';

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  const onFinish = async (values: IUser) => {
    const user = {
      email: values.email,
      password: values.password
    };
    console.log("values", values);

    const userNew = await dispatch(login(user)).unwrap(); // unwrap giúp lấy error chính xác
    console.log("userNew", userNew);

    if (userNew.message) {
      // Hiển thị lỗi trong form
      form.setFields([
        {
          name: "email",
          errors: [""],
        },
        {
          name: "password",
          errors: ["Tài khoản hoặc mật khẩu không chính xác"],
        }
      ]);
    } else {
      toast.success("Đăng nhập thành công")
      router.push("/homepage");
    }
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

            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Chào mừng đến với KichZone</h1>
            <p className="text-orange-100 mb-4 md:mb-6 lg:mb-8 text-sm md:text-base lg:text-lg">Nền tảng đặt sân bóng đá hàng đầu Việt Nam</p>

            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8  bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-wihite font-bold text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tìm sân nhanh chóng</h3>
                  <p className="text-orange-100">Hệ thống tìm kiếm thông minh, đặt sân chỉ trong vài phút</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-wihite font-bold text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Tìm đối thủ phù hợp</h3>
                  <p className="text-orange-100">Kết nối với các đội bóng cùng trình độ trong khu vực</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-wihite font-bold text-xl">✓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Hệ thống xếp hạng chuyên nghiệp</h3>
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Đăng nhập</h2>
              <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Chào mừng bạn trở lại với KichZone</p>
            </div>

            {/* Login Form */}
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              className="space-y-4 sm:space-y-6"
            >
              <Form.Item
                label={<span className="text-gray-700 font-medium text-sm sm:text-base">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: 'email', message: "Email không hợp lệ!" }
                ]}
                className="mb-3 sm:mb-4"
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập email của bạn"
                  size="large"
                  className="rounded-lg border-gray-300 hover:border-orange-200 focus:border-orange-300 transition-colors duration-200 h-10 sm:h-12"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-gray-700 font-medium text-sm sm:text-base">Mật khẩu</span>}
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                className="mb-3 sm:mb-4"
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu của bạn"
                  size="large"
                  className="rounded-lg border-gray-300 hover:border-orange-200 focus:border-orange-300 transition-colors duration-200 h-10 sm:h-12"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <Form.Item name="remember" valuePropName="checked" noStyle>
                  <Checkbox className="text-gray-600">
                    <span className="text-xs sm:text-sm">Ghi nhớ đăng nhập</span>
                  </Checkbox>
                </Form.Item>
                <Link href="#" className="text-xs sm:text-sm text-orange-400 hover:text-orange-500 font-medium">
                  Quên mật khẩu?
                </Link>
              </div>

              <Form.Item className="mb-4 sm:mb-6">
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
                  Đăng nhập
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-4 sm:mt-6">
              <p className="text-gray-600 text-xs sm:text-sm">
                Chưa có tài khoản? {' '}
                <Link href="./register" className="text-orange-400 hover:text-orange-500 font-semibold">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

