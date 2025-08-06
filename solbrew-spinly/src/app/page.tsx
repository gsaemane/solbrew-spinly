'use client';

import React, { useState, useEffect } from 'react';
import SpinningWheel from '@/components/spinningWheel';
import { StockItem } from '@/lib/types';
import Image from 'next/image';

export default function Home() {
  const [items, setItems] = useState<StockItem[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await fetch('/api/stock');
      if (response.ok) {
        const stock = await response.json();
        setItems(stock);
      }
    };
    fetchItems();
  }, []);

  return (
    <div className="w-full bg-[url(/map_motif.png)] bg-bottom bg-no-repeat"  >
        <div className="p-2">
        <Image
            src="/logo.png"
            width={200}
            height={200}
            alt='logo'
            className="absolute top-8 left-5"
        />

        </div>
       
      <main className="flex min-h-screen flex-col items-center p-8">
          
          <h1 className="text-4xl mt-12 mb-4 font-bold lato-bold">Spin the Wheel</h1>
         
          <SpinningWheel items={items} />
        
      </main>
      {/* Sponsor */}
      <div className="text-gray-300 rounded-t-lg text-base z-10 float-right -mt-10 mr-8 p-2 bg-gray-800 border border-gray-400 ">
        Proudly sponsored by Solbrew

      </div>

    </div>
    
  );
}