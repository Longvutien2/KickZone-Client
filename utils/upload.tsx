
export const upload = async (values: any) => {
    const formData = new FormData();
    formData.append("file", values.file);
    formData.append("upload_preset", `${process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}`);

    const response = await fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_API}`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    return data.secure_url
}