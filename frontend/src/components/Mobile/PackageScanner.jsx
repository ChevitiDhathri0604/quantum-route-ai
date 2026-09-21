import React, { useState } from 'react';
import { Camera, CheckCircle2, QrCode, X } from 'lucide-react';

export default function PackageScanner({ onConfirmDelivery, onClose }) {
  const [scannedPackage, setScannedPackage] = useState(null);
  const [scanning, setScanning] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScannedPackage({
        package_id: 'PKG-1024',
        delivery_id: 'D03',
        customer: 'Inorbit Mall - Madhapur',
        weight: '25 kg',
        priority: 'Medium',
        address: 'Madhapur Logistics Node, Hyderabad'
      });
    }, 1200);
  };

  const handleConfirm = () => {
    if (scannedPackage && onConfirmDelivery) {
      onConfirmDelivery(scannedPackage.delivery_id);
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <QrCode className="w-6 h-6 text-cyan-400" />
          <h3 className="text-base font-bold text-slate-100">Package Verification Camera</h3>
        </div>

        {/* Camera Viewport Simulation */}
        <div className="relative w-full h-48 bg-slate-950 rounded-xl border-2 border-dashed border-cyan-500/50 flex flex-col items-center justify-center overflow-hidden">
          {scanning ? (
            <div className="space-y-2 text-center">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-xs text-cyan-300 font-mono">Scanning Barcode / QR Code...</div>
            </div>
          ) : scannedPackage ? (
            <div className="p-4 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-slate-100">Scanned: {scannedPackage.package_id}</div>
              <div className="text-xs text-purple-300">Stop: {scannedPackage.delivery_id} ({scannedPackage.customer})</div>
            </div>
          ) : (
            <button
              onClick={simulateScan}
              className="flex flex-col items-center gap-2 text-slate-400 hover:text-cyan-300 transition"
            >
              <Camera className="w-10 h-10" />
              <span className="text-xs font-semibold">Tap to Scan Package Barcode</span>
            </button>
          )}
        </div>

        {/* Package Details */}
        {scannedPackage && (
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-400">
              <span>Customer:</span>
              <strong className="text-slate-200">{scannedPackage.customer}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Weight:</span>
              <strong className="text-slate-200">{scannedPackage.weight}</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Status:</span>
              <strong className="text-cyan-400">Out for Delivery</strong>
            </div>
          </div>
        )}

        {/* Confirm Button */}
        {scannedPackage && (
          <button
            onClick={handleConfirm}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
          >
            <CheckCircle2 className="w-4 h-4" /> Confirm Delivery
          </button>
        )}
      </div>
    </div>
  );
}
