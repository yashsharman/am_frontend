import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
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

  return (
    <Card className="text-center max-w-sm mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-center gap-2">
          <CardTitle className="text-base">{registration.attendee_name}</CardTitle>
          <Badge variant={pass.pass_type === 'exclusive' ? 'default' : 'secondary'}>
            {pass.pass_type === 'exclusive' ? '⭐ Exclusive' : '🎫 One Day'}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 font-mono">{registration.registration_id}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div
          ref={qrRef}
          className="flex justify-center p-4 bg-white border-2 border-gray-100 rounded-xl inline-block mx-auto"
        >
          <QRCodeSVG
            value={pass.qr_token}
            size={180}
            level="M"
            includeMargin
          />
        </div>

        {/* Pass details */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>QR Token: <span className="font-mono text-gray-700">{pass.qr_token.slice(0, 16)}...</span></p>
          {pass.pass_type === 'exclusive' && (
            <p>Credits: <span className="font-bold text-indigo-700">{pass.remaining_credits} remaining</span></p>
          )}
          <p className={pass.is_active ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {pass.is_active ? '✓ Active' : '✗ Inactive'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={downloadQR}>
            <Download className="h-4 w-4 mr-1" />
            Download QR
          </Button>
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.share({ title: `Pass for ${registration.attendee_name}`, text: `QR Token: ${pass.qr_token}` });
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
