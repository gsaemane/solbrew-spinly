'use client';

import React, { useState, useEffect } from 'react';
import SpinningWheel from '@/components/spinningWheel';
import { StockItem } from '@/lib/types';
import Image from 'next/image';

export default function Home() {
  const [items, setItems] = useState<StockItem[]>([]);

  useEffect(() => {
    fetch('/stock.json')
      .then((res) => res.json())
      .then((data: StockItem[]) => {
        console.log('Items loaded for wheel:', data); // Log to verify non-winners
        setItems(data);
      })
      .catch((err) => console.error('Failed to load stock:', err));
  }, []);

  return (
    <div className="w-full bg-[url(/map_motif.png)] bg-bottom bg-no-repeat min-h-screen"  >
        <div className="p-2">
       {/* Main Logo */}
        <Image
            src="/logo.png"
            width={200}
            height={200}
            alt='logo'
            className="fade-in-normal absolute top-8 left-5"
        />

        </div>
        {/* Crafted by logo */}
        <div>
        <Image
            src="/crafted_by_logo.jpeg"
            width={200}
            height={200}
            alt='logo'
            className="fade-in-normal absolute top-5 right-5"
        />

        </div>
       
        <main className="flex  flex-col items-center p-8">

            <h1 className="fade-in-normal text-4xl mt-12 mb-4 font-bold lato-bold">Spin the Wheel</h1>
            <SpinningWheel items={items} />

        </main>
      
        {/* Sponsor */}
        <div className="text-gray-300 rounded-tl-lg text-base z-10 absolute bottom-0 right-0 p-2 bg-gray-800 border border-gray-400 ">
          Proudly sponsored by Solbrew
        </div>
    </div>
    
  );
}