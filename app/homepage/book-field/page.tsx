import React from "react";
import { Metadata } from "next";
import { getFootballFieldById } from "@/api/football_fields";
import { getFieldsByIdFootball, getTimeSlotByIdFootballField } from "@/api/field";
import { getListOrders } from "@/api/payment";
import BookFieldClient from "@/components/booking/BookFieldClient";

// ✅ SEO Metadata for booking page
export const metadata: Metadata = {
  title: 'Đặt Sân | KickZone',
  description: 'Đặt sân bóng đá tại KickZone với hệ thống online tiện lợi. Xem lịch trống, chọn khung giờ phù hợp và thanh toán an toàn. Sân cỏ nhân tạo chất lượng cao.',
  keywords: 'đặt sân bóng đá, booking sân bóng, KickZone, sân cỏ nhân tạo, đặt sân online',
  openGraph: {
    title: 'Đặt sân bóng đá KickZone',
    description: 'Đặt sân bóng đá online tại KickZone - Nhanh chóng, tiện lợi, an toàn',
    images: ['/logo.jpg'],
    type: 'website',
  }
};

// ✅ OPTIMIZED SSR - Parallel API calls for better performance
export default async function BookFieldPage() {
  const footballFieldId = "67ce9ea74c79326f98b8bf8e";

  try {
    // 🚀 PARALLEL API CALLS - All 4 APIs called simultaneously for speed
    const [footballFieldRes, fieldsRes, timeSlotsRes, ordersRes] = await Promise.all([
      getFootballFieldById(footballFieldId),
      getFieldsByIdFootball(footballFieldId),
      getTimeSlotByIdFootballField(footballFieldId),
      getListOrders()
    ]);

    // ✅ Prepare server data
    const serverData = {
      footballField: footballFieldRes.data,
      fields: fieldsRes.data || [],
      timeSlots: timeSlotsRes.data || [],
      orders: ordersRes.data || [],
    };

    // ✅ Return Client Component with pre-fetched data
    return (
      <BookFieldClient
        initialData={serverData}
      />
    );

  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">Không thể tải dữ liệu từ server. Vui lòng thử lại.</p>
          <a
            href="/homepage/book-field"
            className="bg-[#FE6900] text-white px-6 py-2 rounded-lg hover:bg-[#e55a00] inline-block"
          >
            Thử lại
          </a>
        </div>
      </div>
    );
  }
}
