'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form, Tabs, Card, Tooltip, Tag } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { getFootballFieldByStatusSlice, getListFootballFieldSlice, updateFootballFieldSlice } from "@/features/footballField.slice";
import { FootballField } from "@/models/football_field";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateUserSlice } from "@/features/user.slice";
import { updateUser } from "@/api/user";

const statusMap: Record<string, { text: string; status: 'success' | 'processing' | 'error' | 'warning' }> = {
    "Hoạt động": { text: 'Hoạt động', status: 'success' },
    "Bảo trì": { text: 'Bảo trì', status: 'warning' },
    "Vô hiệu hóa": { text: 'Vô hiệu hóa', status: 'error' },
    "Chờ xác nhận": { text: 'Chờ xác nhận', status: 'processing' }
};

const ListBookingField = () => {
    const footballFields = useAppSelector((state) => state.footballField.value)
    const [searchText, setSearchText] = useState("");
    const dispatch = useAppDispatch();
    console.log("footballFields", footballFields);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // delete timeSLot
    // const handleDelete = (id: string) => {
    //     dispath(removeTimeSlot(id));
    //     toast.success("Xóa thành công!");
    // };

    const handleApprove = async (field: any) => {
        setLoading(true)
        await dispatch(updateFootballFieldSlice({ _id: field._id, status: "Hoạt động" })).unwrap();
        const newdata = {
            _id: field.userId._id,
            role: 1
        }
        await updateUser(newdata);
        toast.success('Cập nhật thành công!');
        setLoading(false)
        router.push('/admin/footballField');
    }

    useEffect(() => {
        const getData = async () => {
            const data = await dispatch(getFootballFieldByStatusSlice("Chờ xác nhận"));
        }
        getData()
    }, []);

    const columns = [
        { title: "#", dataIndex: "key", key: "key" },
        { title: "Tên sân", dataIndex: "name", key: "name" },
        {
            title: "Hình ảnh",
            dataIndex: "image",
            key: "image",
            render: (status: string) => (
                <Image src={status || ""} alt="img" width={100} height={100} className="rounded" />
            ),
        },
        {
            title: "Địa chỉ",
            key: "address", width: 150,
            render: (item: FootballField) => (
                <Tooltip title={`${item.address.detail ? `${item.address.detail}, ` : ""} ${item.address.ward}, ${item.address.district}, ${item.address.province}`}>
                    <div className="truncate whitespace-nowrap overflow-hidden w-[350px]">
                        {item.address.detail ? `${item.address.detail}, ` : ""}
                        {item.address.ward}, {item.address.district}, {item.address.province}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: "Chủ sân",
            key: "userid",
            render: (item: FootballField) => (
                <div>{item?.userId.name}</div>
            ),
        },
        { title: "Liên hệ", dataIndex: "phone", key: "phone" },
        { title: "Mô tả", dataIndex: "desc", key: "desc" },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const badge = statusMap[status];
                return <Tag color={badge.status}>
                    {badge.text}
                </Tag>
            },
        },

        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: FootballField) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={() => handleApprove(record)}
                        loading={loading}
                        style={{ marginRight: 8 }}
                    >
                        Duyệt
                    </Button>
                </Space>
            ),
        },
    ];

    const filteredData = footballFields?.map((item: FootballField, index: number) => ({
        ...item,
        key: (index + 1).toString(), // 🛠 Tạo key tự động từ index
    })) || [];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Danh sách yêu cầu tạo sân bóng</h1>
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

export default ListBookingField;
