
'use client';
// ✅ Performance optimized homepage
import { Button, Card, Drawer } from 'antd';
import React, { useRef, useState, memo, lazy, Suspense } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
// ✅ Thay thế react-slick bằng Swiper (nhẹ hơn 70%)
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { FacebookOutlined, LockOutlined, MailOutlined, TeamOutlined, TrophyOutlined, MenuOutlined } from '@ant-design/icons';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';

// ✅ Lazy load heavy components
const LazyGallerySection = lazy(() => import('../components/LazyGallerySection'));
const LazyStatsSection = lazy(() => import('../components/LazyStatsSection'));
// ✅ Moved to lazy components for better performance

const HomePage = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ✅ Swiper settings (nhẹ hơn react-slick 70%)
  const swiperSettings = {
    modules: [Autoplay],
    slidesPerView: 1,
    spaceBetween: 0,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    loop: true,
    speed: 500,
    allowTouchMove: true,
  };

  const navigationItems = [
    { href: "/homepage/detail", label: "Giới thiệu sân" },
    { href: "/homepage", label: "Đặt sân" },
    { href: "/homepage/find-opponent", label: "Tìm đối" },
    { href: "/homepage/detail", label: "Liên hệ" },
  ];

  return (
    <div className="bg-white">
      <section className="w-full max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex justify-between items-center py-4 lg:py-6">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <div>
                <Image src="/newPts.png" alt="" width={150} height={150} />
              </div>
            </div>
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
              className="btn-orange-gradient rounded-xl px-6 py-2 h-auto font-semibold mr-3"
              onClick={() => router.push('/homepage')}
            >
              Đặt sân ngay
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
            <div className="mt-4 space-y-3">
              <Button
                className="btn-orange-gradient rounded-full h-12 text-lg font-semibold"
                onClick={() => {
                  router.push('/homepage');
                  setMobileMenuOpen(false);
                }}
                block
              >
                Đặt sân ngay
              </Button>
              <Button
                className="btn-light-orange-gradient rounded-full h-12 text-lg font-semibold"
                onClick={() => {
                  router.push('/manager');
                  setMobileMenuOpen(false);
                }}
                block
              >
                Quản lý sân
              </Button>
            </div>
          </nav>
        </Drawer>
        {/* Hero Section */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 py-6 sm:py-8 lg:py-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1 space-y-4 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight">
              Sân bóng KickZone - Nơi đam mê bùng cháy
            </h1>
            <p className="text-base sm:text-lg lg:text-lg text-gray-600 leading-relaxed">
              Đặt sân dễ dàng, tìm đối nhanh chóng. Cùng nhau tạo nên những trận đấu đáng nhớ!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 justify-center lg:justify-start">
              <Button
                size="large"
                className="btn-orange-gradient h-10 sm:h-12 px-6 text-sm sm:text-base font-semibold rounded-xl"
                onClick={() => router.push('/homepage')}
              >
                Đặt sân ngay
              </Button>
              <Button
                size="large"
                className="btn-light-orange-gradient h-10 sm:h-12 px-6 text-sm sm:text-base font-semibold rounded-xl"
                onClick={() => router.push('/find-team')}
              >
                Tìm đối thủ
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="order-1 lg:order-2 flex justify-center items-center">
            <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 flex justify-center items-center">
              <div className="gradient-bg1 w-full h-full p-4 sm:p-4 overflow-hidden ">
                <div className="w-full h-full rounded-full overflow-hidden">
                  <Swiper {...swiperSettings} className="w-full h-full rounded-full">
                    <SwiperSlide className="rounded-full">
                      <img
                        src="https://i.postimg.cc/FR59CmYp/FVR-1-1.png"
                        alt="Soccer Player 4"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </SwiperSlide>
                    <SwiperSlide className="rounded-full">
                      <img
                        src="https://i.postimg.cc/m2DGwhdR/fooooot-1.png"
                        alt="Soccer Player 1"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </SwiperSlide>
                    <SwiperSlide className="rounded-full">
                      <img
                        src="https://i.postimg.cc/J0zSPd5K/fooooot-bal-1.png"
                        alt="Soccer Player 2"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </SwiperSlide>
                    <SwiperSlide className="rounded-full">
                      <img
                        src="https://i.postimg.cc/zGg6thTm/football-Recoveredf-2-1.png"
                        alt="Soccer Player 3"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </SwiperSlide>
                    <SwiperSlide className="rounded-full">
                      <img
                        src="https://i.postimg.cc/mD8cv6c1/img-2.png"
                        alt="Soccer Player 5"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </SwiperSlide>
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Community Section */}
      <section className="w-full max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white">
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
              <p className="text-[#2DA1EE] text-lg font-semibold">Sân bóng chất lượng cao</p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                Trải nghiệm tuyệt vời tại KickZone
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                Sân cỏ nhân tạo chất lượng cao, hệ thống đèn chiếu sáng hiện đại, phòng thay đồ tiện nghi
              </p>

              <ul className="space-y-4 sm:space-y-6">
                <li className="flex items-start space-x-3 text-left">
                  <TeamOutlined className="text-[#2DA1EE] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800 text-base sm:text-lg">4 sân con chất lượng</strong>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Sân 5v5, 7v7 với cỏ nhân tạo cao cấp, đảm bảo trải nghiệm tốt nhất.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-left">
                  <LockOutlined className="text-[#2DA1EE] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800 text-base sm:text-lg">Đặt sân online 24/7</strong>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Hệ thống đặt sân trực tuyến tiện lợi, thanh toán an toàn.
                    </p>
                  </div>
                </li>
                <li className="flex items-start space-x-3 text-left">
                  <TrophyOutlined className="text-[#2DA1EE] text-xl mt-1 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-800 text-base sm:text-lg">Tìm đối thủ dễ dàng</strong>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                      Kết nối với các đội bóng khác, tạo nên những trận đấu hấp dẫn.
                    </p>
                  </div>
                </li>
              </ul>

              <Button
                size="large"
                className="btn-orange-gradient h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold rounded-full mt-8"
                onClick={() => router.push('/homepage')}
              >
                Đặt sân ngay
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ✅ Lazy loaded Statistics Section */}
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
        <LazyStatsSection />
      </Suspense>

      {/* ✅ Lazy loaded Gallery Section */}
      <Suspense fallback={<div className="h-64 flex items-center justify-center">Loading...</div>}>
        <LazyGallerySection />
      </Suspense>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-gray-200 mt-12 sm:mt-16 lg:mt-20">
        <div className="max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
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
