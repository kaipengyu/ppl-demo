import React, { useState, useEffect } from 'react';
import { BillData } from '../types';
import { generateEnergyCollage, generatePersonaImage } from '../services/geminiService';
import basePhoto from '../src/base-photo.jpg';

interface BillDisplayProps {
  data: BillData;
}

// Simulating the local file provided by user in src folder (Blue Blueprint Style)
const DEFAULT_BASE_PHOTO_URL = basePhoto;

const BillDisplay: React.FC<BillDisplayProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [collageImage, setCollageImage] = useState<string | null>(null);
  const [personaImage, setPersonaImage] = useState<string | null>(null);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);
  
  const jsonString = JSON.stringify(data, null, 2);

  // Automatically generate persona image on load
  useEffect(() => {
    let mounted = true;
    const fetchPersona = async () => {
      if (data.personaVisualPrompt) {
        const img = await generatePersonaImage(data.personaVisualPrompt);
        if (mounted && img) setPersonaImage(img);
      }
    };
    fetchPersona();
    return () => { mounted = false; };
  }, [data.personaVisualPrompt]);

  // Automatically generate collage on load
  useEffect(() => {
    let mounted = true;
    
    const generateCollageAuto = async () => {
      setIsGeneratingCollage(true);
      try {
        const base64Base = await urlToBase64(DEFAULT_BASE_PHOTO_URL);
        const imageUrl = await generateEnergyCollage(data.energyTip, base64Base);
        if (mounted) setCollageImage(imageUrl);
      } catch (err) {
        console.error("Auto collage generation failed:", err);
        // Silently fail or keep the placeholder state if generation fails
      } finally {
        if (mounted) setIsGeneratingCollage(false);
      }
    };

    generateCollageAuto();

    return () => { mounted = false; };
  }, [data.energyTip]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in space-y-8">
      {/* Persona Profile Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-brand-900 rounded-2xl shadow-xl overflow-hidden text-white">
        <div className="flex flex-col md:flex-row items-center p-8 gap-8">
          
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 flex items-center justify-center">
              {personaImage ? (
                <img src={personaImage} alt={data.personaTitle} className="w-full h-full object-cover" />
              ) : (
                <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              )}
            </div>
            {/* Status Badge */}
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-indigo-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
              {data.billMonth} Profile
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="space-y-1">
              <h3 className="text-brand-200 font-medium tracking-wider text-sm uppercase">Energy Persona</h3>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{data.personaTitle}</h2>
            </div>
            
            <p className="text-indigo-100 text-lg leading-relaxed font-light">
              "{data.personaDescription}"
            </p>

            <div className="pt-4 flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                <p className="text-xs text-indigo-200 uppercase">Amount Due</p>
                <p className="font-bold text-xl">${data.amountDue}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
                 <p className="text-xs text-indigo-200 uppercase">Usage Change</p>
                 <p className={`font-bold text-xl ${data.monthlyComparison.usageCurrent < data.monthlyComparison.usagePrevious ? 'text-green-300' : 'text-yellow-300'}`}>
                   {data.monthlyComparison.usageCurrent < data.monthlyComparison.usagePrevious ? '↓' : '↑'} 
                   {Math.abs(Math.round(((data.monthlyComparison.usageCurrent - data.monthlyComparison.usagePrevious) / data.monthlyComparison.usagePrevious) * 100))}%
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Tip Visualization Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Visualize Your Savings</h3>
        </div>

        <div className="p-6">
          {/* Image Display Area */}
          <div className="w-full bg-slate-100 rounded-lg min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden border border-slate-200 mb-4 group">
             {collageImage ? (
               <img src={collageImage} alt="Energy Savings Visualization" className="w-full h-full object-contain animate-fade-in" />
             ) : (
               <div className="text-center p-8 max-w-md w-full">
                 <div className="relative w-full h-64 rounded-lg overflow-hidden bg-slate-200 flex items-center justify-center">
                    {isGeneratingCollage ? (
                       <div className="flex flex-col items-center gap-4">
                          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                          <p className="text-brand-600 font-medium animate-pulse">Generating visualization...</p>
                          <p className="text-xs text-slate-500">Creating a {data.energyTip.toLowerCase().includes('cooking') || data.energyTip.toLowerCase().includes('microwave') ? 'kitchen' : 'room'} view in blueprint style</p>
                       </div>
                    ) : (
                      <img src={DEFAULT_BASE_PHOTO_URL} alt="Base" className="w-full h-full object-cover opacity-50 grayscale" />
                    )}
                 </div>
               </div>
             )}
          </div>
          
          {collageImage && (
             <div className="flex justify-end">
                <a 
                  href={collageImage} 
                  download="energy-savings-plan.png"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  Download Plan
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </a>
             </div>
          )}
        </div>
      </div>

      {/* JSON Display Section */}
      <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-800">
        <div className="px-4 py-3 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span className="ml-2 text-slate-400 font-mono text-xs">extracted_data.json</span>
          </div>
          <button 
            onClick={handleCopy}
            className={`
              text-xs font-medium px-3 py-1.5 rounded-md transition-all duration-200
              ${copied 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600'}
            `}
          >
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
        </div>
        <div className="relative group">
           <pre className="p-6 text-sm font-mono text-blue-100 overflow-x-auto whitespace-pre max-h-[80vh]">
            {jsonString}
          </pre>
        </div>
      </div>
      <div className="text-center text-sm text-slate-500">
        Data extracted from {data.billMonth} statement for Account {data.accountNumber}
      </div>
    </div>
  );
};

export default BillDisplay;