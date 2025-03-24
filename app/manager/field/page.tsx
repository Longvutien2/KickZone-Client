'use client';
import React, { useEffect, useState } from "react";
import { Table, Button, Input, Space, Badge, Modal, Popconfirm, Form } from "antd";
import { EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Field, TimeSlot } from "@/models/field";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Link from "next/link";
import { RootStateType } from "@/models/type";
import { useAppDispatch } from "@/store/hook";
import { getListFieldsSlice, removeFieldSlice } from "@/features/field.slice";
import { addTimeSlotSlice, removeTimeSlot, removeTimeSlotByFieldId, updateTimeSlotSlice } from "@/features/timeSlot.slice";


const ListField = () => {
    const timeSLotData = useSelector((state: RootStateType) => state.timeSlot.value)
    const footballField = useSelector((state: RootStateType) => state.footballField.value)
    const fieldData = useSelector((state: RootStateType) => state.field.value)
    const [searchText, setSearchText] = useState("");
    const dispath = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [form] = Form.useForm();
    const [editingTimeSlot, setEditingTimeSlot] = useState<TimeSlot | null>(null);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

    console.log("fieldData", fieldData);

    // delete timeSLot
    const handleDelete = (parentKey: Field, subKey: string, name: string) => {
        if (name === "field") {
            const dele = dispath(removeFieldSlice(subKey));
            const dele2 = dispath(removeTimeSlotByFieldId(subKey));
            toast.success("Xóa thành công!");
        } else if (name === "timeSlot") {
            const dele = dispath(removeTimeSlot(subKey));
            toast.success("Xóa thành công!");
        }

    };

    // Khi bấm Edit, mở modal và truyền dữ liệu cũ
    const handleEditTimeSlot = (timeSlot: TimeSlot) => {
        setEditingTimeSlot(timeSlot);
        setShowModal(true);
    };

    const handleAddTimeSlot = (idField: string) => {
        console.log("idField check: ", idField);

        setEditingFieldId(idField)
        setEditingTimeSlot(null); // Xóa dữ liệu cũ
        form.resetFields(); // Reset form ngay lập tức để không giữ giá trị cũ
        setTimeout(() => setShowModal(true), 0); // Đảm bảo state đã cập nhật trước khi mở modal
    };


    // Hàm đóng modal
    const handleClose = () => {
        setEditingTimeSlot(null); // Xóa dữ liệu cũ
        setShowModal(false);
    };

    // Khi submit form
    const handleSubmit = async () => {

        if (editingTimeSlot) {
            // Cập nhật TimeSlot
            console.log("đã vào edit");
            console.log("editingTimeSlot", editingTimeSlot);
            const values = await form.validateFields();
            console.log("values", values);
            const newTimeSlot = {
                ...editingTimeSlot,
                time: values.time,
                price: values.price
            }
            console.log("newTimeSlot", newTimeSlot);

            // await dispath(updateTimeSlotSlice({ ...values, _id: editingTimeSlot._id }));
            const data = await dispath(updateTimeSlotSlice(newTimeSlot));
            if (data.payload) {
                toast.success("Sửa ca đá thành công!");
                setShowModal(false);
            } else {
                toast.error("Sửa ca đá thất bại, vui lòng thử lại!");
            }
        } else {
            // Thêm TimeSlot mới
            const values = await form.validateFields();
            const newTimeSlot = {
                ...values,
                isBooked: false,
                fieldId: editingFieldId
            }
            const data = await dispath(addTimeSlotSlice(newTimeSlot));
            if (data.payload) {
                toast.success("Thêm ca đá thành công!");
                setShowModal(false);
            } else {
                toast.error("Thêm ca đá thất bại, vui lòng thử lại!");
            }
        }
        handleClose();
    };

    useEffect(() => {
        if (!editingTimeSlot) {
            form.resetFields(); // Reset form khi không có TimeSlot
        } else {
            form.setFieldsValue(editingTimeSlot); // Load lại dữ liệu TimeSlot khi sửa
        }
        const getData = async () => {
            await dispath(getListFieldsSlice(footballField._id as string));
        }
        getData()
    }, [editingTimeSlot, timeSLotData]);

    const columns = [
        { title: "#", dataIndex: "key", key: "key" },
        { title: "Tên", dataIndex: "name", key: "name" },
        { title: "Số người", dataIndex: "people", key: "people" },
        { title: "Bắt đầu lúc", dataIndex: "start_time", key: "start_time" },
        { title: "Kết thúc lúc", dataIndex: "end_time", key: "end_time" },
        {
            title: "Tình trạng",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Badge status="success" text={status} />
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: string, record: Field) => (
                <Space>
                    <Link href={`/manager/field/${record._id}`}> <Button type="primary" icon={<EditOutlined />} /></Link>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record, record._id, "field")}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Table con hiển thị lịch đặt sân
    const expandedRowRender = (record: Field) => {
        const dataSource = fieldData.filter((item: Field) => item._id === record._id);
        const fieldIds = dataSource.map((item: any) => item.timeSlots);

        const subColumns = [
            { title: "Ca ", dataIndex: "time", key: "time" },
            { title: "Gía tiền", dataIndex: "price", key: "price" },
            {
                title: "Hành động",
                key: "action",
                render: (_: string, subRecord: TimeSlot) => (
                    <Space>
                        <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditTimeSlot(subRecord)} />
                        <Popconfirm
                            title="Bạn có chắc muốn xóa?"
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleDelete(record, subRecord._id, "timeSlot")}
                            okText="Xác nhận"
                            cancelText="Hủy"
                        >
                            <Button type="primary" danger icon={<DeleteOutlined />} />
                        </Popconfirm>
                    </Space>
                ),
            },
        ];
        return <>
            <Table className="border border-gray-200 mb-2" columns={subColumns} dataSource={fieldIds[0] || []} pagination={{ pageSize: 5 }} />
            <Button type="primary" onClick={() => handleAddTimeSlot(record._id)}>Thêm ca đá</Button>

            {/* Modal nhập thông tin ca đá */}
            <Modal
                title={editingTimeSlot ? "Sửa Ca Đá" : "Thêm Ca Đá"}
                visible={showModal}
                onCancel={handleClose}
                onOk={handleSubmit}
            >
                <Form
                    form={form}
                    layout="vertical"
                // onFinish={() => handleSubmit(record)}
                >
                    <Form.Item
                        label="Giờ"
                        name="time"
                        rules={[{ required: true, message: "Vui lòng nhập giờ đá!" }]}
                    >
                        <Input placeholder="VD: 12:00 - 13:30" />
                    </Form.Item>

                    <Form.Item
                        label="Giá tiền"
                        name="price"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá tiền!" },
                            { pattern: /^\d+$/, message: "Giá tiền phải là số!" }
                        ]}
                    >
                        <Input placeholder="VD: 150000" />
                    </Form.Item>
                </Form>

            </Modal>
        </>
    };

    const filteredData = fieldData.map((item: Field, index: number) => ({
        ...item,
        key: (index + 1).toString(), // 🛠 Tạo key tự động từ index
    })) || [];

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="bg-white p-6 rounded-lg shadow">
                <h1 className="text-xl font-semibold mb-4">Quản lý sân bóng</h1>
                <div className="flex justify-between mb-4 ">
                    <Button type="primary" className="bg-green-500">
                        <Link href={`/manager/field/add`}>Thêm sân bóng</Link>
                    </Button>
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
                    expandable={{
                        expandedRowRender, expandIcon: ({ expanded, onExpand, record }) => (
                            <Button type="text" onClick={(e) => onExpand(record, e)}>
                                {expanded ? "▼" : <EyeOutlined />}
                            </Button>
                        )
                    }}
                    pagination={{ pageSize: 5 }}
                />
            </div>
        </div>
    );
};

export default ListField;
