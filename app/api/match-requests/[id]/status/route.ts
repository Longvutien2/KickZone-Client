import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-do-an-tot-nghiep.vercel.app';

// PATCH /api/match-requests/[id]/status - Cập nhật trạng thái yêu cầu
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        // Validate status
        if (!body.status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        if (!['accepted', 'rejected'].includes(body.status)) {
            return NextResponse.json(
                { error: 'Status must be either "accepted" or "rejected"' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/api/matchRequest/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Match request not found' },
                    { status: 404 }
                );
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating match request status:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update match request status' },
            { status: 500 }
        );
    }
}
