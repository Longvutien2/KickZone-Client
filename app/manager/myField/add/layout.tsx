// app/manager/myField/add/layout.tsx
"use client";
import React from 'react';

const AddFieldLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="add-field-layout">
      <h1>Tạo Sân Bóng</h1>
      <div>{children}</div>
    </div>
  );
};

export default AddFieldLayout;
