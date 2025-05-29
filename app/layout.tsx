// app/layout.tsx
'use client';
import { persistor, store } from '@/store/store';
import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux'; // Nếu bạn sử dụng Redux
import { ToastContainer } from 'react-toastify'; // Nếu bạn dùng toast notifications
import 'react-toastify/dist/ReactToastify.css';
import './globals.css';
import { PersistGate } from 'redux-persist/integration/react';
import { setupAutoCleanup } from '@/utils/orderCleanup';

function AppContent({ children }: { children: ReactNode }) {
  // Setup auto-cleanup cho toàn bộ app
  useEffect(() => {
    const cleanup = setupAutoCleanup();

    // Cleanup khi component unmount
    return cleanup;
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        theme='dark'
        pauseOnHover={false}
        pauseOnFocusLoss={false}
      />
      <main>
        {/* Nội dung trang sẽ được chèn vào đây */}
        {children}
      </main>
    </>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>My App</title>
      </head>
      <body>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContent>{children}</AppContent>
          </PersistGate>
        </Provider>
      </body>
    </html>
  );
}
