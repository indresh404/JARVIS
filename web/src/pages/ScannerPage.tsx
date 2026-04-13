import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, ArrowLeft, Keyboard } from 'lucide-react';

interface ScannerPageProps {
  onScan: (id: string) => void;
  onBack: () => void;
}

export const ScannerPage: React.FC<ScannerPageProps> = ({ onScan, onBack }) => {
  const [manualId, setManualId] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScan(decodedText);
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner", err));
    };
  }, [onScan]);

  return (
    <div className="max-w-md mx-auto h-full flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <QrCode size={32} />
        </div>
        <h2 className="text-2xl font-bold">Scan Patient QR</h2>
        <p className="text-text-muted text-sm">Position the patient's QR code within the frame to automatically view their records.</p>
      </div>

      <div id="reader" className="w-full rounded-2xl overflow-hidden border-2 border-brand-primary/20 shadow-xl bg-white" />

      <div className="w-full space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-brand-surface px-2 text-text-muted font-bold">Or enter manually</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Patient ID or Family Code"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          <button 
            onClick={() => onScan(manualId)}
            className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-colors"
          >
            Go
          </button>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors font-bold text-sm"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>
    </div>
  );
};
