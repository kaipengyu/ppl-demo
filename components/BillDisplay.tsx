import React, { useState } from 'react';
import { BillData } from '../types';

interface BillDisplayProps {
  data: BillData;
}

const BillDisplay: React.FC<BillDisplayProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
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
      <div className="mt-4 text-center text-sm text-slate-500">
        Data extracted from {data.billMonth} statement for Account {data.accountNumber}
      </div>
    </div>
  );
};

export default BillDisplay;
