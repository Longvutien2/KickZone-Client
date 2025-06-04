'use client';

// Custom hook để handle Suspense data loading
export function useSuspenseData<T>(data: T | undefined | null, isLoading: boolean): T {
  if (!data || isLoading) {
    // Throw Promise để trigger Suspense fallback
    throw new Promise<void>((resolve) => {
      // Đợi data load xong
      const checkData = () => {
        if (data && !isLoading) {
          resolve();
        } else {
          setTimeout(checkData, 50);
        }
      };
      checkData();
    });
  }
  
  return data;
}

// Hook cho fields data
export function useSuspenseFields(fields: any[], isLoading: boolean) {
  console.log('🚀 useSuspenseFields called:', { fields, isLoading, hasFields: !!fields });

  // Test: Force throw Promise để test Suspense (comment out sau khi test)
  if (false) { // Đổi thành false để tắt test
    console.log('🔄 FORCE Throwing Promise for Suspense...');
    throw new Promise<void>((resolve) => {
      console.log('⏳ Promise created, waiting 2 seconds...');
      setTimeout(() => {
        console.log('✅ Promise resolved');
        resolve();
      }, 2000);
    });
  }

  // Logic bình thường
  if (!fields || isLoading) {
    console.log('🔄 Throwing Promise for Suspense...');
    throw new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });
  }

  console.log('✅ Returning fields data:', fields.length);
  return fields;
}
