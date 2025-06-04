'use client';
import React from 'react';
import { Tag } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

interface FieldTypeFilterProps {
  selectedFieldType: string;
  onFieldTypeChange: (type: string) => void;
}

const FieldTypeFilter: React.FC<FieldTypeFilterProps> = ({
  selectedFieldType,
  onFieldTypeChange
}) => {
  const fieldTypes = [
    { key: 'all', label: 'Tất cả' },
    { key: '5v5', label: 'Sân 5' },
    { key: '7v7', label: 'Sân 7' },
    { key: '22', label: 'Sân 11' }
  ];

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <FilterOutlined className="text-[#FE6900] text-lg" />
          <span className="font-semibold text-gray-800">Lọc theo loại sân:</span>
        </div>
        <div className="flex gap-2 md:gap-3 flex-wrap w-full sm:w-auto">
          {fieldTypes.map((type) => (
            <Tag
              key={type.key}
              color={selectedFieldType === type.key ? "orange" : "default"}
              className={`cursor-pointer px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium hover:scale-105 transition-all duration-200 ${selectedFieldType === type.key
                ? 'bg-[#FE6900] text-white border-[#FE6900]'
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#FE6900] hover:border-[#FE6900]'
                }`}
              onClick={() => onFieldTypeChange(type.key)}
            >
              {type.label}
            </Tag>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FieldTypeFilter;
