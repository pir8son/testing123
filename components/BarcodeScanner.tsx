
import React, { useEffect, useRef, useState } from 'react';
import { XIcon } from './icons/XIcon';
import { BarcodeIcon } from './icons/BarcodeIcon';

interface BarcodeScannerProps {
  onClose: () => void;
  onScan: (data: { name: string; amount: string; nutrition?: any }) => void;
}

const MOCK_PRODUCTS = [
    { name: 'Oat Milk', amount: '1 carton', nutrition: { calories: 130, protein: 4, carbs: 16, fat: 5 } },
    { name: 'Whole Wheat Bread', amount: '1 loaf', nutrition: { calories: 100, protein: 5, carbs: 18, fat: 1.5 } },
    { name: 'Greek Yogurt', amount: '1 tub', nutrition: { calories: 90, protein: 15, carbs: 6, fat: 0 } },
    { name: 'Pasta Sauce', amount: '1 jar', nutrition: { calories: 70, protein: 2, carbs: 12, fat: 1.5 } },
    { name: 'Peanut Butter', amount: '1 jar', nutrition: { calories: 190, protein: 7, carbs: 8, fat: 16 } },
];

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasPermission(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleSimulateScan = () => {
      // Simulate a successful scan interaction
      const randomProduct = MOCK_PRODUCTS[Math.floor(Math.random() * MOCK_PRODUCTS.length)];
      onScan(randomProduct);
  };

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col">
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/60 to-transparent">
        <h1 className="text-white font-bold text-lg flex items-center gap-2">
            <BarcodeIcon className="w-6 h-6" />
            Scanner
        </h1>
        <button onClick={onClose} className="p-2 bg-black/20 backdrop-blur-md rounded-full text-white">
          <XIcon className="w-6 h-6" />
        </button>
      </header>

      <div 
        className="flex-grow relative overflow-hidden bg-black flex items-center justify-center cursor-pointer"
        onClick={handleSimulateScan}
      >
        {hasPermission === null && <p className="text-white">Requesting camera access...</p>}
        {hasPermission === false && <p className="text-white">Camera access denied. Please check settings.</p>}
        
        <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        
        {/* Scanner Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-40 border-2 border-green-500 rounded-lg relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-green-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-green-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-green-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-green-500 -mb-1 -mr-1"></div>
                
                {/* Scanning Laser */}
                <div className="absolute left-0 right-0 h-0.5 bg-red-500 top-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-scan"></div>
            </div>
        </div>
        
        <div className="absolute bottom-20 left-0 right-0 text-center space-y-2 pointer-events-none">
            <p className="text-white font-bold text-xl drop-shadow-md">
                Tap screen to scan
            </p>
            <p className="text-gray-300 text-sm drop-shadow-md">
                Align barcode within the frame
            </p>
        </div>
      </div>
       <style>{`
        @keyframes scan {
            0% { transform: translateY(-80px); }
            50% { transform: translateY(80px); }
            100% { transform: translateY(-80px); }
        }
        .animate-scan {
            animation: scan 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;
