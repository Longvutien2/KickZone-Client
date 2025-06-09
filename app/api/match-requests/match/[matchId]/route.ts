import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-do-an-tot-nghiep.vercel.app';

// GET /api/match-requests/match/[matchId] - Lấy yêu cầu theo match ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ matchId: string }> }
) {
    try {
        const { matchId } = await params;

        if (!matchId) {
            return NextResponse.json(
                { error: 'Match ID is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/api/matchRequest/match/${matchId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Match not found' },
                    { status: 404 }
                );
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching match requests by match ID:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match requests' },
            { status: 500 }
        );
    }
}
