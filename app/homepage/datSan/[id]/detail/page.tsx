'use client';
import { Card, Button, Rate, Input, Collapse, List, Tag, Divider, Avatar } from "antd";
import { PhoneOutlined, ShareAltOutlined, LikeOutlined, CommentOutlined, EnvironmentOutlined, StarOutlined, ClockCircleOutlined, TeamOutlined, CameraOutlined } from '@ant-design/icons';
import { useState } from "react";
import { useAppSelector } from "@/store/hook";
import { FootballField } from "@/models/football_field";
import Image from "next/image";

const { Panel } = Collapse;
const { TextArea } = Input;
interface CommentType {
    user: string,
    content: string,
    date: string
}
const AboutUs = () => {
    const footballField = useAppSelector(state => state.footballField.detail) as FootballField;

    const [comment, setComment] = useState<string>(''); // Trạng thái cho bình luận
    const [comments, setComments] = useState<CommentType[]>([]); // Danh sách bình luận

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-0 py-4 sm:py-6">
                    <h2 className="text-2xl sm:text-2xl font-bold text-gray-900">Chi tiết sân bóng</h2>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-0">
                {/* Hero Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 sm:mb-8">
                    {/* Stadium Image */}
                    <div className="relative h-64 sm:h-80 lg:h-96">
                        <Image
                            src={footballField.image || 'https://i.imgur.com/FiGqoO8.jpeg'}
                            alt={footballField.name || "stadium"}
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6">
                            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{footballField.name}</h2>
                                    <div className="flex items-center text-white/90 mb-2">
                                        <EnvironmentOutlined className="mr-2" />
                                        <span className="text-sm sm:text-base">
                                            {footballField.address ?
                                                `${footballField.address.detail ? footballField.address.detail + ', ' : ''}${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`
                                                : 'Địa chỉ chưa cập nhật'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                                            <StarOutlined className="text-yellow-400 mr-1" />
                                            <Rate disabled value={4.5} className="text-sm" />
                                            <span className="text-white ml-2 text-sm">(4.5)</span>
                                        </div>
                                        <Tag color="green" className="hidden sm:inline-flex">
                                            {footballField.status === 'active' ? 'Đang hoạt động' : 'Sân mới'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 sm:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                            <Button
                                icon={<PhoneOutlined />}
                                href={`tel:${footballField.phone || '0988113113'}`}
                                type="primary"
                                size="large"
                                className="bg-orange-500 hover:bg-orange-600 border-orange-500 h-12 sm:h-14"
                            >
                                <span className="hidden sm:inline">Liên hệ đặt sân</span>
                                <span className="sm:hidden">Gọi ngay</span>
                            </Button>
                            <Button
                                icon={<ShareAltOutlined />}
                                size="large"
                                className="h-12 sm:h-14"
                            >
                                Chia sẻ
                            </Button>
                            <Button
                                icon={<LikeOutlined />}
                                size="large"
                                className="h-12 sm:h-14"
                            >
                                Yêu thích
                            </Button>
                            <Button
                                icon={<CommentOutlined />}
                                size="large"
                                className="h-12 sm:h-14"
                            >
                                Bình luận
                            </Button>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-4 sm:mt-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                                <div className="flex items-center">
                                    <PhoneOutlined className="text-orange-500 mr-3 text-lg" />
                                    <div>
                                        <p className="text-sm text-gray-600">Hotline đặt sân</p>
                                        <p className="font-semibold text-gray-900">{footballField.phone || '0988113113'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-green-600">
                                    <ClockCircleOutlined className="mr-2" />
                                    <span className="text-sm font-medium">Mở cửa 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stadium Details */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 sm:mb-8">
                    <div className="flex items-center mb-6">
                        <EnvironmentOutlined className="text-orange-500 mr-3 text-xl" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Thông tin sân bóng</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Tên sân</p>
                                    <p className="font-semibold text-gray-900">{footballField.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Địa chỉ</p>
                                    <p className="font-semibold text-gray-900">
                                        {footballField.address ?
                                            `${footballField.address.detail ? footballField.address.detail + ', ' : ''}${footballField.address.ward}, ${footballField.address.district}, ${footballField.address.province}`
                                            : 'Chưa cập nhật địa chỉ'
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Số điện thoại</p>
                                    <p className="font-semibold text-gray-900">{footballField.phone || 'Chưa cập nhật'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Trạng thái</p>
                                    <div className="flex items-center">
                                        <Tag color={footballField.status === 'Hoạt động' ? 'green' : 'orange'}>
                                            {footballField.status === 'Hoạt động' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600">Mô tả</p>
                                    <p className="font-semibold text-gray-900">
                                        {footballField.description || 'Sân bóng chất lượng cao với cỏ nhân tạo, đèn chiếu sáng hiện đại'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Information Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Hình ảnh */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <CameraOutlined className="text-orange-500 mr-3 text-xl" />
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Hình ảnh</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                <CameraOutlined className="text-gray-400 text-2xl" />
                            </div>
                            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                <CameraOutlined className="text-gray-400 text-2xl" />
                            </div>
                            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                <CameraOutlined className="text-gray-400 text-2xl" />
                            </div>
                            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                                <span className="text-gray-500 text-sm">+5</span>
                            </div>
                        </div>
                        <Button type="link" className="w-full mt-3 text-orange-500">
                            Xem tất cả hình ảnh
                        </Button>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mt-6 sm:mt-8">
                    <div className="flex items-center mb-6">
                        <CommentOutlined className="text-orange-500 mr-3 text-xl" />
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Bình luận</h3>
                        <Tag color="blue" className="ml-auto">{comments.length}</Tag>
                    </div>

                    {/* Comment Form */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-start space-x-4">
                            <Avatar size="large" className="bg-orange-500 flex-shrink-0">
                                U
                            </Avatar>
                            <div className="flex-1">
                                <TextArea
                                    rows={4}
                                    value={comment}
                                    onChange={handleCommentChange}
                                    placeholder="Chia sẻ trải nghiệm của bạn về sân bóng này..."
                                    className="rounded-xl border-gray-200 focus:border-orange-500"
                                />
                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-sm text-gray-500">
                                        {comment.length}/500 ký tự
                                    </span>
                                    <Button
                                        type="primary"
                                        onClick={handleCommentSubmit}
                                        disabled={!comment.trim()}
                                        className="bg-orange-500 hover:bg-orange-600 border-orange-500 rounded-full px-6"
                                    >
                                        Gửi bình luận
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div className="space-y-6">
                            <Divider className="my-6" />
                            {comments.map((com, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <Avatar size="large" className="bg-blue-500 flex-shrink-0">
                                        {com.user.charAt(0)}
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="bg-gray-50 rounded-2xl p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900">{com.user}</h4>
                                                <span className="text-sm text-gray-500">{com.date}</span>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{com.content}</p>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                                            <button className="flex items-center space-x-1 hover:text-orange-500 transition-colors">
                                                <LikeOutlined />
                                                <span>Thích</span>
                                            </button>
                                            <button className="flex items-center space-x-1 hover:text-orange-500 transition-colors">
                                                <CommentOutlined />
                                                <span>Trả lời</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-12">
                            <CommentOutlined className="text-4xl text-gray-300 mb-4" />
                            <p className="text-lg mb-2">Chưa có bình luận nào</p>
                            <p className="text-sm">Hãy là người đầu tiên chia sẻ trải nghiệm!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

