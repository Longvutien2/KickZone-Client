
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

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [form] = Form.useForm();

  const onFinish = async (values: IUser) => {
    const user = {
      email: values.email,
      password: values.password
    };
    console.log("values",values);
    
    const userNew = await dispatch(login(user)).unwrap(); // unwrap giúp lấy error chính xác
    console.log("userNew",userNew);
    
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Chào mừng trở lại</h2>
          {/* Social Login */}
          <div className="flex space-x-4">
            <Button className="flex-1 "
            //  icon={<FcGoogle />}
              block>
              Đăng nhập với Google
            </Button>
            <Button className="flex-1 text-[#1877F2]"
            //  icon={<FaFacebook className="" />}
              block>
              Đăng nhập với Facebook
            </Button>
          </div>
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-gray-500">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
          {/* Login Form */}
          <Form layout="vertical"
            form={form}
            onFinish={onFinish}
          >
            <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
              <Input placeholder="Email" />
            </Form.Item>

            <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
              <Input.Password placeholder="Mật khẩu" />
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

            Chưa có tài khoản?  <Link href={'./register'} className="text-green-500">Đăng ký ở đây</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

