import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, Zap, Image as ImageIcon } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

export const CameraView: React.FC<CameraViewProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streamStarted, setStreamStarted] = useState(false);
  const [error, setError] = useState<string>('');

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Prefer back camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamStarted(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or unavailable.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onCapture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-[#01161e]">
        <div className="bg-[#fb3640] p-4 rounded-full mb-4">
          <Camera className="w-8 h-8 text-white" />
        </div>
        <p className="text-[#f7dba7] mb-6">{error}</p>
        <button 
          onClick={startCamera}
          className="px-6 py-3 bg-[#247ba0] text-white rounded-lg font-medium"
        >
          Retry Camera
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
      {/* Hidden elements for capture logic */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay UI */}
      <div className="relative z-10 flex flex-col justify-between h-full pt-safe-top pb-safe-bottom">
        
        {/* Top Gradient & Title */}
        <div className="p-6 bg-gradient-to-b from-[#01161e]/90 to-transparent">
          <h1 className="text-xl font-semibold text-[#f7dba7] tracking-wide text-center uppercase opacity-80">
            Scan Business Card
          </h1>
        </div>

        {/* Scanning Reticle / Focus Area */}
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="relative w-full aspect-[1.58/1] max-w-sm rounded-xl border border-[#f7dba7]/30 shadow-[0_0_0_9999px_rgba(1,22,30,0.6)] overflow-hidden">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-[#247ba0] rounded-tl-sm" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-[#247ba0] rounded-tr-sm" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-[#247ba0] rounded-bl-sm" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-[#247ba0] rounded-br-sm" />

            {/* Scanning Beam Animation */}
            {!isProcessing && streamStarted && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#fb3640] to-transparent animate-scan opacity-70" />
            )}
            
            {/* Processing State Overlay */}
            {isProcessing && (
              <div className="absolute inset-0 bg-[#01161e]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#247ba0] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[#f7dba7] font-medium tracking-wide animate-pulse">Extracting...</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="p-8 pb-12 flex items-center justify-around bg-gradient-to-t from-[#01161e] via-[#01161e]/80 to-transparent">
          {/* Gallery Upload */}
          <label className="p-4 rounded-full bg-[#f7dba7]/10 hover:bg-[#f7dba7]/20 transition-colors cursor-pointer">
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isProcessing} />
            <ImageIcon className="w-6 h-6 text-[#f7dba7]" />
          </label>

          {/* Shutter Button */}
          <button 
            onClick={handleCapture}
            disabled={isProcessing}
            className={`
              w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-200
              ${isProcessing ? 'border-gray-600 bg-gray-800 scale-95' : 'border-[#f7dba7] bg-[#f7dba7]/10 hover:bg-[#f7dba7]/20 active:scale-95'}
            `}
          >
            <div className={`w-14 h-14 rounded-full ${isProcessing ? 'bg-gray-600' : 'bg-[#f7dba7]'}`} />
          </button>

          {/* Flash Toggle (Visual Only for Web/UserMedia limitations typically) */}
          <button className="p-4 rounded-full bg-[#f7dba7]/10 hover:bg-[#f7dba7]/20 transition-colors opacity-50 cursor-not-allowed">
            <Zap className="w-6 h-6 text-[#f7dba7]" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};