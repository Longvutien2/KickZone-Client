'use client';
import React, { memo } from 'react';
import { motion } from 'framer-motion';

const images = [
  'https://i.postimg.cc/d1nNjhwC/Gallery-3.jpg',
  'https://i.postimg.cc/PfynSq22/Gallery.jpg',
  'https://i.postimg.cc/25LCJfV3/Gallery-1-1-300x195.jpg',
  'https://i.postimg.cc/qqbY4zFr/Gallery-4.jpg',
  'https://i.postimg.cc/ZKLnFZdS/Gallery-2-1.jpg',
];

const LazyGallerySection = memo(() => {
  return (
    <section className="w-full max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        Hình ảnh sân bóng KickZone
      </h2>
      <p className="text-gray-500 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed">
        Khám phá không gian sân bóng hiện đại với cơ sở vật chất đầy đủ.
        Nơi lý tưởng để bạn thỏa sức đam mê bóng đá.
      </p>

      <motion.div
        initial={{ opacity: 0, x: -300 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.4 }}
        className="mb-6 sm:mb-8 "
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="group">
            <img
              src={images[0]}
              alt="Khoảnh khắc bóng đá 1"
              className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              loading="lazy"
            />
          </div>
          <div className="group">
            <img
              src={images[1]}
              alt="Khoảnh khắc bóng đá 2"
              className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              loading="lazy"
            />
          </div>
          <div className="group sm:col-span-2 lg:col-span-1">
            <img
              src={images[2]}
              alt="Khoảnh khắc bóng đá 3"
              className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              loading="lazy"
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
              loading="lazy"
            />
          </div>
          <div className="group">
            <img
              src={images[4]}
              alt="Khoảnh khắc bóng đá 5"
              className="w-full h-48 sm:h-56 lg:h-64 rounded-xl object-cover shadow-sm group-hover:shadow-lg transition-shadow duration-300"
              loading="lazy"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
});

LazyGallerySection.displayName = 'LazyGallerySection';

export default LazyGallerySection;
