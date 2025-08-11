'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wheel, WheelInstance } from 'spin-wheel';
import { Howl } from 'howler';
import Confetti from 'react-confetti';
import { StockItem } from '@/lib/types';

interface SpinningWheelProps {
  items: StockItem[];
}

const SpinningWheel: React.FC<SpinningWheelProps> = ({ items }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpecialItem, setIsSpecialItem] = useState(false);
  const [wheelInstance, setWheelInstance] = useState<WheelInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonSpinning, setIsButtonSpinning] = useState(false);
  const [isCloseButtonEnabled, setIsCloseButtonEnabled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isWheelReady, setIsWheelReady] = useState(false);

  // Memoize Howl instances
  const spinSound = useMemo(
    () =>
      new Howl({
        src: ['/sounds/spin.mp3'],
        loop: false,
        volume: 0.5,
        preload: true,
      }),
    []
  );

  const winSound = useMemo(
    () =>
      new Howl({
        src: ['/sounds/win.mp3'],
        volume: 0.7,
        preload: true,
        onend: () => {
          setIsCloseButtonEnabled(true);
        },
      }),
    []
  );

  const defeatSound = useMemo(
    () =>
      new Howl({
        src: ['/sounds/defeat.mp3'],
        volume: 0.7,
        preload: true,
        onend: () => {
          setIsCloseButtonEnabled(true);
        },
      }),
    []
  );

  // Initialize wheel and preload images
  useEffect(() => {
    if (!wheelRef.current || items.length === 0) {
      console.log('No wheelRef or items, setting isWheelReady to true');
      setIsWheelReady(true);
      return;
    }

    const initializeWheel = async () => {
      try {
        // Clear existing wheel content
        if (wheelRef.current) {
          wheelRef.current.innerHTML = ''; // Clear DOM to prevent duplicates
        }

        // Check for duplicate IDs
        const ids = items.map((item) => item.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.error('Duplicate IDs in wheel items:', duplicates);
          setError('Duplicate IDs detected: ' + duplicates.join(', '));
          setIsWheelReady(true);
          return;
        }

        // Preload images
        const imagePromises = items
          .filter((item) => item.image)
          .map(
            (item) =>
              new Promise<void>((resolve) => {
                const img = new Image();
                img.src = item.image!;
                img.onload = () => {
                  console.log(`Image loaded: ${item.image}`);
                  resolve();
                };
                img.onerror = () => {
                  console.warn(`Failed to preload image: ${item.image}, proceeding`);
                  resolve();
                };
              })
          );

        await Promise.all(imagePromises);
        console.log('All images preloaded or failed');

        // Create wheel items
        const wheelItems = items.map((item, index) => {
          let imageElement: HTMLImageElement | undefined;
          if (item.image) {
            imageElement = new Image();
            imageElement.src = item.image;
            imageElement.height = 160;
            imageElement.width = 160;
            console.log(
              `Wheel item image created: ${item.image}, complete: ${imageElement.complete}, naturalWidth: ${imageElement.naturalWidth}`
            );
          }
          return {
            label: item.name,
            backgroundColor: index % 2 === 0 ? '#000000' : '#EB1C24',
            image: imageElement,
            imageRadius: 0.6,
            imageScale: 0.75,
            labelColor: index % 2 === 0 ? '#EB1C24' : '#000000',
          };
        });

        // Initialize wheel
        const wheel = new Wheel(wheelRef.current!, {
          items: wheelItems,
          itemLabelRadius: 0.80,
          itemLabelRotation: 95,
          imageRotation: 'item',
          itemLabelAlign: 'center',
          itemLabelFontSizeMax: 20,
          radius: 0.95,
          lineWidth: 4,
          borderColor: '#ffffff',
          borderWidth: 4,
          lineColor: '#ffffff',
          isInteractive: true,
          rotationResistance: -100,
          rotationSpeedMax: 1000,
          onCurrentIndexChange: () => {
            if (!isButtonSpinning && !spinSound.playing()) {
              spinSound.play();
            }
          },
          onRest: (event: { currentIndex: number }) => {
            spinSound.stop();
            const winningIndex = event.currentIndex;
            setWinner(items[winningIndex].name);
            setIsButtonSpinning(false);
            const selectedItem = items[winningIndex];
            logSpin(selectedItem);

            if (!selectedItem.isWinner) {
              defeatSound.play();
              setIsSpecialItem(true);
              setIsModalOpen(true);
              setShowConfetti(false);
              setIsCloseButtonEnabled(true);
            } else {
              setIsSpecialItem(false);
              winSound.play();
              setShowConfetti(true);
              setIsModalOpen(true);
              setTimeout(() => {
                setShowConfetti(false);
              }, 3000);
            }
          },
        });

        // Force initial draw
        wheel.draw();
        setWheelInstance(wheel);
        setIsWheelReady(true);
        console.log('Wheel initialized and drawn');
      } catch (err) {
        console.error('Wheel initialization failed:', err);
        setError('Failed to initialize wheel: ' + (err as Error).message);
        setIsWheelReady(true);
      }
    };

    initializeWheel();

    return () => {
      if (wheelInstance) {
        try {
          wheelInstance.remove();
          console.log('Wheel instance removed');
        } catch (err) {
          console.error('Error removing wheel instance:', err);
        }
      }
      if (wheelRef.current) {
        wheelRef.current.innerHTML = ''; // Clear DOM on cleanup
      }
      spinSound.stop();
      winSound.stop();
      defeatSound.stop();
    };
  }, [items]); // Removed unnecessary dependencies

  // const spin = () => {
  //   if (wheelInstance && isWheelReady && items.length > 0 && !isButtonSpinning) {
  //     setWinner(null);
  //     setIsModalOpen(false);
  //     setIsButtonSpinning(true);
  //     spinSound.play();
  //     const randomIndex = Math.floor(Math.random() * items.length);
  //     // Randomize number of revolutions (between 2 and 5)
  //     const randomRevolutions = Math.floor(Math.random() * 4) + 2; // 2 to 5 revolutions
  //      // Randomize direction: 1 (clockwise) or -1 (counterclockwise)
  //     const randomDirection = Math.random() < 0.5 ? 1 : -1;
  //     wheelInstance.spinToItem(randomIndex, 5000, true, randomRevolutions, randomDirection);
  //   } else {
  //     console.log('Spin blocked:', { wheelInstance, isWheelReady, itemsLength: items.length, isButtonSpinning });
  //   }
  // };


  //Using SpinTO
  const spin = () => {
    if (wheelInstance && isWheelReady && items.length > 0 && !isButtonSpinning) {
      setWinner(null);
      setIsModalOpen(false);
      setIsButtonSpinning(true);
      spinSound.play();
  
      // Select a random item index
      const randomIndex = Math.floor(Math.random() * items.length);
      
      // Calculate the angle range for the selected item
      const itemsCount = items.length;
      const segmentAngle = 360 / itemsCount; // Angle per item
      const itemStartAngle = randomIndex * segmentAngle; // Start angle of the item
      const itemEndAngle = itemStartAngle + segmentAngle; // End angle of the item
      
      // Randomize the target angle within the item's segment (for added randomness)
      const randomAngle = itemStartAngle + Math.random() * segmentAngle; // Random angle within the segment
      
      // Randomize number of revolutions (2 to 5)
      const randomRevolutions = Math.floor(Math.random() * 4) + 2;
      
      // Randomize direction: 1 (clockwise) or -1 (counterclockwise)
      const randomDirection = Math.random() < 0.5 ? 1 : -1;
      
      // Calculate total rotation (target angle + full revolutions)
      const totalRotation = randomAngle + randomRevolutions * 360 * randomDirection;
      
      // Randomize duration (4500 to 5500 ms)
      const randomDuration = 5000 + Math.floor(Math.random() * 1000 - 500);
      
      // Spin to the calculated angle
      wheelInstance.spinTo(totalRotation, randomDuration);
      
      console.log('Spinning with:', {
        randomIndex,
        randomAngle,
        totalRotation,
        randomDuration,
        randomRevolutions,
        randomDirection,
      });
    } else {
      console.log('Spin blocked:', { wheelInstance, isWheelReady, itemsLength: items.length, isButtonSpinning });
    }
  };
  const reset = () => {
    if (confirm('Reset the wheel? This will refresh the page.')) {
      window.location.reload();
    }
  };

  const closeModal = () => {
    if (isCloseButtonEnabled) {
      setIsModalOpen(false);
      setWinner(null);
      setIsCloseButtonEnabled(false);
      setShowConfetti(false);
      setIsSpecialItem(false);
    }
  };

  const logSpin = async (item: StockItem) => {
    try {
      const response = await fetch('/api/logs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          itemId: item.id,
          itemName: item.name,
          isWinner: item.isWinner,
          quantity: item.quantity,
        }),
      });
      if (!response.ok) {
        console.error('Failed to log spin:', response.statusText);
      }
    } catch (err) {
      console.error('Error logging spin:', err);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : !isWheelReady ? (
        <div className="flex flex-col items-center">
          <p className="text-2xl text-[#D5AE60]">Loading...</p>
          <div className="mt-2 h-8 w-8 animate-spin rounded-full border-4 border-[#D5AE60] border-t-transparent"></div>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="wheel-wrapper" style={{ width: '600px', height: '600px' }}>
            <div ref={wheelRef} className="wheel-container" />
            <svg
              className="wheel-pointer"
              width="50"
              height="50"
              viewBox="0 0 256 256"
              fill="#fff"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M128,24a80,80,0,0,0-80,80c0,72,80,128,80,128s80-56,80-128A80,80,0,0,0,128,24Zm0,112a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z"
                opacity="0.2"
              ></path>
              <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
            </svg>
          </div>
          <div className="space-x-4 inline">
            <button
              onClick={spin}
              disabled={!isWheelReady || isButtonSpinning}
              className={`pulsate-bck-normal mt-4 border-2 border-amber-500 hover:bg-amber-600 shadow-[0px_20px_207px_10px_rgba(235,_0,_4,_0.2)] text-white text-lg p-4 rounded-md hover:cursor-pointer ${
                !isWheelReady || isButtonSpinning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                className="inline mr-1"
                fill="#ffffff"
                viewBox="0 0 256 256"
              >
                <path
                  d="M240,144H208a80,80,0,0,1-80,80,88,88,0,0,1-88-88,96,96,0,0,1,96-96A104,104,0,0,1,240,144Z"
                  opacity="0.2"
                ></path>
                <path d="M248,144a8,8,0,0,1-16,0,96.11,96.11,0,0,0-96-96,88.1,88.1,0,0,0-88,88,80.09,80.09,0,0,0,80,80,72.08,72.08,0,0,0,72-72,64.07,64.07,0,0,0-64-64,56.06,56.06,0,0,0-56,56,48.05,48.05,0,0,0,48,48,40,40,0,0,0,40-40,32,32,0,0,0-32-32,24,24,0,0,0-24,24,16,16,0,0,0,16,16,8,8,0,0,0,8-8,8,8,0,0,1,0-16,16,16,0,0,1,16,16,24,24,0,0,1-24,24,32,32,0,0,1-32-32,40,40,0,0,1,40-40,48.05,48.05,0,0,1,48,48,56.06,56.06,0,0,1-56,56,64.07,64.07,0,0,1-64-64,72.08,72.08,0,0,1,72-72,80.09,80.09,0,0,1,80,80,88.1,88.1,0,0,1-88,88,96.11,96.11,0,0,1-96-96A104.11,104.11,0,0,1,136,32,112.12,112.12,0,0,1,248,144Z"></path>
              </svg>
              Spin to Win
            </button>
            <button
              onClick={reset}
              disabled={!isWheelReady}
              className={`mt-4 bg-red-500 text-red-200 text-lg p-4 border-2 border-red-600 shadow-[0px_20px_207px_10px_rgba(235,_0,_4,_0.2)] rounded-md hover:bg-red-600 hover:cursor-pointer ${
                !isWheelReady ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="#ffc9c9"
                className="inline mr-2"
                viewBox="0 0 256 256"
              >
                <path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,0,1,16,0Z"></path>
              </svg>
              Reset
            </button>
          </div>
          {isModalOpen && winner && (
            <div className="fixed inset-0 modal-overlay bg-spot-black bg-opacity-75 flex items-center justify-center z-50">
              {showConfetti && !isSpecialItem && (
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  colors={['#EB1C24', '#D5AE60', '#FFFFFF', '#0A0A0A']}
                  numberOfPieces={400}
                  recycle={true}
                  run={showConfetti}
                />
              )}
              <div className="modal p-6 w-1/2 text-center" style={{ fontFamily: 'Lato' }}>
                <h2 className="text-3xl font-bold mb-4 bg-red-500 w-3/4 m-auto -mt-12 p-3 text-white rounded border-2 border-red-600">
                  {isSpecialItem ? 'Too Bad!' : 'Winner!'}
                </h2>
                <span className="py-2">{isSpecialItem ? 'Nothing!' : ''}</span>
                <p className={`text-6xl font-bold mb-4 ${isSpecialItem ? 'text-red-600' : 'text-amber-600'}`}>
                  {winner}
                </p>
                {items.find((item) => item.name === winner)?.image && (
                  <img
                    src={items.find((item) => item.name === winner)?.image}
                    alt="Winner"
                    className="w-32 h-32 object-cover mx-auto mb-4"
                  />
                )}
                <button
                  onClick={closeModal}
                  disabled={!isCloseButtonEnabled}
                  className={`bg-red-500 text-red-50 p-2 rounded hover:bg-spot-gold hover:text-spot-black hover:cursor-pointer ${
                    !isCloseButtonEnabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#fef2f2"
                    className="inline mr-1"
                    viewBox="0 0 256 256"
                  >
                    <path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path>
                    <path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                  </svg>
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-red-500 p-4 bg-red-100 border-2 border-red-500 rounded-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="#cd323a"
            className="inline mr-2"
            viewBox="0 0 256 256"
          >
            <path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path>
            <path d="M198.24,62.63l15.68-17.25a8,8,0,0,0-11.84-10.76L186.4,51.86A95.95,95.95,0,0,0,57.76,193.37L42.08,210.62a8,8,0,1,0,11.84,10.76L69.6,204.14A95.95,95.95,0,0,0,198.24,62.63ZM48,128A80,80,0,0,1,175.6,63.75l-107,117.73A79.63,79.63,0,0,1,48,128Zm80,80a79.55,79.55,0,0,1-47.6-15.75l107-117.73A79.95,79.95,0,0,1,128,208Z"></path>
          </svg>
          No items in stock to spin.
        </p>
      )}
    </div>
  );
};

export default SpinningWheel;