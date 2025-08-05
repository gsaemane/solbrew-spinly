'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StockManager from '@/components/stockManager';

export default function StockPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <nav className="mb-8">
        <ul className="flex gap-4">
          <li>
            <Link href="/" className="text-blue-500 hover:underline">
              Spinning Wheel
            </Link>
          </li>
          <li>
            <Link href="/stock" className="text-blue-500 hover:underline">
              Manage Stock
            </Link>
          </li>
        </ul>
      </nav>
      <h1 className="text-3xl font-bold mb-8">Manage Stock</h1>
      <StockManager />
    </main>
  );
}