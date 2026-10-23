import { useState } from 'react';
import { Upload, UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import { RegistrationForm } from '../components/registration/RegistrationForm';
import { PassCard } from '../components/registration/PassCard';
import { ImportModal } from '../components/registration/ImportModal';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import type { Registration } from '../types';

export function RegisterPage() {
  const [createdRegistration, setCreatedRegistration] = useState<Registration | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header with Title and Import Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {createdRegistration ? 'Pass Generated' : 'Register Attendee'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            {createdRegistration
              ? 'Share or download the digital pass QR'
              : 'Create single or exclusive event passes'}
          </p>
        </div>

        {!createdRegistration && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="border-gray-300 text-xs sm:text-sm"
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Import CSV
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {createdRegistration && createdRegistration.pass ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2 text-emerald-800 text-sm font-medium">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            Registration created successfully! Pass QR is ready.
          </div>

          <PassCard
            registration={createdRegistration}
            pass={createdRegistration.pass}
          />

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setCreatedRegistration(null)}
              className="w-full max-w-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Register Another Attendee
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-600" />
              Attendee Details
            </CardTitle>
            <CardDescription className="text-xs">
              Exclusive passes include 3 event credits. One-day passes are bound to a specific event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegistrationForm
              onSuccess={(reg) => {
                setCreatedRegistration(reg);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Bulk CSV / Excel Import Modal */}
      <ImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
}
