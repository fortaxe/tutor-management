
import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    async function startCamera() {
      stopStream();
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facingMode },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions.');
      }
    }

    startCamera();

    return () => stopStream();
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative w-full aspect-square max-w-sm overflow-hidden rounded-full border-4 border-brand-100 bg-black shadow-inner">
        {error ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-white text-sm">
            {error}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none rounded-full" />
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <button
          type="button"
          onClick={onCancel}
          className="py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={toggleCamera}
          className="py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Flip
        </button>
        <button
          type="button"
          onClick={capturePhoto}
          disabled={!!error}
          className="col-span-2 py-4 px-4 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-brand-700 shadow-lg active:scale-95 transition-all disabled:opacity-50"
        >
          Capture Member ID
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
