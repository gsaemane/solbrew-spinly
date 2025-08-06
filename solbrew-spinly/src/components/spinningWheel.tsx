'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Wheel, WheelInstance } from 'spin-wheel';
import { Howl } from 'howler';
import { StockItem } from '@/lib/types';
import Confetti from 'react-confetti';

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [isImagesLoaded, setIsImagesLoaded] = useState(false); // Track image loading
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
    if (items.length === 0) {
      setIsImagesLoaded(true); // No images to load if no items
      return;
    }

    // Preload images and wait for completion
    const loadImages = async () => {
      try {
        const imagePromises = items
          .filter((item) => item.image)
          .map((item) =>
            new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.src = item.image!;
              img.onload = () => resolve();
              img.onerror = () => reject(new Error(`Failed to load image: ${item.image}`));
            })
          );

        await Promise.all(imagePromises);
        setIsImagesLoaded(true);
      } catch (err) {
        console.error('Image loading failed:', err);
        setError('Failed to load images: ' + (err as Error).message);
        setIsImagesLoaded(true); // Show wheel even if images fail, with error message
      }
    };

    loadImages();
  }, [items]);


  useEffect(() => {
    if (wheelRef.current && items.length > 0 && isImagesLoaded) {
      try {
        const wheelItems = items.map((item,index) => {
        
        let imageElement: HTMLImageElement | undefined;
          if (item.image) {
            imageElement = new Image();
            imageElement.src = item.image;
            imageElement.height = 160;
            imageElement.width = 160;
          }
          let itemLabel = item.name;
          const wheelItem = {
            label: itemLabel,
            backgroundColor: index % 2 === 0 ? '#000000' : '#EB1C24',
            image: imageElement,
            imageRadius: 0.7,
            imageScale: 0.8,
            labelColor:index % 2 === 0 ? '#EB1C24' : '#000000'
          };
          console.log(`Item: ${item.name}, Image: ${item.image}`);
          return wheelItem;
        });

        console.log('Wheel items:', wheelItems);

        const wheel = new Wheel(wheelRef.current, {
          items: wheelItems,
            itemLabelRadius:0.80,
          itemLabelRotation:95,
          imageRotation: 'item',
          itemLabelAlign:'center',
          itemLabelFontSizeMax:20,
          radius:0.95,
          lineWidth: 4,
          borderColor:'#ffffff',
          borderWidth:4,
          lineColor: '#ffffff', // Spot Gold
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
            setShowConfetti(true); // Start confetti when modal opens
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
      setShowConfetti(false); // Stop confetti when modal closes
    }
  };

  return (
    <div className="flex flex-col items-center ">
      {error ? (
        <p className="text-red-500">{error}</p>
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
                xmlns="http://www.w3.org/2000/svg">
                <path d="M128,24a80,80,0,0,0-80,80c0,72,80,128,80,128s80-56,80-128A80,80,0,0,0,128,24Zm0,112a32,32,0,1,1,32-32A32,32,0,0,1,128,136Z" opacity="0.2"></path>
                <path d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"></path>
            </svg>
            
          </div>
          <button
            onClick={reset}
            disabled={!wheelInstance}
            className={`mt-4 bg-red-500 text-red-200 p-4 rounded-md hover:opacity-60 hover:cursor-pointer ${!wheelInstance ? 'opacity-50' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc9c9" className="inline mr-2" viewBox="0 0 256 256"><path d="M240,56v48a8,8,0,0,1-8,8H184a8,8,0,0,1,0-16H211.4L184.81,71.64l-.25-.24a80,80,0,1,0-1.67,114.78,8,8,0,0,1,11,11.63A95.44,95.44,0,0,1,128,224h-1.32A96,96,0,1,1,195.75,60L224,85.8V56a8,8,0,1,1,16,0Z"></path></svg>
            Refresh
          </button>

          {isModalOpen && winner && (
            
            <div className="fixed inset-0 bg-spot-black bg-opacity-75 flex items-center justify-center z-50">

                {showConfetti && (
                    <Confetti
                      width={window.innerWidth}
                      height={window.innerHeight}
                      colors={['#EB1C24', '#D5AE60', '#FFFFFF', '#0A0A0A']} // Spot Red, Spot Gold, White, Spot Black
                      numberOfPieces={400}
                      recycle={true}
                      run={showConfetti}
                    />
                )}

              <div className="modal p-6 max-w-sm w-full text-center">
                <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display' }}>
                  Winner!
                </h2>
                <p className="text-2xl mb-4">{winner}</p>
                {/* Winner image */}
                {items.find((item) => item.name === winner)?.image && (
                  <img
                    src={items.find((item) => item.name === winner)?.image}
                    alt="Winner"
                    className="w-32 h-32 object-cover mx-auto mb-4 rounded-full border-2 border-spot-red"
                  />
                  
                )}
                {/* Winner qty */}
                {items.find((item) => item.name === winner)?.quantity && (
                  <p className="text-xl py-4">You get {items.find((item) => item.name === winner)?.quantity} cans</p>
                  
                )}


                <button
                  onClick={closeModal}
                  disabled={!isCloseButtonEnabled}
                  className={`bg-red-500 text-red-50 p-2 rounded hover:bg-spot-gold hover:text-spot-black ${
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
        <p className="text-red-500 p-4 bg-red-100 border-2 border-red-500 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#cd323a" className="inline mr-2" viewBox="0 0 256 256"><path d="M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z" opacity="0.2"></path><path d="M198.24,62.63l15.68-17.25a8,8,0,0,0-11.84-10.76L186.4,51.86A95.95,95.95,0,0,0,57.76,193.37L42.08,210.62a8,8,0,1,0,11.84,10.76L69.6,204.14A95.95,95.95,0,0,0,198.24,62.63ZM48,128A80,80,0,0,1,175.6,63.75l-107,117.73A79.63,79.63,0,0,1,48,128Zm80,80a79.55,79.55,0,0,1-47.6-15.75l107-117.73A79.95,79.95,0,0,1,128,208Z"></path></svg>
            No items in stock to spin.
        </p>
      )}
    </div>
  );
};

export default SpinningWheel;