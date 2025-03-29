'use client';
import { AutoComplete, Input } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { FootballField } from '@/models/football_field';
import Card from '@/components/Card';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getListFootballFieldSlice } from '@/features/footballField.slice';
import { AppDispatch } from '@/store/store';
import { addBreadcrumb, setBreadcrumb } from '@/features/breadcrumb.slice';

const BookField = () => {
  const [searchValue, setSearchValue] = useState<string>(''); // Dữ liệu cho tìm kiếm
  const [selectedLocation, setSelectedLocation] = useState<string>(''); // Khu vực đã chọn
  const [filteredData, setFilteredData] = useState<FootballField[]>([]); // Dữ liệu lọc theo search
  const [dfData, setdfData] = useState<FootballField[]>([]); // Dữ liệu gốc để tham chiếu
  const dispatch = useDispatch<AppDispatch>();

  // Lấy tất cả khu vực (location) từ filteredData[]
  const locations = [...new Set(filteredData?.map((item: FootballField) => item.address))];

  // Lọc data theo khu vực đã chọn
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value); // Lưu khu vực đã chọn
    if (value === "") {
      setFilteredData(dfData);
    } else {
      const filtered = dfData.filter((item) =>
        item.address.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered); // Cập nhật dữ liệu lọc
    }
  };

  // Lọc dữ liệu theo tên sân bóng (searchValue)
  const handleSearch = (value: string) => {
    setSearchValue(value); // Lưu giá trị tìm kiếm
    if (value === "") {
      setFilteredData(dfData);
    } else {
      const filtered = dfData.filter((item) =>
        item.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredData(filtered); // Cập nhật dữ liệu lọc
    }
  };

  const handleSearchEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Lọc dữ liệu khi nhấn Enter
      const filtered = dfData.filter((item) =>
        item.name.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredData(filtered); // Cập nhật dữ liệu lọc
    }
  };

  // Lấy dữ liệu và sắp xếp
  useEffect(() => {
    const getData = async () => {
      const data = await dispatch(getListFootballFieldSlice());
      setFilteredData(data.payload as FootballField[]);
      setdfData(data.payload as FootballField[]); // Lưu dữ liệu gốc
      dispatch(setBreadcrumb([
        { name: 'Home', url: '/' },  // Breadcrumb gốc
        { name: 'Đặt sân', url: '/homepage/datSan' },  // Breadcrumb cho trang này
      ]));
    };
    getData();
  }, [dispatch]);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Sân bóng</h1>
      <div className="items-center w-full my-4">
        <div className='w-full mb-2'>
          <AutoComplete
            value={selectedLocation}
            onChange={handleLocationChange}
            options={locations
              .filter(location =>
                location.toLowerCase().includes(selectedLocation.toLowerCase())
              )
              .map((location) => ({
                value: location,
              }))
            }
            className='w-full'
          >
            <Input
              prefix={<EnvironmentOutlined />}
              placeholder="Khu vực"
            />
          </AutoComplete>
        </div>

        <AutoComplete
          value={searchValue}
          onChange={handleSearch}
          onKeyDown={handleSearchEnter}
          className='w-full mb-2'
        >
          <Input
            prefix={<SearchOutlined />}
            placeholder="Nhập tên để tìm"
            className="w-full"
          />
        </AutoComplete>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredData.map((item, index) => (
          <div key={index + 1}>
            <Link href={`/homepage/datSan/${item._id}`}>
              <Card
                key={index + 1}
                name={item.name}
                location={item.address}
                imageUrl={item.image}
                verified={true}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookField;
