'use client';

import Image from 'next/image';

interface CardProps {
  name: string;
  location: string;
  imageUrl: any;
  verified: boolean;
}

const Card: React.FC<CardProps> = ({ name, location, imageUrl, verified }) => {
  console.log("aa", imageUrl);

  return (
    <div className="bg-white  rounded-lg shadow-md overflow-hidden">
      <div className="relative w-full h-48">
        <Image
          src={imageUrl}
          className="object-cover"
          layout="fill"  // Lấp đầy toàn bộ container
          alt="bg"
        />
      </div>
      {/* <img src={imageUrl} alt={name} className="w-full h-48 object-cover" /> */}
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{name}</h3>
          {verified && <span className="text-blue-500">✔️</span>}
        </div>
        <p className="text-sm text-gray-500">{location}</p>
      </div>
    </div>
  );
};

export default Card
