'use client'
import { Avatar, Button, Card, Form, message, Modal, Pagination, Rate, Tabs } from 'antd'
import { CameraOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons'
import { useParams, useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { useEffect, useState } from 'react'
import { getTeamByIdSlice, getTeamByUserIdSlice, updateTeamSlice } from '@/features/team.slice'
import { Team } from '@/models/team'
import { Upload, UploadProps } from 'antd/lib'
import { RcFile } from 'antd/es/upload'
import { toast, ToastContainer } from 'react-toastify'
import { upload } from '@/utils/upload'
import { setBreadcrumb } from '@/features/breadcrumb.slice'
import moment from 'moment'

const MyTeamPage = () => {
    const user = useAppSelector(state => state.auth)
    const myTeam = useAppSelector(state => state.team.detail) as Team

    const [hasTeam, setHasTeam] = useState<boolean>(false);
    // const [myTeam, setMyTeam] = useState<Team>();
    const router = useRouter()
    const dispatch = useAppDispatch();
    const { id } = useParams();

    const handleCreateMatch = () => {
        router.push('/homepage/myTeam/add')
    }

    useEffect(() => {
        const getData = async () => {
            if (user?.value?.user?._id) {
                const data = await dispatch(getTeamByIdSlice(id as string))
                data.payload && setHasTeam(true)
            }

        }

        getData();
    }, [user])

    console.log("team", myTeam);

    return (
        <div className="bg-white">
            <h1 className="text-2xl font-semibold mb-4">Câu Lạc Bộ Của Tôi</h1>
            {!hasTeam ? (
                // Hiển thị khi chưa có đội
                <div className="flex flex-col items-center justify-center text-center mt-10">
                    <p className="text-gray-500 mb-4 text-sm">
                        Bạn chưa có đội nào? Bắt đầu tạo câu lạc bộ ngay để tham gia vào bảng xếp hạng của Sporta ngay!
                    </p>
                    <Button
                        type="primary"
                        className="bg-orange-500 hover:bg-orange-600 mt-4 px-6 rounded-full h-10 flex items-center"
                        icon={<PlusOutlined />}
                        onClick={handleCreateMatch}
                    >
                        Tạo câu lạc bộ
                    </Button>
                </div>
            ) : (
                // Hiển thị khi có đội
                <div className="text-center mt-10">
                    <MyTeam data={myTeam} />
                </div>
            )}
        </div>
    )
}

export default MyTeamPage


const MyTeam = ({ data }: { data: Team | undefined }) => {
    const [activeTab, setActiveTab] = useState("1")
    const auth = useAppSelector(state => state.auth);
    const [coverImage, setCoverImage] = useState<string | undefined>(data?.teamImageBg);
    const [profileImage, setProfileImage] = useState<string | undefined>(data?.teamImage);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<RcFile | null>(null);
    const [imageType, setImageType] = useState<string>('');
    const dispatch = useAppDispatch();

    const handleChangeCoverPhoto: UploadProps['onChange'] = (info) => {
        // Kiểm tra quyền thay đổi ảnh
        if (auth.value?.user?._id !== data?.user?._id) {
            toast.error("Chỉ đội trưởng mới có quyền thay đổi ảnh bìa!");
            return;
        }
        if (info.fileList.length > 0) {
            const file = info.fileList[0].originFileObj as RcFile;
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverImage(e.target?.result as string); // Cập nhật ảnh bìa ngay lập tức
            };
            reader.readAsDataURL(file); // Đọc ảnh

            // Lưu file chọn vào state
            setFileToUpload(file);
            setImageType("teamImageBg")
            // Hiển thị Modal yêu cầu xác nhận
            setIsModalVisible(true);
        }
    };

    const handleChangeProfilePicture: UploadProps['onChange'] = (info) => {
        // Kiểm tra quyền thay đổi ảnh
        if (auth.value?.user?._id !== data?.user?._id) {
            toast.error("Chỉ đội trưởng mới có quyền thay đổi ảnh đại diện!");
            return;
        }
        if (info.fileList.length > 0) {
            const file = info.fileList[0].originFileObj as RcFile;
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            setFileToUpload(file);
            setImageType("teamImage")
            setIsModalVisible(true)
        }
    };

    // Hàm xử lý khi nhấn "Ok" trong Modal
    const handleOk = async () => {
        const dataimg = { file: fileToUpload }
        const linkImage = await upload(dataimg)

        if (imageType === "teamImageBg") {
            await dispatch(updateTeamSlice({ ...data, teamImageBg: linkImage } as Team))
        } else if (imageType === "teamImage") {
            await dispatch(updateTeamSlice({ ...data, teamImage: linkImage } as Team))
        }
        toast.success("Chỉnh sửa thành công !")
        setIsModalVisible(false);
    };

    useEffect(() => {
        dispatch(setBreadcrumb([
            { name: 'Home', url: '/' },
            { name: 'Hồ sơ', url: '/homepage/profile' },
            { name: 'Đội của tôi', url: `/homepage/profile/myTeam/${data?._id}` },
        ]));
    }, [data])

    return (
        <div className="bg-white">
            <div>
                {/* Cover Photo */}
                <div className="relative ">
                    <img
                        src={coverImage || 'https://picsum.photos/200'} // Thay thế bằng ảnh mặc định nếu không có ảnh
                        alt="Cover"
                        className="w-full h-70 object-cover rounded-lg"
                    />
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false} // Ngừng upload ngay lập tức sau khi chọn file
                        onChange={handleChangeCoverPhoto}
                        maxCount={1}
                    >
                        <Button
                            icon={<CameraOutlined />}
                            className="absolute top-0 right-0 bg-gray-700 text-white p-2 rounded-full"
                        >
                            Chỉnh sửa ảnh bìa
                        </Button>
                    </Upload>
                </div>
                {/* Profile Picture */}
                <div className="flex justify-center mb-6 relative -mt-22">
                    <Avatar
                        size={128}
                        src={profileImage}
                        className="border-4 border-white relative"
                    />
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false} // Ngừng upload ngay lập tức sau khi chọn file
                        onChange={handleChangeProfilePicture}
                        maxCount={1}
                    >
                        <Button
                            icon={<CameraOutlined />}
                            className="absolute bottom-0 bg-gray-700 text-white p-1 px-2 rounded-full"
                        >
                        </Button>
                    </Upload>
                </div>

            </div>

            {/* Team Name and Info */}
            <div className='mt-2 text-center mx-auto'>
                <h2 className="font-semibold text-2xl">{data?.teamName}</h2>

                <div className="flex items-center justify-center space-x-2 text-gray-400">
                    <p className="text-sm">{data?.ageGroup}</p>
                    <span>⚡{data?.level}</span>
                    <span>⭐ 0.0</span>
                    <span>👍 100</span>
                </div>
            </div>

            {/* Tab for Info, Match History, etc */}
            <Tabs
                activeKey={activeTab}
                onChange={(key) => setActiveTab(key)}
                items={[
                    {
                        key: '1',
                        label: 'Thông tin',
                        children: (
                            <Card className="text-left">
                                <h3 className="text-xl font-bold mb-3">Thông tin</h3>
                                <div className="">
                                    <p><strong>Xếp hạng: </strong><span>#?</span></p>
                                    <p><strong>Thành viên: </strong><span>{data?.members.length}</span></p>
                                    <p><strong>Địa chỉ: </strong>{data?.location}</p>
                                    <p><strong>Ngày thành lập: </strong>{data?.createdAt}</p>
                                    <p><strong>Người thành lập (Đội trưởng): </strong>{data?.user.name}</p>
                                    <p><strong>Mô tả: </strong>{data?.description}</p>
                                </div>
                            </Card>
                        ),
                    },
                    {
                        key: '2',
                        label: 'Lịch sử đấu',
                        children: (
                            <div className="text-center text-gray-500">Chưa có trận đấu nào</div>
                        ),
                    },
                    // {
                    //     key: '3',
                    //     label: 'Bài đăng',
                    //     children: (
                    //         <div className="text-center text-gray-500">Chưa có bài đăng</div>
                    //     ),
                    // },
                    {
                        key: '3',
                        label: 'Thành viên',
                        children: (
                            <TeamMembersList data={data} />
                        ),
                    },
                ]}
            />


            {/* Confirmation Modal */}
            <Modal
                title="Xác nhận thay đổi"
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu"
                cancelText="Hủy"
            >
                <p>Bạn có muốn lưu thay đổi không?</p>
            </Modal>
        </div >
    )
}


