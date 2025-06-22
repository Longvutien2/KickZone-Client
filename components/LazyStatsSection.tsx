'use client';
import React, { useRef, memo } from 'react';
import { Card } from 'antd';
import { useInView } from 'framer-motion';
import CountUp from 'react-countup';

const stats = [
  { value: 150, label: 'Khách hàng đã đặt sân' },
  { value: 89, label: 'Trận đấu diễn ra' },
  { value: 12, label: 'Đội bóng thường xuyên' },
  { value: 4, label: 'Sân con trong khu vực' },
];

const LazyStatsSection = memo(() => {
  return (
    <section className="w-full max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white text-center">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        Sân bóng KickZone trong con số
      </h2>
      <p className="text-gray-500 text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto">
        Những con số ấn tượng từ sân bóng của chúng tôi
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
  );
});

LazyStatsSection.displayName = 'LazyStatsSection';

export default LazyStatsSection;
