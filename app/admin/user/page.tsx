'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form, Tabs, Card } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Field, TimeSlot } from "@/models/field";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { addTimeSlotSlice, getListTimeSlotsByFootballFieldId, removeTimeSlot, removeTimeSlotByFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";
import { getListUsersSlice } from "@/features/user.slice";

const statusMap: Record<number, { text: string; status: 'success' | 'processing' | 'error' | 'warning' }> = {
    0: { text: 'Đang hoạt động', status: 'success' },
    1: { text: 'Đã vô hiệu hóa', status: 'processing' },
    2: { text: 'Đã huỷ', status: 'error' },
    3: { text: 'Thất bại', status: 'warning' },
};

const ListUser = () => {
    const users = useAppSelector((state) => state.user.value)
    const [searchText, setSearchText] = useState("");
    const dispath = useAppDispatch();
    console.log("user", users);


    // delete timeSLot
    const handleDelete = (id: string) => {
        dispath(removeTimeSlot(id));
        toast.success("Xóa thành công!");
    };

    useEffect(() => {
        const getData = async () => {
            const data = await dispath(getListUsersSlice());
            console.log("dataa", data);

        }
        getData()
    }, []);

    const columns = [
        { title: "#", dataIndex: "key", key: "key" },
        { title: "Tên người dùng", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (role: number) => {
                // Dựa trên giá trị của role, hiển thị chuỗi tương ứng
                switch (role) {
                    case 0:
                        return "User";
                    case 1:
                        return "Manager";
                    case 2:
                        return "Admin";
                    default:
                        return "Unknown";
                }
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: number) => {
                const { text, status: badgeStatus } = statusMap[status] || { text: 'Unknown', status: 'default' };
                return <Badge status={badgeStatus} text={text} />;
              },
        },
        // {
        //     title: "Tình trạng",
        //     dataIndex: "status",
        //     key: "status",
        //     render: (status: string) => (
        //         <Badge status="success" text={status} />
        //     ),
        // },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: Field) => (
                <Space>
                    <Link href={`/admin/user/${record._id}`}> <Button type="primary" icon={<EditOutlined />} /></Link>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        // onConfirm={() => handleDelete(record, record._id, "field")}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredData = users?.map((item: any, index: number) => ({
        ...item,
        key: (index + 1).toString(), // 🛠 Tạo key tự động từ index
    })) || [];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Quản lý người dùng</h1>
                <div>
                    <div className="flex justify-between mb-4 ">
                       
                        <Input
                            placeholder="Tìm kiếm..."
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                        />
                    </div>
                    <Table
                        className="border border-gray-200"
                        columns={columns}
                        dataSource={filteredData}
                        pagination={{ pageSize: 5 }}
                    />
                </div>
            </div>


        </div>
    );
};

export default ListUser;
