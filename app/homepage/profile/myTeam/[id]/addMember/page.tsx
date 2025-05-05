'use client'
import { Button, Input, Select, Form, AutoComplete } from 'antd'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { toast } from 'react-toastify'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import { getListUsersSlice } from '@/features/user.slice'
import { IUser } from '@/models/auth'
import { updateTeamSlice } from '@/features/team.slice'
import { Team } from '@/models/team'

const { Option } = Select

const AddMemberPage = () => {
    const user = useAppSelector(state => state.auth)
    const users = useAppSelector(state => state.user.value)
    const [form] = Form.useForm()
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { id } = useParams();
    const [searchValue, setSearchValue] = useState('');
    const [options, setOptions] = useState<{ value: string, label: string }[]>([]);
    const currentTeam = useAppSelector(state => state.team.detail) as Team;

    useEffect(() => {
        // Lấy danh sách users từ Redux store
        const fetchUsers = async () => {
            if (user.isLoggedIn) {
                await dispatch(getListUsersSlice());
            }
        };
        fetchUsers();

        dispatch(setBreadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Hồ sơ', url: '/homepage/profile' },
            { name: 'Đội của tôi', url: `/homepage/profile/myTeam/${id}` },
            { name: 'Thêm thành viên', url: `/homepage/profile/myTeam/${id}/addMember` },
        ]));
    }, [id, dispatch, user.isLoggedIn]);

    // Cập nhật options khi người dùng nhập
    useEffect(() => {
        if (users && users.length > 0) {
            // Lọc users dựa trên giá trị tìm kiếm
            const filteredOptions = users
                .filter((user: any) =>
                    user.name.toLowerCase().includes(searchValue.toLowerCase()))
                .map((user: any) => ({
                    value: user._id,
                    label: user.name
                }));
            setOptions(filteredOptions);
        }
    }, [searchValue, users]);

    const handleSearch = (value: string) => {
        setSearchValue(value);
    };

    const handleSelect = (value: string, option: any) => {
        // Khi người dùng chọn một user, cập nhật form với thông tin của user đó
        const selectedUser = users.find((user: IUser) => user._id === value) as any;
        console.log("selectedUser", selectedUser);
        console.log("value", value);

        if (selectedUser) {
            form.setFieldsValue({
                memberName: selectedUser.name,
                userId: selectedUser._id,
                // Có thể cập nhật thêm các trường khác nếu có
            });
        }
    };

    const handleSubmit = async (values: any) => {
        if (!currentTeam || !currentTeam._id) {
            toast.error("Không tìm thấy thông tin đội bóng");
            return;
        }
        // Kiểm tra xem user đã tồn tại trong team chưa
        const userExists = currentTeam.members.some(member => member.user._id === values.userId);
        if (userExists) {
            toast.error("Thành viên này đã tồn tại trong đội bóng!");
            return;
        }
        // Tạo đối tượng thành viên mới
        const newMember = {
            user: values.userId,
            position: values.position,
            age: values.age,
            jerseyNumber: values.jerseyNumber,
        };
        const newTeam = {
            ...currentTeam,
            members: [...currentTeam.members, newMember],
        };
        // Gọi action updateTeamSlice để thêm thành viên mới
        await dispatch(updateTeamSlice(newTeam));
        // Thông báo thành công
        toast.success("Thêm thành viên thành công");
        router.push(`/homepage/profile/myTeam/${id}`);
    }

    return (
        <div className="p-4 bg-white">
            <h2 className="text-xl font-semibold text-center mb-6">Thêm Thành Viên</h2>
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                {/* ID của user được chọn (ẩn) */}
                <Form.Item name="userId" hidden>
                    <Input />
                </Form.Item>

                {/* Tên thành viên với AutoComplete */}
                <Form.Item
                    label="Tên thành viên"
                    name="memberName"
                    rules={[{ required: true, message: 'Vui lòng nhập tên thành viên!' }]}
                >
                    <AutoComplete
                        options={options}
                        onSearch={handleSearch}
                        onSelect={handleSelect}
                        placeholder="Nhập tên thành viên"
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                {/* Vị trí */}
                <Form.Item label="Vị trí" name="position" rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}>
                    <Select placeholder="Chọn vị trí">
                        <Option value="Tiền đạo">Tiền đạo (Striker)</Option>
                        <Option value="Tiền vệ">Tiền vệ (Midfielder)</Option>
                        <Option value="Hậu vệ">Hậu vệ (Defender)</Option>
                        <Option value="Thủ môn">Thủ môn (Goalkeeper)</Option>
                        <Option value="Cánh">Cánh (Winger)</Option>
                        <Option value="Tiền vệ tổ chức">Tiền vệ tổ chức (Playmaker)</Option>
                    </Select>
                </Form.Item>

                {/* Số áo */}
                <Form.Item label="Số áo" name="jerseyNumber" rules={[{ required: true, message: 'Vui lòng nhập số áo!' }]}>
                    <Input type="number" placeholder="Nhập số áo" />
                </Form.Item>

                {/* Tuổi */}
                <Form.Item label="Tuổi" name="age" rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}>
                    <Input type="number" placeholder="Nhập tuổi" />
                </Form.Item>

                {/* Số điện thoại */}
                <Form.Item label="Số điện thoại" name="phone">
                    <Input placeholder="Nhập số điện thoại" />
                </Form.Item>

                {/* Nút hoàn tất */}
                <Form.Item className="text-center">
                    <Button type="primary" htmlType="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                        Hoàn tất
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}

export default AddMemberPage


