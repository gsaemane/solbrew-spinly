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
      <h2 className="text-4xl font-bold mb-4 " style={{ fontFamily: 'Lato' }}>
        Manage Stock
      </h2>
      <div className="mb-4 flex flex-col gap-3 border-2 border-gray-600 p-4 rounded-3xl shadow-lg">
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
        {newItem.image && 
        
        <img src={newItem.image} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded-full border-2 border-spot-red" />}
        
        <button onClick={addItem} className=" text-spot-gold p-2 rounded hover:bg-spot-gold hover:text-spot-black lg:bg-red-600">
          Add Item
        </button>
      </div>
      {/* item list */}
      <div className="bg-gray-900 p-4 rounded-2xl">
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-2 flex items-center gap-2 text-spot-gold border-b-2 border-b-amber-500">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ed1c24" viewBox="0 0 256 256"><path d="M221.66,181.66l-48,48a8,8,0,0,1-11.32-11.32L196.69,184H72a8,8,0,0,1-8-8V32a8,8,0,0,1,16,0V168H196.69l-34.35-34.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,221.66,181.66Z"></path></svg>
            </span>
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ed1c24" viewBox="0 0 256 256"><path d="M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"></path></svg>
            </button>
          </li>
        ))}
      </ul>
      </div>
      
    </div>
  );
};

export default StockManager;