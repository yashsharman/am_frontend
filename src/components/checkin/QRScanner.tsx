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
          // If scanner was paused, resume it
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

    // Immediately reject if locked, processing, or disabled
    if (isLockedRef.current || isProcessingRef.current || disabledRef.current) {
      return;
    }

    const now = Date.now();
    // Prevent scanning the exact same token within 4 seconds
    if (
      lastScannedRef.current &&
      lastScannedRef.current.token === cleanToken &&
      now - lastScannedRef.current.time < 4000
    ) {
      return;
    }

    // Synchronously lock IMMEDIATELY so subsequent 100ms frames are discarded
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
          // QR not found in current frame — silent
        }
      );
      setIsStarted(true);
    } catch (err) {
      const errMsg = String(err);
      if (errMsg.includes('Permission') || errMsg.includes('NotAllowed')) {
        setPermissionDenied(true);
      } else {
        setError('Failed to start camera. Please try again.');
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
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-xl min-h-[300px] gap-4">
        <CameraOff className="h-16 w-16 text-gray-400" />
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700">Camera Access Denied</p>
          <p className="text-sm text-gray-500 mt-1">
            Please allow camera access in your browser settings and refresh the page.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setPermissionDenied(false);
            startScanner();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Scanner container */}
      <div className="relative bg-black rounded-xl overflow-hidden shadow-inner">
        <div
          id={scannerElementId}
          className={cn('w-full', isProcessing && 'opacity-50')}
          style={{ minHeight: '300px' }}
        />

        {/* Corner guides overlay */}
        {isStarted && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-64">
              {/* Top-left corner */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-400 rounded-tl-sm" />
              {/* Top-right corner */}
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-400 rounded-tr-sm" />
              {/* Bottom-left corner */}
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-400 rounded-bl-sm" />
              {/* Bottom-right corner */}
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-400 rounded-br-sm" />

              {/* Scan line animation */}
              {!isProcessing && (
                <div className="absolute left-2 right-2 h-0.5 bg-indigo-400 animate-bounce top-1/2" />
              )}
            </div>
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="text-white text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm font-medium">Verifying pass...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isStarted && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center gap-3 min-h-[300px]">
            <Camera className="h-12 w-12 text-gray-400" />
            <p className="text-gray-300 text-sm text-center px-4">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="text-white border-gray-600 hover:bg-gray-800"
              onClick={() => {
                setError(null);
                startScanner();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <div
          className={cn(
            'h-2 w-2 rounded-full',
            isProcessing ? 'bg-amber-400 animate-ping' : isStarted ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )}
        />
        <span className="text-xs text-gray-500">
          {isProcessing
            ? 'Verifying pass with backend...'
            : isStarted
            ? 'Ready — aim camera at QR code'
            : 'Initializing camera...'}
        </span>
      </div>
    </div>
  );
}
