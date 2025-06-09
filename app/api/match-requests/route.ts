import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-do-an-tot-nghiep.vercel.app';

// GET /api/match-requests - Lấy tất cả yêu cầu
export async function GET(request: NextRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/matchRequest`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching match requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match requests' },
            { status: 500 }
        );
    }
}

// POST /api/match-requests - Tạo yêu cầu mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate required fields
        const requiredFields = ['matchId', 'userId', 'teamName', 'contact', 'level', 'ageGroup'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                );
            }
        }

        const response = await fetch(`${API_BASE_URL}/api/matchRequest`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
    } catch (error: any) {
        console.error('Error creating match request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create match request' },
            { status: 500 }
        );
    }
}
