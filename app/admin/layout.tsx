// app/admin/layout.tsx
'use client';

import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <header>Admin Header</header>
      <nav>Admin Sidebar</nav>
      <main>{children}</main>
      <footer>Admin Footer</footer>
    </div>
  );
}
