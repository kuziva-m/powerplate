
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Language, ScanResult } from './types';
import { LanguageSelector } from './components/LanguageSelector';
import { NutritionCard } from './components/NutritionCard';
import { RecipeCard } from './components/RecipeCard';
import { analyzeProduce } from './services/geminiService';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setCameraError(null);
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check permissions or upload a photo.");
      setIsCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isCameraActive && !image) {
      startCamera();
    }
    return () => stopCamera();
  }, [isCameraActive, image, startCamera, stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        const base64String = dataUrl.split(',')[1];
        setImage(dataUrl);
        stopCamera();
        processImage(base64String);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        stopCamera();
        processImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (base64: string) => {
    setAnalyzing(true);
    setResult(null);
    setError(null);
    try {
      const data = await analyzeProduce(base64, language);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setError(null);
    setIsCameraActive(true);
    startCamera();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">PowerPlate</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">by Food & Nutrition Council</p>
            </div>
          </div>
          <LanguageSelector currentLanguage={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 pb-24">
        {!image ? (
          <div className="flex flex-col h-full">
            {isCameraActive ? (
              <div className="relative w-full aspect-[3/4] md:aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Camera UI Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  <div className="flex justify-center">
                    <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full border border-white/20">
                      <p className="text-white text-xs font-medium uppercase tracking-widest">Live Camera Feed</p>
                    </div>
                  </div>
                  
                  {/* Framing Guide */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-64 h-64 border-2 border-dashed border-white/40 rounded-3xl flex items-center justify-center">
                      <p className="text-white/60 text-xs text-center px-8">Center the fruit or vegetable here</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white hover:bg-white/40 transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>

                    <button
                      onClick={handleCapture}
                      className="w-20 h-20 rounded-full bg-white border-4 border-green-600 flex items-center justify-center shadow-xl transform active:scale-90 transition-transform"
                    >
                      <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                      </div>
                    </button>

                    <div className="w-12 h-12" /> {/* Spacer */}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Camera Unavailable</h2>
                <p className="text-gray-600 mb-8 max-w-sm">{cameraError}</p>
                
                <div className="flex flex-col space-y-4 w-full max-w-xs">
                  <button
                    onClick={startCamera}
                    className="bg-green-600 text-white font-bold py-4 rounded-xl shadow-xl hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Try Again</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white text-green-600 border-2 border-green-600 font-bold py-4 rounded-xl hover:bg-green-50 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Upload from Gallery</span>
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Image Preview & Loading State */}
            <div className="relative group">
              <img src={image} alt="Uploaded produce" className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-lg border-4 border-white" />
              <button 
                onClick={reset}
                className="absolute top-4 right-4 bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors backdrop-blur-md border border-white/20"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {analyzing && (
                <div className="absolute inset-0 bg-white/90 rounded-3xl flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                  <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-2xl font-extrabold text-green-900 mb-2">Scientific Analysis</h3>
                  <p className="text-green-700 max-w-xs font-medium">Extracting nutritional markers and authentic Zimbabwean recipes...</p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex items-center space-x-4 shadow-sm">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-bold">Analysis Encountered an Error</p>
                  <p className="text-red-700 text-xs mt-1">{error}</p>
                </div>
                <button onClick={() => processImage(image.split(',')[1])} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-red-700 transition-colors">Retry</button>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                {/* Result Title */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{result.foodName}</h2>
                      <p className="text-gray-600 leading-relaxed max-w-2xl">{result.description}</p>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold text-green-700 border border-green-100 shrink-0 self-start">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Season: {result.seasonalInfo}</span>
                    </div>
                  </div>
                </div>

                {/* Nutrition Card */}
                <NutritionCard nutrients={result.nutrients} language={language} />

                {/* Health Advice */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-black uppercase tracking-widest italic">Health Insights</h3>
                    </div>
                    <p className="text-indigo-50 leading-relaxed text-lg font-medium italic">
                      "{result.healthAdvice}"
                    </p>
                  </div>
                </div>

                {/* Recipes Section */}
                <div>
                  <div className="flex items-center justify-between mb-6 px-2">
                    <h3 className="text-2xl font-black text-gray-900">Zimbabwean Recipes</h3>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600 font-bold uppercase tracking-widest">3 Dishes</span>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    {result.recipes.map((recipe, i) => (
                      <RecipeCard key={i} recipe={recipe} />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center pb-8">
                  <button 
                    onClick={reset}
                    className="bg-white border-2 border-gray-200 text-gray-600 font-bold py-4 px-12 rounded-2xl hover:bg-gray-50 transition-all shadow-sm"
                  >
                    Scan Another Item
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
