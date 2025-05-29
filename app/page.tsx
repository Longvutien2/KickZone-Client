
'use client';
// // app/page.tsx
import { Button, Card, Drawer } from 'antd';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { FacebookOutlined, LockOutlined, MailOutlined, TeamOutlined, TrophyOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navigationItems = [
    { href: "/community", label: "Cộng đồng" },
    { href: "/book-field", label: "Đặt sân" },
    { href: "/field-owner", label: "Dành cho chủ sân" },
    { href: "/ranking", label: "Bảng xếp hạng" },
    { href: "/blog", label: "Blog" },
  ];

  return (
    <div className="bg-white">
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-4 lg:py-6">
          {/* Logo */}
          <div className="flex items-center">
            <Image
              src="/222.png"
              alt="KickZone Logo"
              width={120}
              height={120}
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36"
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8 font-semibold">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#2DA1EE] transition-colors duration-200 text-gray-700"
              >
                {item.label}
              </Link>
            ))}
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 py-2 h-auto border-none font-semibold transition-colors duration-200"
              onClick={() => router.push('/homepage')}
            >
              Đặt sân
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open mobile menu"
          >
            <MenuOutlined className="text-2xl text-gray-700" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <Drawer
          title={
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#2DA1EE]">KickZone</span>
            </div>
          }
          placement="right"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          width={280}
          className="lg:hidden"
        >
          <nav className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3 px-4 text-lg font-medium text-gray-700 hover:text-[#2DA1EE] hover:bg-gray-50 rounded-lg transition-all duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full h-12 text-lg font-semibold border-none"
              onClick={() => {
                router.push('/homepage');
                setMobileMenuOpen(false);
              }}
              block
            >
              Đặt sân ngay
            </Button>
          </nav>
        </Drawer>
        {/* Hero Section */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 py-8 sm:py-12 lg:py-24 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
              Nền tảng #1 cho người chơi bóng đá
            </h1>
            <p className="text-lg sm:text-xl lg:text-xl text-gray-600 leading-relaxed">
              Lập đội tìm đối thủ, kết nối cộng đồng. Tranh hạng dễ dàng, nhận quà hấp dẫn!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center lg:justify-start">
              <Button
                type="primary"
                size="large"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold bg-[#2DA1EE] border-[#2DA1EE] hover:bg-[#2590d1] hover:border-[#2590d1] rounded-full"
                onClick={() => router.push('/homepage')}
              >
                Tham gia ngay
              </Button>
              <Button
                size="large"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold border-2 border-gray-300 hover:border-[#2DA1EE] hover:text-[#2DA1EE] rounded-full"
                onClick={() => router.push('/learn-more')}
              >
                Tìm hiểu thêm
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 xl:w-[480px] xl:h-[480px] flex justify-center items-center">
              <div className="gradient-bg1 w-full h-full p-4 sm:p-6">
                <Slider {...settings}>
                  <div>
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/FVR-1-1.png"
                      alt="Soccer Player 4"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/fooooot-1.png"
                      alt="Soccer Player 1"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/fooooot-bal-1.png"
                      alt="Soccer Player 2"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <img
                      src="https://template-kit.evonicmedia.com/layout87/wp-content/uploads/2024/09/football-Recoveredf-2-1.png"
                      alt="Soccer Player 3"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <img
                      src="https://i.postimg.cc/mD8cv6c1/img-2.png"
                      alt="Soccer Player 5"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Slider>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Community Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Image Section */}
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.4 }}
            className="order-2 lg:order-1 flex justify-center"
          >
            <div className="relative w-full max-w-md lg:max-w-lg">
              <Image
                src="/homepage1.png"
                alt="Football app mockup"
                width={500}
                height={650}
                className="w-full h-auto object-contain rounded-xl"
                priority
              />
            </div>
          </motion.div>

          {/* Content Section */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.5 }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="space-y-6">
              <p className="text-[#2DA1EE] text-lg font-semibold">Chơi bóng đá vui hơn</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                Một cộng đồng uy tín
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Kết nối với cộng đồng người chơi bóng, sân bóng quanh bạn chưa bao giờ dễ dàng và an toàn đến thế
              </p>

              <ul className="space-y-4 sm:space-y-6">
                <li className="flex items-start space-x-3 text-left">
                  <TeamOutlined className="text-[#2DA1EE] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800 text-base sm:text-lg">Trang câu lạc bộ</strong>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Logo, độ tuổi, xếp hạng, đánh giá uy tín cùng thống kê thành tích rõ ràng.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-left">
                  <LockOutlined className="text-[#2DA1EE] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800 text-base sm:text-lg">Cập nhật diễn biến trận đấu</strong>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Ghi bàn, kiến tạo, phạm lỗi...
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-left">
                  <TrophyOutlined className="text-[#2DA1EE] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800 text-base sm:text-lg">Giải đấu cộng đồng</strong>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Tổ chức thường xuyên, vì cộng đồng!
                    </p>
                  </div>
                </li>
              </ul>

              <Button
                type="primary"
                size="large"
                className="h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold bg-[#2DA1EE] border-[#2DA1EE] hover:bg-[#2590d1] hover:border-[#2590d1] rounded-full mt-8"
              >
                Kết nối với anh em
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Tin dùng bởi người dùng khắp cả nước
        </h2>
        <p className="text-gray-500 text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto">
          Hàng chục ngàn người chơi đang chờ bạn góp vui
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((item, index) => {
            const ref = useRef(null);
            const inView = useInView(ref, { once: true, amount: 0.5 });

            return (
              <Card
                key={index}
                ref={ref}
                className="bg-gray-50 hover:bg-gray-100 transition-colors duration-200 border-0 shadow-sm hover:shadow-md p-4 sm:p-6"
              >
                <div className="text-center">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    {inView ? <CountUp end={item.value} duration={2} /> : '0'}+
                  </p>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-tight">
                    {item.label}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          Những Khoảnh Khắc Tuyệt Vời
        </h2>
        <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed">
          Những khoảnh khắc đáng nhớ từ cộng đồng bóng đá KickZone.
          Hãy cùng nhau tạo nên những ký ức tuyệt vời trên sân cỏ.
        </p>

        <motion.div
          initial={{ opacity: 0, x: -300 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true, amount: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="group">
              <img
                src={images[0]}
                alt="Khoảnh khắc bóng đá 1"
                className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              />
            </div>
            <div className="group">
              <img
                src={images[1]}
                alt="Khoảnh khắc bóng đá 2"
                className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              />
            </div>
            <div className="group sm:col-span-2 lg:col-span-1">
              <img
                src={images[2]}
                alt="Khoảnh khắc bóng đá 3"
                className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="group">
              <img
                src={images[3]}
                alt="Khoảnh khắc bóng đá 4"
                className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              />
            </div>
            <div className="group">
              <img
                src={images[4]}
                alt="Khoảnh khắc bóng đá 5"
                className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Navigation Links */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 lg:gap-12">
              <a
                href="#"
                className="text-gray-700 hover:text-[#2DA1EE] transition-colors duration-200 font-medium text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Giới thiệu
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#2DA1EE] transition-colors duration-200 font-medium text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Điều khoản sử dụng
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-[#2DA1EE] transition-colors duration-200 font-medium text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Chính sách bảo mật
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center gap-6 sm:gap-8">
              <a
                href="#"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-[#2DA1EE] text-gray-600 hover:text-white transition-all duration-200 text-xl"
                aria-label="Facebook"
              >
                <FacebookOutlined />
              </a>
              <a
                href="#"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 hover:bg-[#2DA1EE] text-gray-600 hover:text-white transition-all duration-200 text-xl"
                aria-label="Email"
              >
                <MailOutlined />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-sm sm:text-base text-gray-500 pt-4 border-t border-gray-100">
              © 2025 KickZone. Tất cả quyền được bảo lưu.
            </div>
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