const TeamMembersList = ({ data }: { data: Team | undefined }) => {
    const auth = useAppSelector(state => state.auth)
    const [teamMembers, setTeamMembers] = useState(data?.members);
    const [currentPage, setCurrentPage] = useState(1);
    const membersPerPage = 6;
    const router = useRouter();
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    // Hàm điều hướng đến trang thêm thành viên
    const handleAddMember = () => {
        if (auth.isLoggedIn && auth.value.user._id !== data?.user._id) {
            return toast.error("Chỉ đội trưởng mới có thể thêm thành viên!");
        }
        router.push(`/homepage/profile/myTeam/${data?._id}/addMember`);
    };

    // Hàm hiển thị modal thông tin thành viên
    const showMemberDetails = (member: any) => {
        setSelectedMember(member);
        setIsModalVisible(true);
    };

    return (
        <div className="py-6">
            <div className="rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                    {teamMembers && teamMembers
                        .slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage)
                        .map((member: any, index: number) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg overflow-hidden text-center shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                                onClick={() => showMemberDetails(member)}
                            >
                                <img
                                    src={member.user.image || 'https://picsum.photos/200'}
                                    alt={member.user.name}
                                    className="w-full h-60 object-cover"
                                />
                                <div className="p-3">
                                    <h3 className="font-semibold text-lg">{member.user.name} {index === 0 ? "(Đội trưởng)" : ""}</h3>
                                    <p className="text-sm text-gray-500">{member.position}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>

                {/* Phân trang */}
                <div className="mt-6 flex justify-center">
                    <Pagination
                        current={currentPage}
                        total={teamMembers && teamMembers.length + 1 || 0}
                        pageSize={membersPerPage}
                        onChange={(page) => setCurrentPage(page)}
                        hideOnSinglePage={true}
                    />
                </div>

                {/* Nút thêm thành viên */}
                <div className="mt-6 text-center">
                    <Button
                        type="primary"
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={handleAddMember}
                    >
                        Thêm thành viên
                    </Button>
                </div>
            </div>

            {/* Modal hiển thị thông tin chi tiết thành viên */}
            <Modal
                title="Thông tin thành viên"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={600}
            >
                {selectedMember && (
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/3">
                            <img
                                src={selectedMember.user.image}
                                alt={selectedMember.user.name}
                                className="w-full rounded-lg object-cover"
                            />
                        </div>
                        <div className="md:w-2/3">
                            <h2 className="text-xl font-bold mb-4">{selectedMember.user.name}</h2>
                            <div className="space-y-2">
                                <p><strong>Vị trí:</strong> {selectedMember.position}</p>
                                <p><strong>Tuổi:</strong> {selectedMember.age}</p>
                                {selectedMember.jerseyNumber && (
                                    <p><strong>Số áo:</strong> {selectedMember.jerseyNumber}</p>
                                )}
                                {selectedMember.user.contact && (
                                    <p><strong>Liên hệ:</strong> {selectedMember.user.contact}</p>
                                )}
                                {selectedMember.user.email && (
                                    <p><strong>Email:</strong> {selectedMember.user.email}</p>
                                )}
                                {selectedMember.user.email && (
                                    <p><strong>Ngày gia nhập:</strong> {moment(selectedMember.joinDate).format('DD/MM/YYYY')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
