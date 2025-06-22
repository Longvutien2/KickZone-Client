'use client'
import { Match } from '@/models/match'
import { ClockCircleOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import Image from 'next/image'
import Link from 'next/link'
import { format, parse, startOfDay, isSameDay, differenceInDays } from 'date-fns'
import { vi } from 'date-fns/locale'
import { memo } from 'react'

interface MatchCardProps {
    match: Match
}

const MatchCard = memo(({ match }: MatchCardProps) => {
    // Hàm hiển thị trạng thái trận đấu
    const getMatchStatusTag = () => {
        switch (match.status) {
            case 'pending':
                return (
                    <Tag color="orange" className="mb-2">
                        Chờ xác nhận
                    </Tag>
                )
            case 'confirmed':
                return (
                    <Tag color="green" className="mb-2">
                        Đã xác nhận
                    </Tag>
                )
            case 'cancelled':
                return (
                    <Tag color="red" className="mb-2">
                        Đã hủy
                    </Tag>
                )
            default:
                return null
        }
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl mx-0 sm:mx-0 overflow-hidden hover:border-orange-300 transition-colors duration-200">
            {/* Hiển thị trạng thái nếu có */}
            {match.status && match.status !== 'open' && (
                <div className="p-3 sm:p-4 pb-0">
                    {getMatchStatusTag()}
                </div>
            )}

            <Link href={`/homepage/find-opponent/${match._id}`}>
                {/* Phần trên: Thông tin 2 đội */}
                <div className="p-3 sm:p-4">
                    {/* Mobile Layout */}
                <div className="block sm:hidden">
                    {/* Đội A */}
                    <div className="mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="relative w-14 h-14 flex-shrink-0">
                                <Image
                                    src={match.club_A?.teamImage || "/default-team.png"}
                                    className="rounded-full object-cover"
                                    fill
                                    alt={match.club_A?.teamName || "Team"}
                                    sizes="56px"
                                    priority={false}
                                    placeholder="blur"
                                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                    loading="lazy"
                                />
                            </div>
                            <div>
                                <div className="font-semibold text-base">{match.club_A?.teamName} 111111111111111111111</div>
                                <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                    <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">
                                        {match.club_A?.ageGroup}
                                    </span>
                                    <span>{match.club_A.level}</span>
                                    <span>{match.club_A.contact}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center text-2xl font-bold my-3">VS</div>

                    {/* Đội B */}
                    {match.club_B ? (
                        <div className="mb-3">
                            <div className="flex items-center space-x-3">
                                <div className="relative w-14 h-14 flex-shrink-0">
                                    <Image
                                        src={match.club_B?.teamImage || "/default-team.png"}
                                        className="rounded-full object-cover"
                                        fill
                                        alt={match.club_B?.teamName || "Team"}
                                        sizes="56px"
                                        priority={false}
                                        placeholder="blur"
                                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                                        loading="lazy"
                                    />
                                </div>
                                <div>
                                    <div className="font-semibold text-base">{match.club_B?.teamName}</div>
                                    <div className='flex items-center flex-wrap gap-2 text-sm mt-1 text-orange-500'>
                                        <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">
                                            {match.club_B?.ageGroup}
                                        </span>
                                        <span>{match.club_A.level}</span>
                                        <span>{match.club_A.contact}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-center mb-3">
                            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                ?
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                        </div>
                    )}
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-3 items-center mb-2">
                    {/* Đội A */}
                    <div>
                        <div className="flex items-center space-x-3">
                            <div className="relative w-12 h-12">
                                <Image
                                    src={match.club_A?.teamImage || ""}
                                    className="rounded-full object-cover"
                                    fill
                                    alt={match.club_A?.teamName || "Team"}
                                    sizes="48px"
                                    priority={false}
                                />
                            </div>
                            <div className="font-semibold text-sm">{match.club_A?.teamName}</div>
                        </div>
                        <div className='flex items-center space-x-3 text-sm mt-2 text-orange-500'>
                            <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">
                                {match.club_A?.ageGroup}
                            </span>
                            <span>{match.club_A.level}</span>
                            <span>{match.club_A.contact}</span>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center text-3xl font-bold">VS</div>

                    {/* Đội B nếu có */}
                    {match.club_B ? (
                        <div>
                            <div className="flex items-center justify-end space-x-3">
                                <div className="font-semibold text-sm">{match.club_B?.teamName}</div>
                                <div className="relative w-12 h-12">
                                    <Image
                                        src={match.club_B?.teamImage || ""}
                                        className="rounded-full object-cover"
                                        fill
                                        alt={match.club_B?.teamName || "Team"}
                                        sizes="48px"
                                        priority={false}
                                    />
                                </div>
                            </div>
                            <div className='flex items-center justify-end space-x-3 text-sm mt-2 text-orange-500'>
                                <span className="border border-orange-400 rounded-full px-2 py-0.5 text-xs">
                                    {match.club_B?.ageGroup}
                                </span>
                                <span>{match.club_A.level}</span>
                                <span>{match.club_A.contact}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-end text-right">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500">
                                ?
                            </div>
                            <div className="text-xs text-gray-400 mt-1">Chưa có đối thủ</div>
                        </div>
                    )}
                </div>

                {/* Đóng phần thông tin đội */}
                </div>

                {/* Phần dưới: Thông tin trận đấu với background màu cam nhẹ */}
                <div className="bg-orange-50 px-4 py-2 text-xs sm:text-sm text-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                        <span className='capitalize text-sm sm:text-base font-medium'>
                            {match.orderId?.timeStart} | {
                                match.orderId?.date ?
                                    format(
                                        parse(match.orderId.date, "dd-MM-yyyy", new Date()),
                                        'EEEE, dd-MM-yyyy',
                                        { locale: vi }
                                    )
                                    : format(new Date(match.date), 'EEEE, dd/MM/yyyy', { locale: vi })
                            }
                        </span>
                        {(() => {
                            // Chuyển đổi ngày trận đấu sang định dạng chuẩn
                            const matchDate = startOfDay(parse(match.orderId.date, "dd-MM-yyyy", new Date()));
                            // Lấy ngày hiện tại ở đầu ngày (00:00:00)
                            const today = startOfDay(new Date());

                            // So sánh ngày
                            const isToday = isSameDay(matchDate, today);
                            const diffDays = differenceInDays(matchDate, today);

                            if (isToday) {
                                // Nếu là ngày hôm nay và chưa có đối thủ
                                if (!match.club_B) {
                                    return (
                                        <span className="bg-red-100 text-red-600 rounded-md px-2 py-1 text-xs font-bold flex items-center self-start sm:self-center">
                                            <ClockCircleOutlined className="mr-1" />
                                            <span className="hidden sm:inline">Hôm nay, {match.orderId?.timeStart || match.time}</span>
                                            <span className="sm:hidden">Hôm nay</span>
                                        </span>
                                    );
                                } else {
                                    // Nếu là ngày hôm nay nhưng đã có đối thủ
                                    return (
                                        <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                            <span className="hidden sm:inline">Hôm nay, {match.orderId?.timeStart || match.time}</span>
                                            <span className="sm:hidden">Hôm nay</span>
                                        </span>
                                    );
                                }
                            } else {
                                // Nếu là ngày khác, hiển thị số ngày còn lại
                                return (
                                    <span className="bg-orange-100 text-orange-500 rounded-md px-2 py-1 text-xs self-start sm:self-center">
                                        {diffDays} ngày nữa
                                    </span>
                                );
                            }
                        })()}
                    </div>
                    <div className="mt-2 text-xs sm:text-sm text-gray-600 break-words">
                        {match.footballField?.name}
                        {match.footballField && (`, ${match.footballField?.address?.detail ? `${match.footballField?.address?.detail}, ` : ""} ${match.footballField?.address?.ward}, ${match.footballField?.address?.district}, ${match.footballField?.address?.province}`)}
                    </div>
                </div>
            </Link>
        </div>
    )
})

MatchCard.displayName = 'MatchCard'

export default MatchCard
