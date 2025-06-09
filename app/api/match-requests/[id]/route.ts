import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://server-do-an-tot-nghiep.vercel.app';

// GET /api/match-requests/[id] - Lấy yêu cầu theo ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const response = await fetch(`${API_BASE_URL}/api/matchRequest/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Match request not found' },
                    { status: 404 }
                );
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching match request:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match request' },
            { status: 500 }
        );
    }
}

// PATCH /api/match-requests/[id] - Cập nhật yêu cầu
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const response = await fetch(`${API_BASE_URL}/api/matchRequest/${id}`, {
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
        console.error('Error updating match request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update match request' },
            { status: 500 }
        );
    }
}

// DELETE /api/match-requests/[id] - Xóa yêu cầu
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const response = await fetch(`${API_BASE_URL}/api/matchRequest/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Match request not found' },
                    { status: 404 }
                );
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error deleting match request:', error);
        return NextResponse.json(
            { error: 'Failed to delete match request' },
            { status: 500 }
        );
    }
}
