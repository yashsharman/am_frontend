import { useRef, useState } from 'react';
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { parseImportFile } from '../../utils/export';
import { registrationsApi } from '../../api/registrations';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  defaultPassType?: 'one_day' | 'exclusive';
  defaultEventId?: string;
}

export function ImportModal({ open, onClose, defaultPassType = 'one_day', defaultEventId }: ImportModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    try {
      const rows = await parseImportFile(f);
      setPreview(rows.slice(0, 5) as Array<Record<string, string>>);
    } catch {
      toast.error('Failed to parse file. Please use CSV or Excel format.');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const rows = await parseImportFile(file);
      const records = rows.map((r) => ({
        ...r,
        pass_type: defaultPassType,
        event_id: defaultEventId,
        payment_status: 'verified' as const,
      }));
      const res = await registrationsApi.bulkImport(records);
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      if (res.created > 0) {
        toast.success(`Imported ${res.created} registrations`);
      }
    } catch {
      toast.error('Import failed. Please check file format.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-[#171622] text-white border-2 border-white/20 shadow-brutal-lg">
        <DialogHeader>
          <DialogTitle className="text-white font-black uppercase tracking-tight">
            Import Registrations
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template info */}
          <div className="bg-[#0e0d15] border-2 border-white/15 rounded-xl p-3.5 text-xs text-gray-300">
            <p className="font-black uppercase text-neo-lime mb-1">Required columns:</p>
            <p className="font-mono text-[11px] text-gray-400">
              Name, Phone, Email (optional), Payment Ref (optional), Notes (optional)
            </p>
          </div>

          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-neo-lime hover:bg-white/5 transition-colors bg-[#0e0d15]"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-neo-purple mx-auto mb-2 stroke-[2.5]" />
            <p className="text-sm font-black uppercase text-white">
              {file ? file.name : 'Drop CSV / Excel file here or click to browse'}
            </p>
            <p className="text-xs font-bold text-gray-400 mt-1">Supports .csv, .xlsx, .xls</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-black uppercase text-gray-400 mb-2">Preview (first 5 rows):</p>
              <div className="overflow-x-auto rounded-xl border-2 border-white/15 bg-[#0e0d15]">
                <table className="text-xs w-full">
                  <thead className="bg-[#1f1d2e] border-b border-white/10 text-gray-300">
                    <tr>
                      {Object.keys(preview[0]).map((k) => (
                        <th key={k} className="px-3 py-2 text-left font-black uppercase text-[10px]">{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-gray-300">
                    {preview.map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 font-bold truncate max-w-[120px]">{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-xl p-3.5 border-2 ${result.errors.length === 0 ? 'bg-[#064e3b]/30 border-neo-lime text-neo-lime' : 'bg-amber-950/40 border-neo-yellow text-neo-yellow'}`}>
              <div className="flex items-center gap-2">
                {result.errors.length === 0 ? (
                  <CheckCircle className="h-4 w-4 stroke-[3]" />
                ) : (
                  <AlertCircle className="h-4 w-4 stroke-[3]" />
                )}
                <p className="text-xs font-black uppercase">
                  {result.created} registrations imported
                  {result.errors.length > 0 && `, ${result.errors.length} errors`}
                </p>
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-2 text-xs text-rose-300 list-disc list-inside font-bold">
                  {result.errors.slice(0, 3).map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-1" />Close
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isImporting}
            className="bg-neo-purple text-white border-2 border-white/20 shadow-brutal hover:bg-indigo-600"
          >
            {isImporting ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Importing...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2 stroke-[2.5]" />Import</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
