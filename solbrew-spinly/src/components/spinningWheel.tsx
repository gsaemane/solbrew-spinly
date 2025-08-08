'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const [isImagesLoaded, setIsImagesLoaded] = useState(false);

  const spinSound = new Howl({
    src: ['/sounds/spin.mp3'],
    loop: false,
    volume: 0.5,
    preload: true,
  });

  const winSound = new Howl({
    src: ['/sounds/win.mp3'],
    volume: 0.7,
    preload: true,
    onend: () => {
      setIsCloseButtonEnabled(true);
    },
  });

  const defeatSound = new Howl({
    src: ['/sounds/defeat.mp3'],
    volume: 0.7,
    preload: true,
    onend: () => {
      setIsCloseButtonEnabled(true);
    },
  });


  // Preload Images
  useEffect(() => {
    if (items.length === 0) {
      setIsImagesLoaded(true);
      return;
    }

    const loadImages = async () => {
      try {
        const imagePromises = items
          .filter((item) => item.image)
          .map((item) =>
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.src = item.image!;
              img.onload = () => {
                console.log(`Image preloaded: ${item.image}`);
                resolve();
              };
              img.onerror = () => {
                console.error(`Failed to preload image: ${item.image}`);
                reject(new Error(`Failed to preload image: ${item.image}`));
              };
            })
          );

        await Promise.all(imagePromises);
        console.log('All images preloaded successfully');
        setIsImagesLoaded(true);
      } catch (err) {
        console.error('Image preloading failed:', err);
        setError('Failed to preload images: ' + (err as Error).message);
        setIsImagesLoaded(true); // Proceed even if some images fail
      }
    };

    loadImages();
  }, [items]);

  // Initialize Wheel
  useEffect(() => {
    if (wheelRef.current && items.length > 0 && isImagesLoaded) {
      try {
        // Check for duplicate IDs
        const ids = items.map(item => item.id);
        const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
        if (duplicates.length > 0) {
          console.error('Duplicate IDs in wheel items:', duplicates);
          setError('Duplicate IDs detected: ' + duplicates.join(', '));
          return;
        }

        const wheelItems = items.map((item, index) => {
          let imageElement: HTMLImageElement | undefined;
          if (item.image) {
            imageElement = new Image();
            imageElement.src = item.image;
            imageElement.height = 160;
            imageElement.width = 160;
            console.log(`Wheel item image created: ${item.image}, complete: ${imageElement.complete}, naturalWidth: ${imageElement.naturalWidth}`);
          }
          const wheelItem = {
            label: item.name,
            backgroundColor: index % 2 === 0 ? '#000000' : '#EB1C24',
            image: imageElement,
            imageRadius: 0.6,
            imageScale: 0.75,
            labelColor: index % 2 === 0 ? '#EB1C24' : '#000000',
          };
          console.log(`Wheel item: ${item.name}, ID: ${item.id}, IsWinner: ${item.isWinner}, Quantity: ${item.quantity}, Image: ${item.image}`);
          return wheelItem;
        });

        console.log('Wheel items created:', wheelItems);

        const wheel = new Wheel(wheelRef.current, {
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
            // Log spin
            logSpin(selectedItem);

            if (!items[winningIndex].isWinner) {
              
              defeatSound.play();
              setIsSpecialItem(true);
              setIsModalOpen(true);
              setShowConfetti(false);
              setIsCloseButtonEnabled(true); // Enable Close for non-winners
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

        setWheelInstance(wheel);

        return () => {
          wheel.remove();
          spinSound.stop();
          winSound.stop();
          defeatSound.stop();
        };
      } catch (err) {
        console.error('Wheel initialization failed:', err);
        setError('Failed to initialize wheel: ' + (err as Error).message);
      }
    } else {
      console.log('No items, wheelRef not ready, or images not loaded:', {
        items,
        wheelRef: wheelRef.current,
        isImagesLoaded,
      });
    }
  }, [items, isImagesLoaded, spinSound,winSound,defeatSound]);

  // Force redraw after wheelInstance is set
  useEffect(() => {
    if (wheelInstance && items.length > 0 && isImagesLoaded) {
      // Recreate wheel items to ensure fresh image instances
      const wheelItems = items.map((item, index) => {
        let imageElement: HTMLImageElement | undefined;
        if (item.image) {
          imageElement = new Image();
          imageElement.src = item.image;
          imageElement.height = 160;
          imageElement.width = 160;
          console.log(`Redraw wheel item image: ${item.image}, complete: ${imageElement.complete}, naturalWidth: ${imageElement.naturalWidth}`);
        }
        const wheelItem = {
          label: item.name,
          backgroundColor: index % 2 === 0 ? '#111111' : '#f9363d',
          image: imageElement,
          imageRadius: 0.5,
          imageScale: 0.8,
          labelColor: index % 2 === 0 ? '#4f4f4f' : '#f7b9bb',
          itemLabelStrokeColor: '#f96262',
          itemLabelStrokeWidth:2
        };
        return wheelItem;
      });

      // Verify images are loaded before redraw
      const imageLoadPromises = wheelItems
        .filter(item => item.image)
        .map(item =>
          new Promise<void>((resolve) => {
            if (item.image?.complete && item.image?.naturalWidth > 0) {
              console.log(`Image ready for redraw: ${item.image.src}`);
              resolve();
            } else {
              item.image!.onload = () => {
                console.log(`Image loaded for redraw: ${item.image!.src}`);
                resolve();
              };
              item.image!.onerror = () => {
                console.error(`Image failed for redraw: ${item.image!.src}`);
                resolve(); // Proceed to avoid blocking
              };
            }
          })
        );

      Promise.all(imageLoadPromises).then(() => {
        console.log('All images confirmed for redraw, updating wheel');
        wheelInstance.items = wheelItems; // Reassign items
        wheelInstance.draw(); // Force redraw
      });

      // Fallback redraw after 500ms
      setTimeout(() => {
        console.log('Fallback redraw triggered');
        wheelInstance.items = wheelItems;
        wheelInstance.draw();
      }, 500);
    }
  }, [wheelInstance, items, isImagesLoaded]);

  const spin = () => {
    if (wheelInstance && items.length > 0) {
      setWinner(null);
      setIsModalOpen(false);
      setIsButtonSpinning(true);
      spinSound.play();
      //Mad Randomness
      const randomIndex = Math.floor(Math.random() * items.length);
      wheelInstance.spinToItem(randomIndex, 3000, true, 3, 1);
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

  // Log spin to API
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
    <div className="flex flex-col items-center ">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : !isImagesLoaded ? (
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
          {/* Button Row */}
          <div className="space-x-4 inline">
            {/* Spin Button */}
            
            <button
              onClick={spin}
              disabled={!wheelInstance}
              className={`pulsate-bck-normal mt-4 border-2 border-amber-500 hover:bg-amber-600 shadow-[0px_20px_207px_10px_rgba(235,_0,_4,_0.2)]  text-white text-lg p-4 rounded-md  hover:cursor-pointer   ${
                !wheelInstance ? 'opacity-50' : ''
              } `}
              
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

            {/* Reset Button */}
            <button
              onClick={reset}
              disabled={!wheelInstance}
              className={`mt-4 bg-red-500 text-red-200 text-lg p-4 border-2 border-red-600 shadow-[0px_20px_207px_10px_rgba(235,_0,_4,_0.2)] rounded-md hover:bg-red-600 hover:cursor-pointer ${
                !wheelInstance ? 'opacity-50' : ''
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
              
            </button>
          </div>

          {isModalOpen && winner && (
            <div className="fixed inset-0 modal-overlay bg-spot-black bg-opacity-75 flex items-center justify-center z-50">
              {showConfetti &&  (
                isSpecialItem?
                ''
                :
                <Confetti
                  width={window.innerWidth}
                  height={window.innerHeight}
                  colors={['#EB1C24', '#D5AE60', '#FFFFFF', '#0A0A0A']}
                  numberOfPieces={400}
                  recycle={true}
                  run={showConfetti}
                />
              )}
  
              <div className="modal p-6  w-1/2 text-center" style={{ fontFamily: 'Lato' }}>
              <h2 className="text-3xl font-bold mb-4 bg-red-500 w-3/4 m-auto -mt-12 p-3 text-white rounded border-2 border-red-600">{isSpecialItem ? 'Too Bad!' : 'Winner!'}</h2>
                
                
                <span className="py-2">You got {isSpecialItem ? 'Nothing!' : ''}</span>

                {isSpecialItem?
                  <p className="text-6xl  text-red-600  mb-4">{winner}</p>
                  :
                  <p className="text-6xl font-bold  text-amber-600  mb-4">{winner}</p>
                }
                
                {/* Winner image */}
                {items.find((item) => item.name === winner)?.image && (
                  <img
                  src={ items.find((item) => item.name === winner)?.image}
                    alt="Winner"
                    className="w-32 h-32 object-cover mx-auto mb-4 "
                  />
                )}
                {/* Winner qty
                {items.find((item) => item.name === winner)?.quantity && (
                  <p className="text-xl py-4">
                    {isSpecialItem? 'Sorry try your luck next time' : ''}
                  </p>
                  
                )} */}
                {/* Close Modal Button */}
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