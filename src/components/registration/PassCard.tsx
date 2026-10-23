import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Pass, Registration } from '../../types';

interface PassCardProps {
  pass: Pass;
  registration: Registration;
}

export function PassCard({ pass, registration }: PassCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 400;
      ctx?.drawImage(img, 0, 0, 400, 400);
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `pass-${registration.registration_id}.png`;
      link.href = url;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const isExclusive = pass.pass_type === 'exclusive';

  return (
    <div className="bg-white border-2 border-neo-black rounded-xl p-5 shadow-brutal text-center max-w-sm mx-auto space-y-4">
      <div>
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-lg font-black uppercase tracking-tight text-neo-black">
            {registration.attendee_name}
          </h3>
          <Badge variant={isExclusive ? 'warning' : 'secondary'} className="text-[10px]">
            {isExclusive ? '⭐ Exclusive' : '🎫 One Day'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 font-mono font-bold mt-1">
          {registration.registration_id}
        </p>
      </div>

      {/* QR Code Container */}
      <div
        ref={qrRef}
        className="flex justify-center p-3 bg-white border-2 border-neo-black rounded-xl inline-block mx-auto shadow-brutal-sm"
      >
        <QRCodeSVG
          value={pass.qr_token}
          size={180}
          level="M"
          includeMargin
        />
      </div>

      {/* Pass details */}
      <div className="text-xs font-bold text-gray-700 space-y-1 bg-neo-bg p-2.5 rounded-lg border-2 border-neo-black">
        <p>
          Token: <span className="font-mono text-neo-purple">{pass.qr_token.slice(0, 16)}...</span>
        </p>
        {isExclusive && (
          <p>
            Credits:{' '}
            <span className="font-black text-neo-purple">{pass.remaining_credits} remaining</span>
          </p>
        )}
        <p className={pass.is_active ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}>
          {pass.is_active ? '✓ Valid & Active' : '✗ Inactive'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={downloadQR}
          className="flex-1 h-10 px-3 rounded-lg bg-neo-yellow text-neo-black border-2 border-neo-black shadow-brutal font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 hover:bg-amber-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          Download QR
        </button>
        {navigator.share && (
          <button
            onClick={() => {
              navigator.share({
                title: `Pass for ${registration.attendee_name}`,
                text: `QR Token: ${pass.qr_token}`,
              });
            }}
            className="w-10 h-10 rounded-lg bg-white text-neo-black border-2 border-neo-black shadow-brutal flex items-center justify-center hover:bg-neo-bg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Share2 className="h-4 w-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
