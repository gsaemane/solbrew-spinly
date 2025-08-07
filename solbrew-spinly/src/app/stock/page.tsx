'use client';

import React from 'react';
import StockManager from '@/components/stockManager';
import Image from 'next/image';

export default function StockPage() {
  return (
    <div>
      <div className="p-2">
        <Image
            src="/logo.png"
            width={200}
            height={200}
            alt='logo'
            className="absolute top-8 left-5"
        />

        <main className="flex min-h-screen flex-col items-center p-8">
          <StockManager />
        </main>

        </div>
    </div>
    
  );
}