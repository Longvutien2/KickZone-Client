'use client'
import { TimeSlot } from '@/models/field'
import { CalendarOutlined, ClockCircleOutlined, FilterOutlined } from '@ant-design/icons'
import { Button, DatePicker, Select } from 'antd'
import { memo } from 'react'

interface FilterSectionProps {
    filtersVisible: boolean
    toggleFilters: () => void
    clearFilters: () => void
    selectedDate: any
    selectedTime: string | null
    handleDateChange: (date: any) => void
    handleTimeChange: (time: string) => void
    uniqueTimeSlots: string[]
    filteredMatchesLength: number
    value: string
}

const FilterSection = memo(({
    filtersVisible,
    toggleFilters,
    clearFilters,
    selectedDate,
    selectedTime,
    handleDateChange,
    handleTimeChange,
    uniqueTimeSlots,
    filteredMatchesLength,
    value
}: FilterSectionProps) => {
    return (
        <>
            {/* Bộ lọc và thống kê */}
            <div className="bg-white shadow rounded-xl px-3 sm:px-4 py-3 mx-0 sm:mx-4 mt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-2 gap-3 sm:gap-0">
                    <div className="flex items-center flex-wrap gap-2">
                        <Button
                            icon={<FilterOutlined />}
                            onClick={toggleFilters}
                            className="mr-0 sm:mr-2"
                            size="small"
                        >
                            <span className="hidden sm:inline">Bộ lọc</span>
                            <span className="sm:hidden">Lọc</span>
                        </Button>
                        {(value || selectedDate || selectedTime) && (
                            <Button 
                                type="link" 
                                onClick={clearFilters} 
                                className="text-orange-500 p-0 h-auto text-xs sm:text-sm"
                            >
                                Xóa bộ lọc
                            </Button>
                        )}
                    </div>
                </div>

                {/* Mở rộng bộ lọc */}
                {filtersVisible && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 pt-3 border-t border-gray-200">
                        {/* Ngày */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Ngày thi đấu
                            </label>
                            <DatePicker
                                className="w-full"
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                                value={selectedDate}
                                onChange={handleDateChange}
                                suffixIcon={<CalendarOutlined style={{ color: '#f97316' }} />}
                                allowClear
                                size="small"
                            />
                        </div>

                        {/* Giờ - Sử dụng Select thay vì TimePicker */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                                Khung giờ
                            </label>
                            <Select
                                showSearch
                                value={selectedTime}
                                onChange={handleTimeChange}
                                placeholder="Chọn khung giờ"
                                className="w-full"
                                style={{ width: '100%' }}
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={uniqueTimeSlots.map((time: string) => ({
                                    value: time,
                                    label: time
                                }))}
                                suffixIcon={<ClockCircleOutlined style={{ color: '#f97316' }} />}
                                allowClear
                                notFoundContent="Không có khung giờ nào"
                                size="small"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Hiển thị kết quả lọc */}
            <div className="px-0 sm:px-4 mt-4 text-xs sm:text-sm text-gray-500">
                {filtersVisible && (
                    filteredMatchesLength > 0 ? (
                        <p>Tìm thấy {filteredMatchesLength} trận đấu sắp tới</p>
                    ) : (
                        <p>Không tìm thấy trận đấu nào sắp tới phù hợp với bộ lọc</p>
                    )
                )}
            </div>
        </>
    )
})

FilterSection.displayName = 'FilterSection'

export default FilterSection
