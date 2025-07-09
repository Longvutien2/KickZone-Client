import React from "react";
import { Metadata } from "next";
import { getMatches } from "@/api/match";
import { getFootballFieldAddress } from "@/api/football_fields";
import { getTimeSlotByIdFootballField } from "@/api/field";
import FindOpponentClient from "@/components/find-opponent/FindOpponentClient";

// ✅ SEO Metadata for find opponent page
export const metadata: Metadata = {
  title: 'Tìm Đối Thủ | KickZone',
  description: 'Tìm đối thủ và đội bóng để thi đấu tại KickZone. Kết nối với cộng đồng bóng đá, tạo trận đấu và tham gia giải đấu.',
  keywords: 'tìm đối thủ, đội bóng, trận đấu, cộng đồng bóng đá, KickZone, thi đấu bóng đá',
  openGraph: {
    title: 'Tìm Đối Thủ - KickZone',
    description: 'Kết nối với cộng đồng bóng đá, tìm đối thủ và tạo trận đấu tại KickZone',
    images: ['/logo.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tìm Đối Thủ - KickZone',
    description: 'Kết nối với cộng đồng bóng đá, tìm đối thủ và tạo trận đấu tại KickZone',
    images: ['/logo.jpg'],
  }
};

// ✅ OPTIMIZED SSR - Parallel API calls for better performance
export default async function FindOpponentPage() {
  const footballFieldId = "67ce9ea74c79326f98b8bf8e"; // Default football field ID

  try {
    // 🚀 PARALLEL API CALLS - All 3 APIs called simultaneously for speed
    const [matchesRes, addressRes, timeSlotsRes] = await Promise.all([
      getMatches(),
      getFootballFieldAddress(),
      getTimeSlotByIdFootballField(footballFieldId)
    ]);

    // ✅ Prepare server data
    const serverData = {
      matches: matchesRes.data || [],
      addresses: addressRes.data || [],
      timeSlots: timeSlotsRes.data || [],
    };

    // ✅ Return Client Component with pre-fetched data
    return (
      <FindOpponentClient
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
            href="/homepage/find-opponent"
            className="bg-[#FE6900] text-white px-6 py-2 rounded-lg hover:bg-[#e55a00] inline-block"
          >
            Thử lại
          </a>
        </div>
      </div>
    );
  }
}
