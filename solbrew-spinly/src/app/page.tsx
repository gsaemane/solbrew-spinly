'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div className="">
       <Image
            src="/whiskeycolalogo.png"
            alt='logo'
            width={350}
            height={100}
            className='absolute lg:mt-44 opacity-10'
          ></Image>
      <main className="flex min-h-screen flex-col items-center p-8 bg-black">
      
          <h1 className="text-4xl my-16 font-bold">Solbrew Spinly</h1>
         
          <SpinningWheel items={items} />
         
      
        
    </main>

    </div>
    
  );
}