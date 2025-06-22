'use client';
import React, { useState } from 'react';
import { Tag, Slider, Switch, Select, Button } from 'antd';
import { FilterOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';

interface CompactFilterProps {
  selectedFieldType: string;
  onFieldTypeChange: (type: string) => void;
  selectedTimeSlot?: string | null;
  onTimeSlotChange: (time: string | null) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  showAvailableOnly: boolean;
  onAvailableOnlyChange: (checked: boolean) => void;
  timeSlots: any[];
  maxPrice: number;
}

const CompactFilter: React.FC<CompactFilterProps> = ({
  selectedFieldType,
  onFieldTypeChange,
  selectedTimeSlot,
  onTimeSlotChange,
  priceRange,
  onPriceRangeChange,
  showAvailableOnly,
  onAvailableOnlyChange,
  timeSlots,
  maxPrice
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fieldTypes = [
    { key: 'all', label: 'Tất cả', value: 'all' },
    { key: '5v5', label: 'Sân 5', value: '5v5' },
    { key: '7v7', label: 'Sân 7', value: '7v7' },
    { key: '11v11', label: 'Sân 11', value: '11v11' }
  ];

  // Lấy unique timeSlots và sort
  const uniqueTimeSlots = Array.from(
    new Set(timeSlots.map((slot: any) => slot.time))
  ).sort();

  const timeSlotOptions = [
    { value: null, label: 'Chọn khung giờ' },
    ...uniqueTimeSlots.map(time => ({
      value: time,
      label: time
    }))
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const clearAllFilters = () => {
    onFieldTypeChange('all');
    onTimeSlotChange(null);
    onPriceRangeChange([0, maxPrice]);
    onAvailableOnlyChange(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
      {/* Compact Filter - Always Visible */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Field Type Filter */}
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-[#FE6900] text-sm" />
            <span className="font-medium text-gray-700 text-sm">Loại sân:</span>
          </div>

          <div className="flex gap-2 flex-wrap flex-1">
            {fieldTypes.map((type) => (
              <Tag
                key={type.key}
                color={selectedFieldType === type.value ? "orange" : "default"}
                className={`cursor-pointer px-3 py-1 text-xs font-medium hover:scale-105 transition-all duration-200 ${selectedFieldType === type.value
                    ? 'bg-[#FE6900] text-white border-[#FE6900]'
                    : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-[#FE6900] hover:border-[#FE6900]'
                  }`}
                onClick={() => onFieldTypeChange(type.value)}
              >
                {type.label}
              </Tag>
            ))}
          </div>

          {/* Toggle Advanced Filter Button */}
          <Button
            type="text"
            size="small"
            icon={showAdvanced ? <UpOutlined /> : <DownOutlined />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[#FE6900] hover:text-[#e55a00] flex items-center gap-1"
          >
            <span className="text-xs">Bộ lọc chi tiết</span>
          </Button>
        </div>
      </div>

      {/* Advanced Filter - Collapsible */}
      {showAdvanced && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex flex-col gap-4">
            {/* Time Slot Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                Khung giờ:
              </label>
              <Select
                value={selectedTimeSlot}
                onChange={onTimeSlotChange}
                placeholder="Chọn khung giờ"
                className="w-full"
                size="small"
                allowClear
              >
                {timeSlotOptions.map(option => (
                  <Select.Option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                Khoảng giá: {formatPrice(priceRange[0])}đ - {formatPrice(priceRange[1])}đ
              </label>
              <div className="w-64">
                <Slider
                  range
                  min={0}
                  max={maxPrice}
                  step={50000}
                  value={priceRange}
                  onChange={(value) => onPriceRangeChange(value as [number, number])}
                  className="mt-2"
                  styles={{
                    track: { backgroundColor: '#FE6900' },
                    handle: { borderColor: '#FE6900', backgroundColor: '#FE6900' }
                  }}
                />
              </div>
            </div>

            {/* Available Only Filter */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                Chỉ hiển thị khung giờ còn trống:
              </label>
              <Switch
                checked={showAvailableOnly}
                onChange={onAvailableOnlyChange}
                size="small"
                style={{
                  backgroundColor: showAvailableOnly ? '#FE6900' : undefined
                }}
              />
            </div>
          </div>

          {/* Clear All Button */}
          <div className="mt-4 flex justify-end">
            <Button
              type="text"
              size="small"
              onClick={clearAllFilters}
              className="text-gray-500 hover:text-gray-700 text-xs"
            >
              Xóa tất cả bộ lọc
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactFilter;
