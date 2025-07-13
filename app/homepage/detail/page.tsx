'use client';
import { Button, Rate, Input, Tag, Avatar, Row, Col, Space, Typography, Tooltip, Badge } from "antd";
import { PhoneOutlined, ShareAltOutlined, LikeOutlined, CommentOutlined, EnvironmentOutlined, StarOutlined, ClockCircleOutlined, TeamOutlined, CameraOutlined, CalendarOutlined, DollarOutlined, SafetyOutlined, WifiOutlined, CarOutlined, ShopOutlined, HeartOutlined, EyeOutlined, MenuOutlined } from '@ant-design/icons';
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { FootballField } from "@/models/football_field";
import Image from "next/image";
import { getFootballFieldByIdSlice } from "@/features/footballField.slice";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;


const { TextArea } = Input;
interface CommentType {
    user: string,
    content: string,
    date: string
}

const navigationItems = [
    { href: "/homepage/detail", label: "Giới thiệu sân" },
    { href: "/homepage", label: "Đặt sân" },
    { href: "/homepage/find-opponent", label: "Tìm đối" },
    { href: "/contact", label: "Liên hệ" },
];

const AboutUs = () => {
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();

    const [comment, setComment] = useState<string>(''); // Trạng thái cho bình luận
    const [comments, setComments] = useState<CommentType[]>([]); // Danh sách bình luận
    const [liked, setLiked] = useState(false);
    const [viewCount, setViewCount] = useState(1247);
    const [likeCount, setLikeCount] = useState(89);
    const dispatch = useAppDispatch();
    // Kiểm tra nếu không có data
    if (!footballField) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-500 text-lg">Đang tải thông tin sân bóng...</div>
                </div>
            </div>
        );
    }

    // Xử lý việc gửi bình luận
    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value); // Cập nhật bình luận khi người dùng thay đổi
    };

    const handleCommentSubmit = () => {
        if (comment.trim()) {
            setComments([...comments, { user: 'Sporta', content: comment, date: '3 tháng trước' }]);
            setComment(''); // Sau khi gửi bình luận thì làm rỗng ô nhập
        }
    };
    useEffect(() => {
        const getData = async () => {
            await dispatch(getFootballFieldByIdSlice("67ce9ea74c79326f98b8bf8e"));
        }
        getData();
    }, [])

    return (
        <div className="container mx-auto ">
            {/* Hero Section với design mới */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 sm:mb-12">
                {/* Stadium Image với overlay gradient đẹp hơn */}
                <div className="relative h-72 sm:h-96 lg:h-[500px]">
                    <Image
                        src={footballField.image || 'https://i.imgur.com/FiGqoO8.jpeg'}
                        alt={footballField.name || "stadium"}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient overlay với nhiều lớp */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Badge trạng thái */}
                    <div className="absolute top-6 right-6">
                        <Badge
                            status={footballField.status === 'active' ? 'success' : 'processing'}
                            text={
                                <span className="text-white font-medium bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                                    {footballField.status === 'active' ? 'Đang hoạt động' : 'Sân mới'}
                                </span>
                            }
                        />
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10">
                        <div className="max-w-4xl">
                            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                <div className="flex-1">
                                    <Title level={1} className="!text-white !mb-4 !text-2xl sm:!text-3xl lg:!text-5xl font-bold">
                                        {footballField.name}
                                    </Title>

                                    <div className="flex items-center text-white/90 mb-4">
                                        <EnvironmentOutlined className="mr-3 text-lg" />
                                        <Text className="text-white text-base sm:text-lg">
                                            {footballField.address ?
                                                `${footballField.address.detail ? footballField.address.detail + ', ' : ''}${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`
                                                : 'Địa chỉ chưa cập nhật'
                                            }
                                        </Text>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                                            <StarOutlined className="text-yellow-400 mr-2" />
                                            <Rate disabled value={4.5} className="text-sm" />
                                            <span className="text-white ml-2 font-medium">(4.5)</span>
                                        </div>

                                        <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                                            <ClockCircleOutlined className="text-green-400 mr-2" />
                                            <span className="text-white font-medium">Mở cửa 24/7</span>
                                        </div>

                                        <div className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2">
                                            <TeamOutlined className="text-blue-400 mr-2" />
                                            <span className="text-white font-medium">Sân 5v5, 7v7</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons với design mới */}
                <div className="p-6 sm:p-8">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <Button
                            icon={<PhoneOutlined />}
                            href={`tel:${footballField.phone || '0988113113'}`}
                            type="primary"
                            size="large"
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none h-14 sm:h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <span className="hidden sm:inline">Liên hệ đặt sân ngay</span>
                            <span className="sm:hidden">Gọi ngay</span>
                        </Button>

                        <Button
                            icon={<CalendarOutlined />}
                            size="large"
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none h-14 sm:h-16 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => window.location.href = '/homepage/book-field'}
                        >
                            <span className="hidden sm:inline">Đặt sân online</span>
                            <span className="sm:hidden">Đặt sân</span>
                        </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Tooltip title="Chia sẻ sân bóng">
                            <Button
                                icon={<ShareAltOutlined />}
                                size="large"
                                className="h-12 rounded-xl border-gray-200 hover:border-orange-300 hover:text-orange-500 transition-all duration-300"
                            >
                                <span className="hidden sm:inline">Chia sẻ</span>
                            </Button>
                        </Tooltip>

                        <Tooltip title={liked ? "Bỏ yêu thích" : "Yêu thích sân"}>
                            <Button
                                icon={<HeartOutlined className={liked ? 'text-red-500' : ''} />}
                                size="large"
                                className={`h-12 rounded-xl transition-all duration-300 ${liked
                                    ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
                                    : 'border-gray-200 hover:border-red-300 hover:text-red-500'
                                    }`}
                                onClick={() => {
                                    setLiked(!liked);
                                    setLikeCount(prev => liked ? prev - 1 : prev + 1);
                                }}
                            >
                                <span className="hidden sm:inline">
                                    {liked ? 'Đã thích' : 'Yêu thích'}
                                </span>
                            </Button>
                        </Tooltip>

                        <Tooltip title="Xem bình luận">
                            <Button
                                icon={<CommentOutlined />}
                                size="large"
                                className="h-12 rounded-xl border-gray-200 hover:border-blue-300 hover:text-blue-500 transition-all duration-300"
                                onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <span className="hidden sm:inline">Bình luận</span>
                            </Button>
                        </Tooltip>

                        <Tooltip title="Báo cáo sân">
                            <Button
                                icon={<SafetyOutlined />}
                                size="large"
                                className="h-12 rounded-xl border-gray-200 hover:border-yellow-300 hover:text-yellow-600 transition-all duration-300"
                            >
                                <span className="hidden sm:inline">Báo cáo</span>
                            </Button>
                        </Tooltip>
                    </div>

                    {/* Enhanced Contact Info */}
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-orange-500 p-3 rounded-full mr-4">
                                        <PhoneOutlined className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <Text className="text-sm text-gray-600 block">Hotline đặt sân</Text>
                                        <Title level={4} className="!mb-0 !text-gray-900">
                                            {footballField.phone || '0988113113'}
                                        </Title>
                                    </div>
                                </div>
                                <div className="text-green-600 text-right">
                                    <ClockCircleOutlined className="text-lg mb-1 block" />
                                    <Text className="text-sm font-medium text-green-600">24/7</Text>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="bg-blue-500 p-3 rounded-full mr-4">
                                        <DollarOutlined className="text-white text-lg" />
                                    </div>
                                    <div>
                                        <Text className="text-sm text-gray-600 block">Giá thuê từ</Text>
                                        <Title level={4} className="!mb-0 !text-gray-900">
                                            200.000đ/giờ
                                        </Title>
                                    </div>
                                </div>
                                <div className="text-green-600 text-right">
                                    <StarOutlined className="text-lg mb-1 block" />
                                    <Text className="text-sm font-medium text-green-600">Ưu đãi</Text>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stadium Details với design mới */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                {/* Thông tin chính */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                    <div className="flex items-center mb-8">
                        <div className="bg-orange-500 p-3 rounded-full mr-4">
                            <EnvironmentOutlined className="text-white text-xl" />
                        </div>
                        <Title level={3} className="!mb-0 !text-gray-900">
                            Thông tin chi tiết
                        </Title>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-2xl border border-orange-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                                    <Text className="text-sm text-gray-600 font-medium">Tên sân bóng</Text>
                                </div>
                                <Title level={4} className="!mb-0 !text-gray-900">
                                    {footballField.name}
                                </Title>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-2xl border border-blue-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <Text className="text-sm text-gray-600 font-medium">Địa chỉ</Text>
                                </div>
                                <Text className="text-gray-900 font-semibold">
                                    {footballField.address ?
                                        `${footballField.address.detail ? footballField.address.detail + ', ' : ''}${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`
                                        : 'Chưa cập nhật địa chỉ'
                                    }
                                </Text>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-2xl border border-green-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <Text className="text-sm text-gray-600 font-medium">Số điện thoại</Text>
                                </div>
                                <Title level={4} className="!mb-0 !text-gray-900">
                                    {footballField.phone || '0988113113'}
                                </Title>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-2xl border border-purple-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                    <Text className="text-sm text-gray-600 font-medium">Trạng thái</Text>
                                </div>
                                <Tag
                                    color={footballField.status === 'active' ? 'green' : 'orange'}
                                    className="text-base px-3 py-1 rounded-full"
                                >
                                    {footballField.status === 'active' ? '🟢 Đang hoạt động' : '🟡 Sân mới'}
                                </Tag>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-2xl border border-yellow-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                    <Text className="text-sm text-gray-600 font-medium">Loại sân</Text>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Tag color="blue">Sân 5v5</Tag>
                                    <Tag color="green">Sân 7v7</Tag>
                                    <Tag color="green">Sân 9v9</Tag>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-2xl border border-indigo-200">
                                <div className="flex items-center mb-2">
                                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3"></div>
                                    <Text className="text-sm text-gray-600 font-medium">Giờ hoạt động</Text>
                                </div>
                                <Text className="text-gray-900 font-semibold">
                                    🕐 Mở cửa 24/7
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Mô tả chi tiết */}
                    <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                        <Title level={4} className="!mb-4 !text-gray-900">
                            📝 Mô tả sân bóng
                        </Title>
                        <Paragraph className="text-gray-700 leading-relaxed">
                            {footballField.description || 'Sân bóng chất lượng cao với cỏ nhân tạo, đèn chiếu sáng hiện đại, hệ thống thoát nước tốt. Phù hợp cho các trận đấu 5v5 và 7v7. Có khu vực thay đồ, để xe an toàn và căng tin phục vụ.'}
                        </Paragraph>
                    </div>
                </div>

                {/* Tiện ích và dịch vụ */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <Title level={4} className="!mb-6 !text-gray-900">
                            🏆 Tiện ích & Dịch vụ
                        </Title>
                        <div className="space-y-4">
                            <div className="flex items-center p-3 bg-green-50 rounded-xl border border-green-200">
                                <WifiOutlined className="text-green-500 text-lg mr-3" />
                                <Text className="text-gray-700 font-medium">WiFi miễn phí</Text>
                            </div>
                            <div className="flex items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                                <CarOutlined className="text-blue-500 text-lg mr-3" />
                                <Text className="text-gray-700 font-medium">Bãi đỗ xe rộng</Text>
                            </div>
                            <div className="flex items-center p-3 bg-orange-50 rounded-xl border border-orange-200">
                                <ShopOutlined className="text-orange-500 text-lg mr-3" />
                                <Text className="text-gray-700 font-medium">Căng tin</Text>
                            </div>
                            <div className="flex items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                                <SafetyOutlined className="text-purple-500 text-lg mr-3" />
                                <Text className="text-gray-700 font-medium">An ninh 24/7</Text>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-xl p-6">
                        <Title level={4} className="!mb-6 !text-gray-900">
                            💰 Bảng giá thuê sân
                        </Title>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                                <Text className="font-medium text-gray-700">Sáng (6h-12h)</Text>
                                <Text className="font-bold text-orange-600">200.000đ</Text>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                                <Text className="font-medium text-gray-700">Chiều (12h-18h)</Text>
                                <Text className="font-bold text-blue-600">250.000đ</Text>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                                <Text className="font-medium text-gray-700">Tối (18h-22h)</Text>
                                <Text className="font-bold text-purple-600">300.000đ</Text>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-8 sm:mb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <div className="bg-orange-500 p-3 rounded-full mr-4">
                            <CameraOutlined className="text-white text-xl" />
                        </div>
                        <Title level={3} className="!mb-0 !text-gray-900">
                            📸 Thư viện hình ảnh
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        className="bg-orange-500 hover:bg-orange-600 border-orange-500 rounded-full"
                    >
                        Xem tất cả
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Main image */}
                    <div className="col-span-2 row-span-2 relative group cursor-pointer">
                        <div className="aspect-square bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl overflow-hidden">
                            <Image
                                src={footballField.image || 'https://i.imgur.com/FiGqoO8.jpeg'}
                                alt="Sân bóng chính"
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                <EyeOutlined className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </div>
                    </div>

                    {/* Smaller images */}
                    {[1, 2, 3, 4, 5, 6].map((index) => (
                        <div key={index} className="relative group cursor-pointer">
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
                                {index <= 4 ? (
                                    <>
                                        <CameraOutlined className="text-gray-400 text-2xl" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                            <EyeOutlined className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Text className="text-gray-500 font-bold text-lg">+{index + 5}</Text>
                                        <Text className="text-gray-400 text-xs block">ảnh khác</Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Image categories */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <Tag color="orange" className="px-3 py-1 rounded-full">🏟️ Sân bóng</Tag>
                    <Tag color="blue" className="px-3 py-1 rounded-full">🚿 Phòng thay đồ</Tag>
                    <Tag color="green" className="px-3 py-1 rounded-full">🅿️ Bãi đỗ xe</Tag>
                    <Tag color="purple" className="px-3 py-1 rounded-full">🏪 Căng tin</Tag>
                </div>
            </div>

            {/* Comments Section */}
            <div id="comments-section" className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <div className="bg-orange-500 p-3 rounded-full mr-4">
                            <CommentOutlined className="text-white text-xl" />
                        </div>
                        <Title level={3} className="!mb-0 !text-gray-900">
                            💬 Đánh giá & Bình luận
                        </Title>
                    </div>
                    <Badge
                        count={comments.length}
                        showZero
                        style={{ backgroundColor: '#f97316' }}
                        className="text-lg"
                    />
                </div>

                {/* Rating summary */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 mb-8">
                    <Row gutter={[24, 16]} align="middle">
                        <Col xs={24} sm={12}>
                            <div className="text-center sm:text-left">
                                <div className="flex items-center justify-center sm:justify-start mb-2">
                                    <Text className="text-4xl font-bold text-orange-600 mr-3">4.5</Text>
                                    <div>
                                        <Rate disabled value={4.5} className="text-lg" />
                                        <Text className="block text-gray-600 text-sm">Dựa trên 127 đánh giá</Text>
                                    </div>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <div key={star} className="flex items-center gap-2">
                                        <Text className="text-sm w-8">{star}⭐</Text>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-orange-500 h-2 rounded-full"
                                                style={{ width: `${star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 3 : 2}%` }}
                                            ></div>
                                        </div>
                                        <Text className="text-sm text-gray-600 w-8">
                                            {star === 5 ? 89 : star === 4 ? 25 : star === 3 ? 7 : star === 2 ? 4 : 2}
                                        </Text>
                                    </div>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Comment Form */}
                <div className="mb-8 sm:mb-12">
                    <Title level={4} className="!mb-6 !text-gray-900">
                        ✍️ Viết đánh giá của bạn
                    </Title>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl border border-gray-200">
                        <div className="flex items-start space-x-4">
                            <Avatar size={64} className="bg-gradient-to-r from-orange-500 to-orange-600 flex-shrink-0 text-xl font-bold">
                                U
                            </Avatar>
                            <div className="flex-1">
                                {/* Rating input */}
                                <div className="mb-4">
                                    <Text className="block mb-2 font-medium text-gray-700">Đánh giá của bạn:</Text>
                                    <Rate allowHalf defaultValue={5} className="text-2xl" />
                                </div>

                                <TextArea
                                    rows={5}
                                    value={comment}
                                    onChange={handleCommentChange}
                                    placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này... (Chất lượng sân, dịch vụ, giá cả, vị trí...)"
                                    className="rounded-2xl border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-base"
                                    maxLength={500}
                                />
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-500">
                                            {comment.length}/500 ký tự
                                        </span>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Text>Gắn thẻ:</Text>
                                            <Tag className="cursor-pointer hover:bg-orange-100" onClick={() => setComment(prev => prev + ' #chất_lượng_tốt')}>
                                                #chất_lượng_tốt
                                            </Tag>
                                            <Tag className="cursor-pointer hover:bg-blue-100" onClick={() => setComment(prev => prev + ' #giá_hợp_lý')}>
                                                #giá_hợp_lý
                                            </Tag>
                                            <Tag className="cursor-pointer hover:bg-green-100" onClick={() => setComment(prev => prev + ' #dịch_vụ_tốt')}>
                                                #dịch_vụ_tốt
                                            </Tag>
                                        </div>
                                    </div>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={handleCommentSubmit}
                                        disabled={!comment.trim()}
                                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-none rounded-2xl px-8 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                        🚀 Gửi đánh giá
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <Title level={4} className="!mb-0 !text-gray-900">
                            📝 Tất cả đánh giá ({comments.length})
                        </Title>
                        <div className="flex items-center gap-2">
                            <Text className="text-sm text-gray-600">Sắp xếp:</Text>
                            <Button size="small" type="text" className="text-orange-500">
                                Mới nhất
                            </Button>
                        </div>
                    </div>

                    {comments.length > 0 ? (
                        <div className="space-y-6">
                            {comments.map((com, index) => (
                                <div key={index} className="bg-gradient-to-r from-white to-gray-50 p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                                    <div className="flex items-start space-x-4">
                                        <Avatar size={56} className="bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0 text-lg font-bold">
                                            {com.user.charAt(0)}
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <Title level={5} className="!mb-1 !text-gray-900">
                                                        {com.user}
                                                    </Title>
                                                    <div className="flex items-center gap-2">
                                                        <Rate disabled value={4.5} className="text-sm" />
                                                        <Text className="text-sm text-gray-500">{com.date}</Text>
                                                    </div>
                                                </div>
                                                <Tag color="green" className="rounded-full">
                                                    ✅ Đã xác thực
                                                </Tag>
                                            </div>

                                            <Paragraph className="text-gray-700 leading-relaxed mb-4">
                                                {com.content}
                                            </Paragraph>

                                            {/* Tags in comment */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <Tag color="orange">#chất_lượng_tốt</Tag>
                                                <Tag color="blue">#giá_hợp_lý</Tag>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-6 text-sm text-gray-500">
                                                    <button className="flex items-center space-x-2 hover:text-orange-500 transition-colors group">
                                                        <LikeOutlined className="group-hover:scale-110 transition-transform" />
                                                        <span>Hữu ích (12)</span>
                                                    </button>
                                                    <button className="flex items-center space-x-2 hover:text-blue-500 transition-colors group">
                                                        <CommentOutlined className="group-hover:scale-110 transition-transform" />
                                                        <span>Trả lời</span>
                                                    </button>
                                                    <button className="flex items-center space-x-2 hover:text-gray-700 transition-colors">
                                                        <ShareAltOutlined />
                                                        <span>Chia sẻ</span>
                                                    </button>
                                                </div>
                                                <Text className="text-xs text-gray-400">
                                                    Đã chỉnh sửa
                                                </Text>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load more button */}
                            <div className="text-center pt-6">
                                <Button
                                    size="large"
                                    className="rounded-full px-8 border-orange-300 text-orange-500 hover:bg-orange-50"
                                >
                                    Xem thêm đánh giá
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                            <div className="max-w-md mx-auto">
                                <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CommentOutlined className="text-3xl text-orange-500" />
                                </div>
                                <Title level={4} className="!mb-3 !text-gray-700">
                                    Chưa có đánh giá nào
                                </Title>
                                <Paragraph className="text-gray-500 mb-6">
                                    Hãy là người đầu tiên chia sẻ trải nghiệm của bạn về sân bóng này!
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    className="bg-orange-500 hover:bg-orange-600 border-orange-500 rounded-full px-8"
                                    onClick={() => document.querySelector('textarea')?.focus()}
                                >
                                    Viết đánh giá đầu tiên
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

