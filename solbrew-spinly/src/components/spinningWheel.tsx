'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wheel, WheelInstance } from 'spin-wheel';
import { Howl } from 'howler';
import { StockItem } from '@/lib/types';

interface SpinningWheelProps {
  items: StockItem[];
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ items }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [wheelInstance, setWheelInstance] = useState<WheelInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonSpinning, setIsButtonSpinning] = useState(false);
  const [isCloseButtonEnabled, setIsCloseButtonEnabled] = useState(false);

  // Initialize Howler sounds
  const spinSound = new Howl({
    src: ['/sounds/spin.mp3'], // 2-5s looping spin sound
    loop: true,
    volume: 0.5,
    preload: true,
  });

  const winSound = new Howl({
    src: ['/sounds/win.mp3'], // 1-3s win jingle
    volume: 0.7,
    preload: true,
    onend: () => {
      setIsCloseButtonEnabled(true); // Enable Close button when win sound finishes
    },
  });

  useEffect(() => {
    if (wheelRef.current && items.length > 0) {
      try {
        const wheelItems = items.map((item) => {
          const wheelItem = {
            label: item.name,
            backgroundColor: item.color,
            image: item.image || undefined,
            imageRadius: 0.7,
            imageScale: 0.8,
          };
          console.log(`Item: ${item.name}, Image: ${item.image}`);
          return wheelItem;
        });

        console.log('Wheel items:', wheelItems);

        const wheel = new Wheel(wheelRef.current, {
          items: wheelItems,
          radius: 0.9,
          imageRotation: 'item',
          textOrientation: 'curved',
          textAlignment: 'center',
          lineWidth: 1,
          lineColor: '#D5AE60', // Spot Gold
          isInteractive: true,
          onCurrentIndexChange: () => {
            if (!isButtonSpinning && !spinSound.playing()) {
              spinSound.play();
            }
          },
          onRest: (event: { currentIndex: number }) => {
            spinSound.stop();
            winSound.play();
            setIsButtonSpinning(false);
            setIsCloseButtonEnabled(false); // Disable Close button until win sound finishes
            const winningIndex = event.currentIndex;
            setWinner(items[winningIndex].name);
            setIsModalOpen(true);
          },
        });

        setWheelInstance(wheel);

        return () => {
          wheel.destroy();
          spinSound.stop();
          winSound.stop();
        };
      } catch (err) {
        console.error('Wheel initialization failed:', err);
        setError('Failed to initialize wheel: ' + (err as Error).message);
      }
    } else {
      console.log('No items or wheelRef not ready:', { items, wheelRef: wheelRef.current });
    }
  }, [items]);

  const spin = () => {
    if (wheelInstance && items.length > 0) {
      setWinner(null);
      setIsModalOpen(false);
      setIsButtonSpinning(true);
      spinSound.play();
      wheelInstance.spin();
    }
  };
  const reset = () => {
    window.location.reload(); // Refresh the page
  };
  const closeModal = () => {
    if (isCloseButtonEnabled) {
      setIsModalOpen(false);
      setWinner(null);
      setIsCloseButtonEnabled(false);
    }
  };

  return (
    <div className="flex flex-col items-center ">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : items.length > 0 ? (
        <>
          <div className="wheel-wrapper" style={{ width: '500px', height: '500px' }}>
            <div ref={wheelRef} className="wheel-container" />
            <svg
              className="wheel-pointer"
              width="40"
              height="30"
              viewBox="0 0 40 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 30 L10 10 H30 L20 30 Z" fill="#D5AE60" stroke="#EB1C24" strokeWidth="2" />
            </svg>
          </div>
          <button
            onClick={reset}
            disabled={!wheelInstance}
            className={`mt-4 bg-spot-red text-spot-gold p-2 rounded ${!wheelInstance ? 'opacity-50' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ed1c24" className="inline mr-2" viewBox="0 0 256 256"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path></svg>
            Refresh
          </button>

          {isModalOpen && winner && (
            <div className="fixed inset-0 bg-spot-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="modal p-6 max-w-sm w-full text-center">
                <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
                  Winner!
                </h2>
                <p className="text-xl mb-4">{winner}</p>
                {items.find((item) => item.name === winner)?.image && (
                  <img
                    src={items.find((item) => item.name === winner)?.image}
                    alt="Winner"
                    className="w-32 h-32 object-cover mx-auto mb-4 rounded-full border-2 border-spot-red"
                  />
                )}
                <button
                  onClick={closeModal}
                  disabled={!isCloseButtonEnabled}
                  className={`bg-spot-red text-spot-gold p-2 rounded hover:bg-spot-gold hover:text-spot-black ${
                    !isCloseButtonEnabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Close
                </button>
                
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-spot-gold">No items in stock to spin.</p>
      )}
    </div>
  );
};

export default SpinningWheel;