import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Pass, Registration } from '../../types';
import aftermilesLogo from '../../assets/aftermiles.jpg';

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
    if (!ctx) return;

    // Card dimensions
    const width = 640;
    const height = 960;
    canvas.width = width;
    canvas.height = height;

    // 1. Background fill (Dark theme)
    ctx.fillStyle = '#0e0d15';
    ctx.fillRect(0, 0, width, height);

    // Subtle background card container
    const margin = 24;
    ctx.fillStyle = '#171622';
    ctx.beginPath();
    ctx.roundRect(margin, margin, width - margin * 2, height - margin * 2, 28);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.stroke();

    // 2. Load Aftermiles Logo
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';

    const drawCardDetails = (qrImage: HTMLImageElement) => {
      let currentY = 70;

      // Draw Logo
      const logoSize = 110;
      const logoX = (width - logoSize) / 2;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, currentY, logoSize, logoSize, 24);
      ctx.clip();
      try {
        ctx.drawImage(logoImg, logoX, currentY, logoSize, logoSize);
      } catch {
        // fallback placeholder
        ctx.fillStyle = '#4f46e5';
        ctx.fillRect(logoX, currentY, logoSize, logoSize);
      }
      ctx.restore();

      // Logo brutalist border
      ctx.lineWidth = 3;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.beginPath();
      ctx.roundRect(logoX, currentY, logoSize, logoSize, 24);
      ctx.stroke();

      currentY += logoSize + 26;

      // Brand Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 28px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '1px';
      ctx.fillText('AFTERMILES', width / 2, currentY);

      currentY += 28;

      // Tagline: RUN, COFFEE, MUSIC.
      ctx.fillStyle = '#d4ff32'; // Neo-yellow
      ctx.font = '900 14px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('RUN, COFFEE, MUSIC.', width / 2, currentY);

      currentY += 36;

      // Attendee Name Box
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.letterSpacing = '0.5px';
      ctx.fillText(registration.attendee_name, width / 2, currentY);

      currentY += 24;

      // Registration ID & Pass Type Tag
      ctx.fillStyle = '#9ca3af';
      ctx.font = '700 13px monospace';
      ctx.letterSpacing = '1.5px';
      ctx.fillText(registration.registration_id, width / 2, currentY);

      currentY += 32;

      // White QR Canvas Container
      const qrBoxSize = 340;
      const qrBoxX = (width - qrBoxSize) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(qrBoxX, currentY, qrBoxSize, qrBoxSize, 24);
      ctx.fill();

      // Brutalist drop shadow / border around QR box
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Draw QR Code
      const qrPadding = 20;
      ctx.drawImage(
        qrImage,
        qrBoxX + qrPadding,
        currentY + qrPadding,
        qrBoxSize - qrPadding * 2,
        qrBoxSize - qrPadding * 2
      );

      currentY += qrBoxSize + 45;

      // Pass Type Pill
      const passText = pass.pass_type === 'exclusive' ? 'EXCLUSIVE PASS • 3 CREDITS' : 'ONE-DAY PASS';
      ctx.fillStyle = pass.pass_type === 'exclusive' ? '#d4ff32' : '#ffffff';
      ctx.font = '900 12px "Plus Jakarta Sans", system-ui, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(passText, width / 2, currentY);

      // Trigger Download
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `aftermiles-pass-${registration.registration_id}.png`;
      link.href = url;
      link.click();
    };

    logoImg.onload = () => {
      const qrImg = new Image();
      qrImg.onload = () => {
        drawCardDetails(qrImg);
      };
      qrImg.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    logoImg.onerror = () => {
      const qrImg = new Image();
      qrImg.onload = () => {
        drawCardDetails(qrImg);
      };
      qrImg.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    logoImg.src = aftermilesLogo;
  };

  const isExclusive = pass.pass_type === 'exclusive';

  return (
    <div className="bg-[#171622] border-2 border-white/15 rounded-2xl p-5 sm:p-6 shadow-brutal text-center max-w-sm mx-auto space-y-4 text-white">
      {/* Brand Header with Logo & Tagline */}
      <div className="flex flex-col items-center">
        <img
          src={aftermilesLogo}
          alt="Aftermiles"
          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-brutal-sm mb-2.5"
        />
        <h2 className="text-lg font-black uppercase tracking-tight text-white">
          Aftermiles
        </h2>
        <p className="text-[11px] font-black uppercase tracking-widest text-neo-yellow mt-0.5">
          RUN, COFFEE, MUSIC.
        </p>
      </div>

      {/* Attendee Name & Pass Tier */}
      <div className="pt-2 border-t border-white/10">
        <div className="flex items-center justify-center gap-2">
          <h3 className="text-xl font-black uppercase tracking-tight text-white">
            {registration.attendee_name}
          </h3>
          <Badge variant={isExclusive ? 'warning' : 'secondary'} className="text-[10px]">
            {isExclusive ? '⭐ Exclusive' : '🎫 One Day'}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 font-mono font-bold mt-0.5">
          {registration.registration_id}
        </p>
      </div>

      {/* QR Code Container: high contrast white for physical scanner readability */}
      <div
        ref={qrRef}
        className="flex justify-center p-3.5 bg-white border-2 border-white rounded-2xl inline-block mx-auto shadow-brutal-sm"
      >
        <QRCodeSVG
          value={pass.qr_token}
          size={190}
          level="M"
          includeMargin
        />
      </div>

      {/* Pass details */}
      <div className="text-xs font-bold text-gray-300 space-y-1 bg-[#0e0d15] p-2.5 rounded-xl border border-white/15">
        <p>
          Token: <span className="font-mono text-neo-lime">{pass.qr_token.slice(0, 16)}...</span>
        </p>
        {isExclusive && (
          <p>
            Credits:{' '}
            <span className="font-black text-neo-yellow">{pass.remaining_credits} remaining</span>
          </p>
        )}
        <p className={pass.is_active ? 'text-neo-lime font-black' : 'text-neo-peach font-black'}>
          {pass.is_active ? '✓ Valid & Active' : '✗ Inactive'}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={downloadQR}
          className="flex-1 h-11 px-3 rounded-xl bg-neo-yellow text-neo-black border-2 border-neo-black shadow-brutal font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-300 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          <Download className="h-4 w-4 stroke-[2.5]" />
          Download Pass Card
        </button>
        {navigator.share && (
          <button
            onClick={() => {
              navigator.share({
                title: `Pass for ${registration.attendee_name}`,
                text: `Aftermiles Pass - ${registration.attendee_name} (${registration.registration_id})`,
              });
            }}
            className="w-11 h-11 rounded-xl bg-[#0e0d15] text-white border-2 border-white/20 shadow-brutal flex items-center justify-center hover:bg-white/10 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            title="Share Pass"
          >
            <Share2 className="h-4 w-4 stroke-[2.5]" />
          </button>
        )}
      </div>
    </div>
  );
}
