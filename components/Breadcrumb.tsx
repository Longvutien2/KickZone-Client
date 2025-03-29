'use client';
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/store/hook";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";




const CustomBreadcrumb = () => {
    const pathname = usePathname();
    const breadcrumb = useAppSelector((state: any) => state.breadcrumb.breadcrumb);
    console.log("pathname", pathname);

    const breadcrumbItems = [
        ...breadcrumb.map((item: any, index: number) => ({
            title: (
                <Link href={item.url} key={index} >
                    <div className={`${String(pathname) === String(item.url) ? 'text-blue-500' : 'text-gray-600'}`}>
                        {item.name}
                    </div>
                </Link>
            ),
            key: item.url, // Dùng url làm key duy nhất
        })),
    ];
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mb-2">
            <Breadcrumb items={breadcrumbItems} />
        </div>
    );
};

export default CustomBreadcrumb;
