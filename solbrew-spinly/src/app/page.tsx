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
    <div className="">
       
      <main className="flex min-h-screen flex-col items-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900  to-black">
      
          <h1 className="text-4xl my-16 font-bold lato-bold">Whiskey Cola Draw</h1>
         
          <SpinningWheel items={items} />
        
      </main>

    </div>
    
  );
}