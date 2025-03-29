'use client'
import { Avatar, Button, Card, Form, message, Modal, Rate, Tabs } from 'antd'
import { CameraOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { useEffect, useState } from 'react'
import { getTeamByUserIdSlice, updateTeamSlice } from '@/features/team.slice'
import { Team } from '@/models/team'
import { Upload, UploadProps } from 'antd/lib'
import { RcFile } from 'antd/es/upload'
import { toast, ToastContainer } from 'react-toastify'
import { upload } from '@/utils/upload'
import { setBreadcrumb } from '@/features/breadcrumb.slice'

const MyTeamPage = () => {
    const user = useAppSelector(state => state.auth)
    const [hasTeam, setHasTeam] = useState<boolean>(false);
    const [myTeam, setMyTeam] = useState<Team>();
    const router = useRouter()
    const dispatch = useAppDispatch();

    const handleCreateMatch = () => {
        // Chuyển đến trang tạo trận đấu mới
        router.push('/homepage/myTeam/add') // /create-match là đường dẫn đến trang tạo trận đấu
    }

    useEffect(() => {
        const getData = async () => {
            if (user?.value?.user?._id) {
                const data = await dispatch(getTeamByUserIdSlice(user.value.user._id as string))
                if (data?.payload) {
                    const newData = (data.payload as Team[])[0];
                    setMyTeam(newData);
                    setHasTeam(true);

                } else {
                    console.log("datadatadatadata", data.payload);
                }
            }

        }

        getData();
    }, [user])
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
                    <MyTeam data={myTeam ? myTeam : undefined} />
                </div>
            )}
        </div>
    )
}

export default MyTeamPage


const MyTeam = ({ data }: { data: Team | undefined }) => {
    const [activeTab, setActiveTab] = useState("1")
    const [coverImage, setCoverImage] = useState<string | undefined>(data?.teamImageBg);
    const [profileImage, setProfileImage] = useState<string | undefined>(data?.teamImage);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [fileToUpload, setFileToUpload] = useState<RcFile | null>(null);
    const [imageType, setImageType] = useState<string>('');
    const dispatch = useAppDispatch();

    const handleChangeCoverPhoto: UploadProps['onChange'] = (info) => {
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
            { name: 'Đội của tôi', url: '/homepage/myTeam' },
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
                                    <p><strong>Địa chỉ: </strong>{data?.location}</p>
                                    <p><strong>Ngày thành lập: </strong>{data?.createdAt}</p>
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
                    {
                        key: '3',
                        label: 'Bài đăng',
                        children: (
                            <div className="text-center text-gray-500">Chưa có bài đăng</div>
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
