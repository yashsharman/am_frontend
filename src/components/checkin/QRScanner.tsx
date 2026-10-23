import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface QRScannerProps {
  onScan: (qrToken: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function QRScanner({ onScan, isProcessing = false, disabled = false }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerElementId = 'qr-reader';

  // Refs to avoid stale closures in html5-qrcode callbacks
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  const isProcessingRef = useRef(isProcessing);
  isProcessingRef.current = isProcessing;

  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  // Synchronous lock to immediately ignore frames once a QR is captured
  const isLockedRef = useRef(false);
  const lastScannedRef = useRef<{ token: string; time: number } | null>(null);

  // Resume / Unlock when processing finishes
  useEffect(() => {
    if (!isProcessing && !disabled) {
      const timer = setTimeout(() => {
        isLockedRef.current = false;
        try {
          if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.resume();
          }
        } catch {
          // ignore resume errors
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, disabled]);

  const handleDecoded = useCallback((decodedText: string) => {
    const cleanToken = decodedText.trim();
    if (!cleanToken) return;

    if (isLockedRef.current || isProcessingRef.current || disabledRef.current) {
      return;
    }

    const now = Date.now();
    if (
      lastScannedRef.current &&
      lastScannedRef.current.token === cleanToken &&
      now - lastScannedRef.current.time < 4000
    ) {
      return;
    }

    isLockedRef.current = true;
    lastScannedRef.current = { token: cleanToken, time: now };

    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.pause(true);
      }
    } catch {
      // ignore pause error
    }

    onScanRef.current(cleanToken);
  }, []);

  const startScanner = async () => {
    if (scannerRef.current || disabledRef.current) return;
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode(scannerElementId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        handleDecoded,
        () => {
          // QR not found in current frame
        }
      );
      setIsStarted(true);
    } catch (err) {
      const errMsg = String(err);
      if (errMsg.includes('Permission') || errMsg.includes('NotAllowed')) {
        setPermissionDenied(true);
      } else {
        setError('Failed to start camera. Please verify device permissions.');
      }
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
      setIsStarted(false);
    }
  };

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white border-2 border-neo-black rounded-xl shadow-brutal min-h-[300px] gap-4">
        <CameraOff className="h-14 w-14 text-neo-peach stroke-[2.5]" />
        <div className="text-center">
          <p className="text-base font-black uppercase text-neo-black">Camera Access Denied</p>
          <p className="text-xs font-bold text-gray-500 mt-1">
            Please allow camera access in your browser settings to scan attendee passes.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setPermissionDenied(false);
            startScanner();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2 stroke-[2.5]" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Scanner container */}
      <div className="relative bg-neo-black rounded-xl overflow-hidden border-2 border-neo-black shadow-brutal">
        <div
          id={scannerElementId}
          className={cn('w-full', isProcessing && 'opacity-50')}
          style={{ minHeight: '300px' }}
        />

        {/* Tactical Corner Guides Overlay */}
        {isStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              {/* Top-left corner */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-neo-lime rounded-tl-md" />
              {/* Top-right corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-neo-lime rounded-tr-md" />
              {/* Bottom-left corner */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-neo-lime rounded-bl-md" />
              {/* Bottom-right corner */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-neo-lime rounded-br-md" />

              {/* Scan line animation */}
              {!isProcessing && (
                <div className="absolute left-2 right-2 h-0.5 bg-neo-lime shadow-[0_0_8px_#44f1a6] animate-pulse top-1/2" />
              )}
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-neo-black/80 flex items-center justify-center">
            <div className="text-white text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-neo-lime stroke-[2.5]" />
              <p className="text-xs font-black uppercase tracking-wider text-neo-lime">
                Verifying Gate Pass...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isStarted && (
          <div className="absolute inset-0 bg-neo-black flex flex-col items-center justify-center gap-3 min-h-[300px] p-4">
            <Camera className="h-10 w-10 text-neo-peach stroke-[2.5]" />
            <p className="text-white font-bold text-xs text-center">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setError(null);
                startScanner();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1 stroke-[2.5]" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Status indicator bar */}
      <div className="mt-2.5 flex items-center justify-center gap-2">
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full border border-neo-black',
            isProcessing
              ? 'bg-neo-peach animate-ping'
              : isStarted
              ? 'bg-neo-lime animate-pulse'
              : 'bg-gray-400'
          )}
        />
        <span className="text-[11px] font-black uppercase tracking-wider text-neo-black">
          {isProcessing
            ? 'Verifying Pass with Server...'
            : isStarted
            ? 'Camera Ready — Aim at Attendee QR'
            : 'Initializing Gate Scanner...'}
        </span>
      </div>
    </div>
  );
}
