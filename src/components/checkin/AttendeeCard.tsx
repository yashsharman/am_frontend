import { User, Phone, Mail, CreditCard, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Registration } from '../../types';
import { formatDate, formatPhone, formatPassType } from '../../utils/format';

interface AttendeeCardProps {
  registration: Registration;
}

export function AttendeeCard({ registration }: AttendeeCardProps) {
  const { pass } = registration;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            {registration.attendee_name}
          </div>
          <span className="text-xs text-gray-400 font-mono">{registration.registration_id}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <Phone className="h-3.5 w-3.5" />
          <span>{formatPhone(registration.phone)}</span>
        </div>
        {registration.email && (
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="h-3.5 w-3.5" />
            <span>{registration.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(registration.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {pass && (
            <Badge variant={pass.pass_type === 'exclusive' ? 'default' : 'secondary'}>
              {formatPassType(pass.pass_type)}
            </Badge>
          )}
          {/* Payment badge commented out for now
          <Badge variant={paymentBadgeVariant}>
            {formatPaymentStatus(registration.payment_status)}
          </Badge>
          */}
          {pass && pass.pass_type === 'exclusive' && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <CreditCard className="h-3 w-3" />
              <span>{pass.remaining_credits} credits left</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
