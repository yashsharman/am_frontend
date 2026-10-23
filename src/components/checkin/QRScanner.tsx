import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../utils/cn';

interface QRScannerProps {
  onScan: (qrToken: string) => void;
  isProcessing?: boolean;
  disabled?: boolean;
}

export function QRScanner({ onScan, isProcessing = false, disabled = false }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const isStartingRef = useRef(false);

  const [isStarted, setIsStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [insecureContext, setInsecureContext] = useState(false);
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

  const cleanupContainer = () => {
    const container = document.getElementById(scannerElementId);
    if (container) {
      const videos = container.querySelectorAll('video');
      videos.forEach((video) => {
        const stream = video.srcObject as MediaStream | null;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        video.srcObject = null;
      });
      container.innerHTML = '';
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
    cleanupContainer();
  };

  const startScanner = async () => {
    if (!isMountedRef.current || isStartingRef.current || scannerRef.current || disabledRef.current) return;
    isStartingRef.current = true;
    setError(null);
    setPermissionDenied(false);
    setInsecureContext(false);

    // Check secure context (Chrome on Android strictly forbids camera on plain HTTP IP addresses)
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    if (typeof window !== 'undefined' && !window.isSecureContext && !isLocalhost) {
      setInsecureContext(true);
      setError(
        'Insecure Connection (HTTP): Mobile browsers require HTTPS (or localhost) to grant camera access. Please open with https:// or configure browser flags.'
      );
      isStartingRef.current = false;
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported or was blocked by browser security (requires HTTPS).');
      isStartingRef.current = false;
      return;
    }

    cleanupContainer();

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
          // QR not found in frame
        }
      );

      // If unmounted while start was resolving, stop immediately
      if (!isMountedRef.current) {
        try {
          if (html5QrCode.isScanning) {
            await html5QrCode.stop();
          }
          html5QrCode.clear();
        } catch {
          // ignore
        }
        cleanupContainer();
        scannerRef.current = null;
        return;
      }

      // Safeguard: Ensure no duplicate video tags exist in the scanner container
      const container = document.getElementById(scannerElementId);
      if (container) {
        const videos = container.querySelectorAll('video');
        if (videos.length > 1) {
          for (let i = 1; i < videos.length; i++) {
            const stream = videos[i].srcObject as MediaStream | null;
            if (stream) {
              stream.getTracks().forEach((track) => track.stop());
            }
            videos[i].remove();
          }
        }
      }

      setIsStarted(true);
    } catch (err: unknown) {
      const errMsg = String(err);
      if (
        errMsg.includes('Permission') ||
        errMsg.includes('NotAllowed') ||
        errMsg.includes('PermissionDeniedError')
      ) {
        setPermissionDenied(true);
      } else {
        setError('Failed to start camera. Please verify device permissions or use HTTPS.');
      }
      scannerRef.current = null;
    } finally {
      isStartingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    startScanner();
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (insecureContext) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-[#171622] border-2 border-white/20 rounded-xl shadow-brutal min-h-[300px] gap-3 text-white text-center">
        <ShieldAlert className="h-12 w-12 text-neo-yellow stroke-[2.5]" />
        <div>
          <p className="text-sm font-black uppercase tracking-tight text-white">
            HTTPS Required for Mobile Camera
          </p>
          <p className="text-xs font-bold text-gray-300 mt-1 max-w-sm">
            Mobile Chrome blocks camera access over plain HTTP (e.g. <code className="text-neo-yellow font-mono text-[11px]">{window.location.origin}</code>).
          </p>
          <div className="mt-3 p-3 bg-[#0e0d15] rounded-lg border border-white/10 text-left text-[11px] text-gray-300 space-y-1">
            <p className="font-black text-white uppercase text-[10px] tracking-wider">How to enable on mobile:</p>
            <p>1. Open with <strong className="text-neo-lime">https://</strong> instead of http:// (Vite now has SSL enabled).</p>
            <p>2. Or in Chrome on phone, go to <span className="font-mono text-neo-yellow">chrome://flags/#unsafely-treat-insecure-origin-as-secure</span>, add your IP, and enable.</p>
          </div>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            if (window.location.protocol === 'http:') {
              window.location.href = window.location.href.replace('http:', 'https:');
            } else {
              startScanner();
            }
          }}
        >
          <RefreshCw className="h-4 w-4 mr-1.5 stroke-[2.5]" />
          Switch to HTTPS
        </Button>
      </div>
    );
  }

  if (permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#171622] border-2 border-white/20 rounded-xl shadow-brutal min-h-[300px] gap-4 text-white">
        <CameraOff className="h-14 w-14 text-neo-peach stroke-[2.5]" />
        <div className="text-center">
          <p className="text-base font-black uppercase text-white">Camera Access Denied</p>
          <p className="text-xs font-bold text-gray-400 mt-1">
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
      <div className="relative bg-[#0e0d15] rounded-xl overflow-hidden border-2 border-white/20 shadow-brutal min-h-[300px] flex items-center justify-center">
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
          <div className="absolute inset-0 bg-[#0e0d15]/85 flex items-center justify-center">
            <div className="text-white text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-neo-lime stroke-[2.5]" />
              <p className="text-xs font-black uppercase tracking-wider text-neo-lime">
                Verifying Gate Pass...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isStarted && !insecureContext && (
          <div className="absolute inset-0 bg-[#0e0d15] flex flex-col items-center justify-center gap-3 min-h-[300px] p-4 text-white">
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
            'h-2.5 w-2.5 rounded-full border border-white/20',
            isProcessing
              ? 'bg-neo-peach animate-ping'
              : isStarted
              ? 'bg-neo-lime animate-pulse'
              : 'bg-gray-400'
          )}
        />
        <span className="text-[11px] font-black uppercase tracking-wider text-gray-300">
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
