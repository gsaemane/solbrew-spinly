'use client';

import React, { useState, useEffect } from 'react';
import { StockItem } from '@/lib/types';
import {v4 as uuidv4} from 'uuid';
import Link from 'next/link';

const StockManager: React.FC = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [newItem, setNewItem] = useState<StockItem>({ id: '', name: '', image: '', color: '#000000', isWinner: true, quantity: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch stock items
  useEffect(() => {
    fetch('/stock.json')
      .then((res) => res.json())
      .then((data: StockItem[]) => {
        const ids = data.map(item => item.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.error('Duplicate IDs found in stock.json:', duplicates);
          setError('Duplicate IDs found in stock: ' + duplicates.join(', '));
        } else {
          setItems(data);
        }
      })
      .catch((err) => setError('Failed to load stock: ' + err.message));
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

  // Save items to stock.json
  const saveItems = async (updatedItems: StockItem[]) => {
    try {
      // Validate for duplicate IDs
      const ids = updatedItems.map(item => item.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length > 0) {
        setError('Cannot save: Duplicate IDs detected: ' + duplicates.join(', '));
        return;
      }

      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItems),
      });
      if (!response.ok) throw new Error('Failed to save stock');
      setItems(updatedItems);
      setError(null);
    } catch (err) {
      setError('Failed to save stock: ' + (err as Error).message);
    }
  };

  // Add or update item
  const handleSaveItem = () => {
    if (!newItem.name) {
      setError('Item name is required');
      return;
    }
    if (newItem.quantity < 0) {
      setError('Quantity cannot be negative');
      return;
    }
    let updatedItems;
    if (editingId !== null) {
      updatedItems = items.map((item) =>
        item.id === editingId ? { ...newItem, id: editingId } : item
      );
      setEditingId(null);
    } else {
      const newId = uuidv4();
      updatedItems = [...items, { ...newItem, id: newId }];
      console.log('Generated new ID:', newId);
    }
    saveItems(updatedItems);
    setNewItem({ id: '', name: '', image: '', color: '#000000', isWinner: true, quantity: 0 });
  };

   // Delete item
   const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id);
    saveItems(updatedItems);
  };

  // Edit item
  const handleEditItem = (id: string) => {
    const item = items.find((item) => item.id === id);
    if (item) {
      setNewItem(item);
      setEditingId(id);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-4xl font-bold mb-4 " style={{ fontFamily: 'Lato' }}>
        Manage Wheel Items
      </h2>
      <div className="mb-4 flex flex-col gap-3 p-4 rounded-3xl shadow-lg">
        <div className="grid grid-cols-2 w-full gap-2">
            {/* Input name */}
        <div className="flex flex-col text-left border-2 border-spot-gold bg-[#000000] rounded p-2">
            <label className="pl-2 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#d5ae60" className="inline mr-1" viewBox="0 0 256 256"><path d="M216,48H40a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8V56A8,8,0,0,0,216,48ZM96,144a24,24,0,1,1,24-24A24,24,0,0,1,96,144Z" opacity="0.2"></path><path d="M200,112a8,8,0,0,1-8,8H152a8,8,0,0,1,0-16h40A8,8,0,0,1,200,112Zm-8,24H152a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm40-80V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Zm-80.26-34a8,8,0,1,1-15.5,4c-2.63-10.26-13.06-18-24.25-18s-21.61,7.74-24.25,18a8,8,0,1,1-15.5-4,39.84,39.84,0,0,1,17.19-23.34,32,32,0,1,1,45.12,0A39.76,39.76,0,0,1,135.75,166ZM96,136a16,16,0,1,0-16-16A16,16,0,0,0,96,136Z"></path></svg>
              Item Name
            </label>
            <input
              type="text"
              placeholder="Name for item on wheel"
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              className="border-none  text-spot-gold p-2 rounded active:border-0"
            />
            
        </div>

        {/* Input QTY */}
        <div className="flex flex-col text-left border-2 border-spot-gold bg-[#000000] rounded p-2">
            <label className="pl-2 font-semibold">
            
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="inline mr-1" fill="#d5ae60" viewBox="0 0 256 256">
              <path d="M224,80l-96,56L32,80l96-56Z" opacity="0.2"></path><path d="M230.91,172A8,8,0,0,1,228,182.91l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,36,169.09l92,53.65,92-53.65A8,8,0,0,1,230.91,172ZM220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09ZM24,80a8,8,0,0,1,4-6.91l96-56a8,8,0,0,1,8.06,0l96,56a8,8,0,0,1,0,13.82l-96,56a8,8,0,0,1-8.06,0l-96-56A8,8,0,0,1,24,80Zm23.88,0L128,126.74,208.12,80,128,33.26Z"></path>
              </svg>
              Quantity
            </label>
            <input
              type="number"
              placeholder="Number of items"
              value={newItem.quantity}
              onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
              className="border-spot-red text-spot-gold p-2 rounded"
            />
        </div>

      </div>
      {/* Row end */}

        {/* Is Winner Input */}
        <div className="my-2">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={newItem.isWinner}
            onChange={(e) => setNewItem({ ...newItem, isWinner: e.target.checked })}
          />
          <span className="ml-1">Is Winner? (Uncheck this option to allow re-spin)</span>
        </label>
        </div>
        {/* <input
          type="color"
          value={newItem.color}
          onChange={e => setNewItem({ ...newItem, color: e.target.value })}
          className="border-spot-red bg-[#1a1a1a] p-2 rounded"
        /> */}
        {/* Image Upload Input */}
        <div className="flex flex-col text-left border-2 border-spot-gold bg-[#000000] rounded p-2">
        <label>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#d5ae60" className="inline mr-1" viewBox="0 0 256 256">
            <path d="M224,64V176a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V64A16,16,0,0,1,48,48H208A16,16,0,0,1,224,64Z" opacity="0.2"></path><path d="M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H208a8,8,0,0,1,8,8Zm-48,48a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,224ZM157.66,106.34a8,8,0,0,1-11.32,11.32L136,107.31V152a8,8,0,0,1-16,0V107.31l-10.34,10.35a8,8,0,0,1-11.32-11.32l24-24a8,8,0,0,1,11.32,0Z"></path>
          </svg>
          Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={e => handleImageUpload(e.target.files?.[0] || null)}
          className="border-spot-red bg-[#1a1a1a] text-spot-gold p-2 rounded w-1/3 my-2"
        />

        {/* Image preview */}
        <div className="w-full bg-[#1a1a1a] p-4 rounded">
          <p className="text-xs text-gray-600 text-left">Image preview</p>
        {newItem.image?
          <img src={newItem.image} alt="Preview" className="w-20 h-20 object-cover mt-2 rounded border border-red-50" />
        :
          <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F016%2F916%2F479%2Fnon_2x%2Fplaceholder-icon-design-free-vector.jpg&f=1&nofb=1&ipt=2bf9bb68273ea5628176cd0c00fd36c9347c1349bbf3eb0be4b92f595b861bc5" alt="Preview" className="w-20 h-20 object-cover mt-2 rounded border border-red-50" />
        }
        </div>

        </div>
        
        <button onClick={handleSaveItem} className=" text-red-200 p-3 w-1/2 m-auto mt-3 rounded hover:bg-spot-gold hover:text-red-300 hover:bg-red-700 hover:cursor-pointer lg:bg-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className='inline mr-1' fill="#d5ae60" viewBox="0 0 256 256"><path d="M208,40H176V80a8,8,0,0,1-8,8H88a8,8,0,0,1-8-8V40.73a8,8,0,0,0-2.34,1.61L42.34,77.66A8,8,0,0,0,40,83.31V208a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V48A8,8,0,0,0,208,40ZM128,184a32,32,0,1,1,32-32A32,32,0,0,1,128,184Z" opacity="0.2"></path><path d="M208,32H83.31A15.86,15.86,0,0,0,72,36.69L36.69,72A15.86,15.86,0,0,0,32,83.31V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM88,48h80V80H88ZM208,208H48V83.31l24-24V80A16,16,0,0,0,88,96h80a16,16,0,0,0,16-16V48h24Zm-80-96a40,40,0,1,0,40,40A40,40,0,0,0,128,112Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,176Z"></path></svg>
          Save Item
        </button>
      </div>
      {/* item list */}
      <div className="text-left text-sm  bg-gray-900 mx-3 p-3 w-1/4 rounded-t-lg underline hover:cursor-pointer">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className="inline mr-1" fill="#d5ae60" viewBox="0 0 256 256"><path d="M128,128c-28.36-14.12-56.73-28.24-96,1.61,0-.53,0-1.07,0-1.61A96,96,0,0,1,78.6,45.67C124.09,64.75,126,96.38,128,128ZM81.4,212a96,96,0,0,0,94.6-.81c.47-.27.94-.53,1.4-.81C131.91,191.25,130,159.62,128,128,101.59,145.5,75.18,163,81.4,212ZM224,126.39a96,96,0,0,0-48-81.53l-1.4-.81C180.82,93,154.41,110.5,128,128,156.36,142.12,184.73,156.24,224,126.39Z" opacity="0.2"></path><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm87.82,98.46c-28.34,20-49.57,14.68-71.87,4.39,20.07-14.19,38.86-32.21,39.53-67.11A87.92,87.92,0,0,1,215.82,122.46ZM167.11,49.19C170.24,83.71,155,99.44,135,113.61c-2.25-24.48-8.44-49.8-38.37-67.82a87.89,87.89,0,0,1,70.5,3.4ZM79.32,54.73c31.45,14.55,37.47,35.58,39.71,60-22.33-10.29-47.35-17.59-77.93-.68A88.18,88.18,0,0,1,79.32,54.73ZM40.18,133.54c28.34-20,49.57-14.68,71.87-4.39C92,143.34,73.19,161.36,72.52,196.26A87.92,87.92,0,0,1,40.18,133.54Zm48.71,73.27C85.76,172.29,101,156.56,121,142.39c2.25,24.48,8.44,49.8,38.37,67.82a87.89,87.89,0,0,1-70.5-3.4Zm87.79-5.54c-31.45-14.55-37.47-35.58-39.71-60,12.72,5.86,26.31,10.75,41.3,10.75,11.33,0,23.46-2.8,36.63-10.08A88.2,88.2,0,0,1,176.68,201.27Z"></path></svg>
        <Link 
          href={'/'}
        >
        View Wheel
        </Link>
        
      </div>
      <div className="bg-gray-900 p-4 rounded-2xl lg:w-[800px]">
        
      <ul>
        {items.map(item => (
          <li key={item.id} className="mb-4 pb-4 flex items-center gap-2 text-spot-gold border-b-2 border-b-gray-700">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ed1c24" viewBox="0 0 256 256"><path d="M221.66,181.66l-48,48a8,8,0,0,1-11.32-11.32L196.69,184H72a8,8,0,0,1-8-8V32a8,8,0,0,1,16,0V168H196.69l-34.35-34.34a8,8,0,0,1,11.32-11.32l48,48A8,8,0,0,1,221.66,181.66Z"></path></svg>
            </span>
            {
              item.image && 
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded border-2 border-spot-red" />
            }
            <span className="w-full text-left">
              <p className="font-bold text-red-500 text-lg">{item.name}</p> 
              <span className="p-1 mr-4 text-left w-auto bg-amber-100 text-xs text-amber-800 rounded font-bold">Quantity: {item.quantity}</span>
              <span className='mt-2 text-left p-1 bg-green-100 text-green-800 rounded text-xs font-bold'>Set to win: {item.isWinner? 'YES' : 'NO'}</span>
            </span>
            <button
              onClick={() => handleEditItem(item.id)}
              className="mr-2 bg-gray-800 p-1 rounded hover:bg-[#D5AE60] hover:text-[#0A0A0A]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#d5ae60" viewBox="0 0 256 256"><path d="M221.66,90.34,192,120,136,64l29.66-29.66a8,8,0,0,1,11.31,0L221.66,79A8,8,0,0,1,221.66,90.34Z" opacity="0.2"></path><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>
            </button>
            {/* <input
              type="number"
              value={item.quantity}
              onChange={e => handleEditItem(item.id)}
              className="border-spot-red bg-gray-800 text-gray-300 p-1 w-20 rounded"
            /> */}
            {/* <input
              type="file"
              accept="image/*"
              onChange={e => {
                handleImageUpload(e.target.files?.[0] || null).then(() => {
                  if (newItem.image) updateItem(item.id, { image: newItem.image });
                });
              }}
              className="bg-gray-800 text-gray-300 p-1 rounded "
            /> */}
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="bg-red-50 text-spot-gold p-1 rounded hover:bg-red-100 hover:text-spot-black"
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