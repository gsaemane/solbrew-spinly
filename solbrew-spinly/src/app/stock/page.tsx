'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StockManager from '@/components/stockManager';

export default function StockPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <StockManager />
    </main>
  );
}