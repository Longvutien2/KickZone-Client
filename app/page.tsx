
'use client';
// // app/page.tsx
import { Button, Card } from 'antd';
import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FacebookOutlined, LockOutlined, MailOutlined, TeamOutlined, TrophyOutlined } from '@ant-design/icons';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import Link from 'next/link';
const stats = [
  { value: 51743, label: 'Người chơi trên nền tảng' },
  { value: 6976, label: 'Trận đấu diễn ra' },
  { value: 6146, label: 'Câu lạc bộ' },
  { value: 2544, label: 'Địa điểm' },
];

const images = [
  'https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/Gallery-2-1.jpg',
  'https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/Gallery-1-1-300x195.jpg',
  'https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/Gallery.jpg',
  'https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/Gallery-4.jpg',
  'https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/Gallery-3.jpg',
];

const HomePage = () => {
  const router = useRouter();

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <div className="bg-white ">

      <section className="max-w-8/12  mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Image
              src="/222.png" // Chỉnh lại đường dẫn logo của bạn ở đây
              alt="Logo"
              width={150}
              height={150}
            />
            {/* <rect width="100%" height="100%" stroke-width="0" fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)"></rect> */}
          </div>

          {/* Navigation */}

          <div className="flex space-x-8  font-semibold my-auto items-center">
            <Link href="/community" className="hover:text-[#2DA1EE] transition">Cộng đồng</Link>
            <Link href="/book-field" className="hover:text-[#2DA1EE] transition">Đặt sân</Link>
            <Link href="/field-owner" className="hover:text-[#2DA1EE] transition">Dành cho chủ sân</Link>
            <Link href="/ranking" className="hover:text-[#2DA1EE] transition">Bảng xếp hạng</Link>
            <Link href="/blog" className="hover:text-[#2DA1EE] transition">Blog</Link>

            <Button
              className="bg-orange-500 text-white rounded-full px-4 py-2"
              onClick={() => router.push('/homepage')}
            >
              Đặt sân
            </Button>
          </div>
        </div>
        {/* Main Content */}
        <div className="grid grid-cols-2 gap-8 py-24 items-center">
          <div className="col-span-1 my-auto space-y-6">
            <h1 className="text-5xl font-bold">Nền tảng #1 cho người chơi bóng đá</h1>
            <p className="text-xl">Lập đội tìm đối thủ, kết nối cộng đồng. Tranh hạng dễ dàng, nhận quà hấp dẫn!</p>
            <div className="space-x-4">
              <Button
                type="primary"
                size="large"
                onClick={() => router.push('/homepage')}
              >
                Tham gia ngay
              </Button>
              <Button
                size="large"
                onClick={() => router.push('/learn-more')}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>
          <div className="col-span-1">
            <div className="flex justify-center items-center ">
              <div className="w-120 h-120 my-auto flex justify-center items-center ">
                {/* Sử dụng lớp gradient-bg với hiệu ứng border-gradient */}
                <div className="gradient-bg1 w-full h-full p-6"
                >
                  <Slider {...settings}>
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/FVR-1-1.png"
                      alt="Soccer Player 4"
                    />
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/fooooot-1.png"
                      alt="Soccer Player 1"
                    />
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/fooooot-bal-1.png"
                      alt="Soccer Player 2"
                    />
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/football-Recoveredf-2-1.png"
                      alt="Soccer Player 3"
                    />

                    <img
                      src="https://i.postimg.cc/mD8cv6c1/img-2.png"
                      alt="Soccer Player 5"
                    />
                  </Slider>
                </div>
              </div>
            </div>
          </div>


        </div>
      </section>

      <section className="max-w-8/12  mx-auto pb-20  bg-white ">
        <div className="flex flex-col md:flex-row items-center justify-between  gap-10">
          {/* LEFT IMAGE SECTION */}
          <motion.div
            initial={{ opacity: 0, x: -300 }}        // bắt đầu lệch phải
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.4 }}
            className="w-full my-auto  md:w-1/2 flex justify-between"
          >
            <div className="relative  w-[350px] h-[500] md:w-[500px] md:h-[650px]">
              <Image
                src="/homepage1.png"
                alt="Football app mockup"
                fill // Tự động fill 100% của div parent
                className="object-contain rounded-xl" // object-fit tương ứng
                priority
              />
            </div>
          </motion.div>

          {/* RIGHT CONTENT SECTION */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}        // bắt đầu lệch phải
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.5 }}
            className="w-full md:w-1/2"
          >
            <div>
              <p className="text-[#2DA1EE] text-lg font-semibold mb-1">Chơi bóng đá vui hơn</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Một cộng đồng uy tín</h2>
              <p className="text-gray-600 mb-6">
                Kết nối với cộng đồng người chơi bóng, sân bóng quanh bạn chưa bao giờ dễ dàng và an toàn đến thế
              </p>
              <ul className="space-y-4 text-lg text-gray-700 mb-8">
                <li>
                  <TeamOutlined className="text-[#2DA1EE] mr-2" />
                  <strong>Trang câu lạc bộ</strong> Logo, độ tuổi, xếp hạng, đánh giá uy tín cùng thống kê thành tích rõ ràng.
                </li>
                <li>
                  <LockOutlined className="text-[#2DA1EE] mr-2" />
                  <strong>Cập nhật diễn biến trận đấu</strong> Ghi bàn, kiến tạo, phạm lỗi...
                </li>
                <li>
                  <TrophyOutlined className="text-[#2DA1EE] mr-2" />
                  <strong>Giải đấu cộng đồng</strong> Tổ chức thường xuyên, vì cộng đồng!
                </li>
              </ul>
              <Button type="primary" size="large" className="bg-[#2DA1EE]  border-none">
                Kết nối với anh em
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-8/12  mx-auto w-full py-20 bg-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Tin dùng bởi người dùng khắp cả nước
        </h2>
        <p className="text-gray-500 text-base md:text-lg mb-10">
          Hàng chục ngàn người chơi đang chờ bạn góp vui
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mx-auto">
          {stats.map((item, index) => {
            const ref = useRef(null);
            const inView = useInView(ref, { once: true, amount: 0.5 });

            return (
              <Card
                key={index}
                ref={ref}
                variant="borderless"
                className="bg-gray-50 shadow-sm"
              >
                <p className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {inView ? <CountUp end={item.value} duration={2} /> : '0'}+
                </p>
                <p className="text-gray-600 text-sm mt-2">{item.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="max-w-8/12  py-20 px-4 text-center mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Những Khoảnh Khắc Tuyệt Vời</h2>
        <p className="text-gray-500 text-base md:text-lg max-w-3xl mx-auto mb-10">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo ligula eget dolor.
          Aenean massa. Cum sociis natoque penatibus et magnis.
        </p>
        <motion.div
          initial={{ opacity: 0, x: -300 }}        // bắt đầu lệch phải
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-4">
              <img
                src={images[0]}
                alt={`Moment 1`}
                className="w-full rounded-xl object-cover shadow-sm"
              />
            </div>
            <div className="space-y-4">
              <img
                src={images[1]}
                alt={`Moment 2`}
                className="w-full rounded-xl object-cover shadow-sm"
              />
            </div>
            <div className="space-y-4">
              <img
                src={images[2]}
                alt={`Moment 2`}
                className="w-full rounded-xl object-cover shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 150 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div className="space-y-4">
              <img
                src={images[3]}
                alt={`Moment 2`}
                className="w-full rounded-xl object-cover shadow-sm"
              />
            </div>
            <div className="space-y-4">
              <img
                src={images[4]}
                alt={`Moment 2`}
                className="w-full rounded-xl object-cover shadow-sm"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="mt-20 bg-white max-w-full text-gray-300 text-sm py-8 border-t">
        <div className="max-w-full mx-auto px-4 text-center space-y-4">

          {/* Navigation Links */}
          <div className="flex justify-center flex-wrap gap-12 font-medium text-gray-700">
            <a href="#" className="hover:text-blue-600 transition">Giới thiệu</a>
            <a href="#" className="hover:text-blue-600 transition">Điều khoản sử dụng</a>
            <a href="#" className="hover:text-blue-600 transition">Chính sách bảo mật</a>
          </div>

          {/* Social Icons */}
          <div className="flex justify-center gap-4 text-xl">
            <a href="#" className="hover:text-blue-600 transition">
              <FacebookOutlined />
            </a>
            <a href="#" className="hover:text-blue-600 transition">
              <MailOutlined />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-gray-400">
            © 2025 KickZone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

// export default function Home() {
//   return (
// {/* <div className="flex justify-center items-center min-h-screen">
//   <div className=" relative w-80 h-80 flex justify-center items-center">
//     {/* Sử dụng lớp gradient-bg với hiệu ứng border-gradient */}
//     <div className="gradient-bg1 w-full h-full absolute top-0 left-0 rounded-full p-6 ">
//       {/* Ảnh cầu thủ */}
//       <img
//         src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/fooooot-1.png"
//         alt="Soccer Player"
//       />
//     </div>
//   </div>
// </div> */}
//   )
// }
