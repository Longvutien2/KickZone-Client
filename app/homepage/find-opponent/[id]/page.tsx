import React from "react";
import { Metadata } from "next";
import { getMatchById } from "@/api/match";
import MatchDetailClient from "@/components/find-opponent/MatchDetailClient";

// ✅ SEO Metadata for find opponent page
export const metadata: Metadata = {
  title: 'Chi Tiết Trận Đấu | KickZone',
  description: 'Tìm đối thủ và đội bóng để thi đấu tại KickZone. Kết nối với cộng đồng bóng đá, tạo trận đấu và tham gia giải đấu.',
  keywords: 'tìm đối thủ, đội bóng, trận đấu, cộng đồng bóng đá, KickZone, thi đấu bóng đá',
  openGraph: {
    title: 'Chi Tiết Trận Đấu - KickZone',
    description: 'Kết nối với cộng đồng bóng đá, tìm đối thủ và tạo trận đấu tại KickZone',
    images: ['/logo.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chi Tiết Trận Đấu - KickZone',
    description: 'Kết nối với cộng đồng bóng đá, tìm đối thủ và tạo trận đấu tại KickZone',
    images: ['/logo.jpg'],
  }
};

// ✅ OPTIMIZED SSR - Parallel API calls for better performance
export default async function FindOpponentPage() {
  try {
    // ✅ Return Client Component with pre-fetched data
    return (
      <MatchDetailClient/>
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
