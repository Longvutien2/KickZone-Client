'use client';
import React from 'react';
import { Card, Button } from 'antd';
import { EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import Link from 'next/link';
import Image from 'next/image';
import { FootballField } from '@/models/football_field';

interface FieldInfoCardProps {
  footballField: FootballField;
}

const FieldInfoCard: React.FC<FieldInfoCardProps> = ({ footballField }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Thông tin sân bóng</span>
        </div>
      }
      className="shadow-sm border border-gray-200 rounded-xl overflow-hidden mb-6"
      cover={
        <div className="relative h-40 sm:h-48 md:h-56 w-full overflow-hidden">
          <Image
            alt={`Hình ảnh sân bóng ${footballField?.name || 'KickZone'}`}
            src={footballField?.image || 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&crop=center'}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            priority={false}
            placeholder="blur"
            quality={85}
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>
      }
    >
      <div className="space-y-3">
        <h2 className="text-lg md:text-xl font-bold text-gray-800">{footballField?.name}</h2>
        <div className="space-y-2">
          <p className="text-gray-600 flex items-start gap-2 text-sm">
            <EnvironmentOutlined className="text-[#FE6900] mt-0.5 flex-shrink-0" />
            <span>
              {footballField?.address && `${footballField.address?.detail ? `${footballField.address.detail}, ` : ""} ${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`}
            </span>
          </p>
          <p className="text-gray-600 flex items-center gap-2 text-sm">
            <PhoneOutlined className="text-[#FE6900]" />
            <span>{footballField?.phone}</span>
          </p>
        </div>
        <Link href={`/homepage/book-field/${footballField?._id}/detail`}>
          <Button
            type="primary"
            className="mt-4 w-full h-10 rounded-lg font-medium"
            style={{
              backgroundColor: '#FE6900',
            }}
          >
            📋 Xem chi tiết sân
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default FieldInfoCard;
