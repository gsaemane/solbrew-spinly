'use client';

import React, { useState, useEffect } from 'react';
import { StockItem } from '@/lib/types';

const StockManager: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, color: '#D5AE60', image: '' });

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

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (data.path) {
      setNewItem({ ...newItem, image: data.path });
    }
  };

  const addItem = async () => {
    if (!newItem.name || newItem.quantity < 0) return;
    const updatedItems = [
      ...items,
      { id: items.length + 1, ...newItem }
    ];
    setItems(updatedItems);
    await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItems),
    });
    setNewItem({ name: '', quantity: 0, color: '#D5AE60', image: '' });
  };

  const updateItem = async (id: number, updatedItem: Partial<StockItem>) => {
    const updatedItems = items.map(item =>
      item.id === id ? { ...item, ...updatedItem } : item
    );
    setItems(updatedItems);
    await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItems),
    });
  };

  const deleteItem = async (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    setItems(updatedItems);
    await fetch('/api/stock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedItems),
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
        Manage Stock
      </h2>
      <div className="mb-4 flex flex-col gap-2">
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={e => setNewItem({ ...newItem, name: e.target.value })}
          className="border-spot-red bg-[#1a1a1a] text-spot-gold p-2 rounded"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
          className="border-spot-red bg-[#1a1a1a] text-spot-gold p-2 rounded"
        />
        <input
          type="color"
          value={newItem.color}
          onChange={e => setNewItem({ ...newItem, color: e.target.value })}
          className="border-spot-red bg-[#1a1a1a] p-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={e => handleImageUpload(e.target.files?.[0] || null)}
          className="border-spot-red bg-[#1a1a1a] text-spot-gold p-2 rounded"
        />
        {newItem.image && <img src={newItem.image} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded-full border-2 border-spot-red" />}
        <button onClick={addItem} className="bg-spot-red text-spot-gold p-2 rounded hover:bg-spot-gold hover:text-spot-black">
          Add Item
        </button>
      </div>
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-2 flex items-center gap-2 text-spot-gold">
            {item.image && <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-full border-2 border-spot-red" />}
            <span>{item.name} (Qty: {item.quantity})</span>
            <input
              type="number"
              value={item.quantity}
              onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 0 })}
              className="border-spot-red bg-[#1a1a1a] text-spot-gold p-1 w-20 rounded"
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                handleImageUpload(e.target.files?.[0] || null).then(() => {
                  if (newItem.image) updateItem(item.id, { image: newItem.image });
                });
              }}
              className="border-spot-red bg-[#1a1a1a] text-spot-gold p-1 rounded"
            />
            <button
              onClick={() => deleteItem(item.id)}
              className="bg-spot-red text-spot-gold p-1 rounded hover:bg-spot-gold hover:text-spot-black"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockManager;