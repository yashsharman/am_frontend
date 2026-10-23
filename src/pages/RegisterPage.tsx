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
    <div className="max-w-xl mx-auto space-y-6 text-white">
      {/* Header with Title and Import Action */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
            {createdRegistration ? 'Pass Generated' : 'Enroll Attendee'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-400 mt-0.5">
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
            className="text-xs sm:text-sm"
          >
            <Upload className="h-4 w-4 mr-1.5 stroke-[2.5]" />
            Import CSV
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      {createdRegistration && createdRegistration.pass ? (
        <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#064e3b]/30 border-2 border-neo-lime p-3 rounded-xl flex items-center gap-2 text-neo-lime text-xs font-black uppercase tracking-wider">
            <CheckCircle className="h-5 w-5 stroke-[3] shrink-0" />
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
              <ArrowLeft className="h-4 w-4 mr-2 stroke-[2.5]" />
              Register Another Attendee
            </Button>
          </div>
        </div>
      ) : (
        <Card className="border-2 border-white/15 shadow-brutal bg-[#171622] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-white">
              <UserPlus className="h-4 w-4 text-neo-lime stroke-[2.5]" />
              Attendee Details
            </CardTitle>
            <CardDescription className="text-xs font-bold text-gray-400">
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
