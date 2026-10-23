import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Download,
  QrCode,
  User,
  Phone,
  Mail,
  X,
  Eye,
  Calendar,
  FileText,
  Tag,
} from "lucide-react";
import { registrationsApi } from "../api/registrations";
import { eventsApi } from "../api/events";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { PassCard } from "../components/registration/PassCard";
import { useExport } from "../hooks/useExport";
import { formatDate, formatPhone } from "../utils/format";
import type { Registration } from "../types";

export function AttendeesPage() {
  const [search, setSearch] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [passTypeFilter, setPassTypeFilter] = useState<string>("all");
  const [selectedPassReg, setSelectedPassReg] = useState<Registration | null>(
    null,
  );
  const [viewingReg, setViewingReg] = useState<Registration | null>(null);

  // Fetch events for filter dropdown
  const { data: events = [] } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
  });

  // Fetch registrations with active filters
  const { data, isLoading } = useQuery({
    queryKey: [
      "registrations",
      search,
      selectedEventId,
      paymentFilter,
      passTypeFilter,
    ],
    queryFn: () =>
      registrationsApi.list({
        search: search || undefined,
        event_id: selectedEventId === "all" ? undefined : selectedEventId,
        payment_status: paymentFilter === "all" ? undefined : paymentFilter,
        pass_type: passTypeFilter === "all" ? undefined : passTypeFilter,
      }),
  });

  const registrations = data?.results || [];

  const { exportCSV, isExporting } = useExport({
    event_id: selectedEventId === "all" ? undefined : selectedEventId,
    payment_status: paymentFilter === "all" ? undefined : paymentFilter,
    pass_type: passTypeFilter === "all" ? undefined : passTypeFilter,
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto w-full text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Attendee Directory
            </h1>
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              disabled={isExporting}
              className="self-start sm:self-auto ml-auto"
            >
              {isExporting ? "Exporting..." : "Export"}
              <Download className="h-4 w-4 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#171622] p-3.5 sm:p-4 rounded-xl border-2 border-white/15 shadow-brutal space-y-3 text-white">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 stroke-[2.5]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by attendee name, phone, or REG-ID..."
            className="pl-10 bg-[#0e0d15] text-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="text-xs font-black uppercase h-10 border-2 border-white/20 shadow-brutal-sm bg-[#0e0d15] text-white">
              <SelectValue placeholder="Events" />
            </SelectTrigger>
            <SelectContent className="border-2 border-white/20 shadow-brutal-lg rounded-xl bg-[#171622] text-white">
              <SelectItem value="all" className="font-bold text-xs uppercase">
                All Events
              </SelectItem>
              {events.map((e) => (
                <SelectItem
                  key={e.id}
                  value={e.id}
                  className="font-bold text-xs uppercase"
                >
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="text-xs font-black uppercase h-10 border-2 border-white/20 shadow-brutal-sm bg-[#0e0d15] text-white">
              <SelectValue placeholder="Payments" />
            </SelectTrigger>
            <SelectContent className="border-2 border-white/20 shadow-brutal-lg rounded-xl bg-[#171622] text-white">
              <SelectItem value="all" className="font-bold text-xs uppercase">
                All Payments
              </SelectItem>
              <SelectItem
                value="verified"
                className="font-bold text-xs uppercase"
              >
                Verified
              </SelectItem>
              <SelectItem
                value="pending"
                className="font-bold text-xs uppercase"
              >
                Pending
              </SelectItem>
              <SelectItem
                value="failed"
                className="font-bold text-xs uppercase"
              >
                Failed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={passTypeFilter} onValueChange={setPassTypeFilter}>
            <SelectTrigger className="text-xs font-black uppercase h-10 border-2 border-white/20 shadow-brutal-sm bg-[#0e0d15] text-white">
              <SelectValue placeholder="Pass Types" />
            </SelectTrigger>
            <SelectContent className="border-2 border-white/20 shadow-brutal-lg rounded-xl bg-[#171622] text-white">
              <SelectItem value="all" className="font-bold text-xs uppercase">
                All Pass Types
              </SelectItem>
              <SelectItem
                value="one_day"
                className="font-bold text-xs uppercase"
              >
                One-Day Pass
              </SelectItem>
              <SelectItem
                value="exclusive"
                className="font-bold text-xs uppercase"
              >
                Exclusive (3 Credits)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Attendees Display: Responsive (Cards on Mobile, Table on Desktop) */}
      {isLoading ? (
        <div className="text-center py-12 text-xs font-black uppercase text-gray-400">
          Loading attendees directory...
        </div>
      ) : registrations.length === 0 ? (
        <div className="bg-[#171622] rounded-xl border-2 border-white/15 shadow-brutal p-8 text-center text-white">
          <User className="h-10 w-10 text-gray-500 mx-auto mb-2" />
          <p className="text-base font-black uppercase text-white">
            No Attendees Found
          </p>
          <p className="text-xs font-bold text-gray-400 mt-1">
            Try adjusting your search query or filter tags.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (< lg screens) */}
          <div className="grid grid-cols-1 gap-3 lg:hidden">
            {registrations.map((reg) => {
              const pass = reg.pass;
              const isExclusive = pass?.pass_type === "exclusive";
              return (
                <div
                  key={reg.id}
                  className="bg-[#171622] p-4 rounded-xl border-2 border-white/15 shadow-brutal space-y-3 hover:border-white/30 transition-all text-white"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-white text-sm">
                        {reg.attendee_name}
                      </h3>
                      <p className="text-[11px] font-mono font-bold text-gray-400">
                        {reg.registration_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={isExclusive ? "warning" : "secondary"}
                        className="text-[10px] text-white"
                      >
                        {isExclusive ? "⭐ Exclusive" : "🎫 One Day"}
                      </Badge>
                      {isExclusive && pass && (
                        <span className="text-[11px] text-neo-yellow font-black">
                          {pass.remaining_credits} cr
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs font-bold text-gray-300 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-neo-lime stroke-[2.5]" />
                      <span>{formatPhone(reg.phone)}</span>
                    </div>
                    {reg.email && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400 stroke-[2.5]" />
                        <span className="truncate">{reg.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <Badge
                      variant={
                        reg.payment_status === "verified"
                          ? "success"
                          : reg.payment_status === "pending"
                            ? "warning"
                            : "destructive"
                      }
                      className="text-[10px] uppercase"
                    >
                      {reg.payment_status}
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      {pass && (
                        <button
                          className="h-8 px-2.5 rounded-md bg-neo-purple text-white border-2 border-white/20 shadow-brutal-sm text-xs font-black uppercase inline-flex items-center gap-1 hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                          onClick={() => setSelectedPassReg(reg)}
                          title="View Pass"
                        >
                          <QrCode className="h-3.5 w-3.5 stroke-[2.5]" />
                          Pass
                        </button>
                      )}
                      <button
                        className="h-8 px-2.5 rounded-md bg-[#0e0d15] border-2 border-white/20 shadow-brutal-sm inline-flex items-center gap-1 text-white hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-black uppercase"
                        onClick={() => setViewingReg(reg)}
                        title="View Attendee"
                      >
                        <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                        View
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= lg screens) */}
          <div className="hidden lg:block bg-[#171622] rounded-xl border-2 border-white/15 shadow-brutal overflow-hidden text-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1f1d2e] border-b-2 border-white/15 text-xs font-black text-gray-300 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Attendee</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Pass Tier</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Registered Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-white/10">
                {registrations.map((reg) => {
                  const pass = reg.pass;
                  const isExclusive = pass?.pass_type === "exclusive";
                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-black text-white">
                          {reg.attendee_name}
                        </div>
                        <div className="text-xs text-gray-400 font-mono font-bold">
                          {reg.registration_id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-gray-300">
                        <div>{formatPhone(reg.phone)}</div>
                        {reg.email && (
                          <div className="text-gray-400">{reg.email}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={isExclusive ? "warning" : "secondary"}
                          className="text-xs"
                        >
                          {isExclusive ? "⭐ Exclusive" : "🎫 One Day"}
                        </Badge>
                        {isExclusive && pass && (
                          <div className="text-xs text-neo-yellow mt-0.5 font-black">
                            {pass.remaining_credits} credits left
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant={
                            reg.payment_status === "verified"
                              ? "success"
                              : reg.payment_status === "pending"
                                ? "warning"
                                : "destructive"
                          }
                          className="text-xs"
                        >
                          {reg.payment_status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-gray-400">
                        {formatDate(reg.created_at)}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        {pass && (
                          <button
                            className="h-8 px-2.5 rounded-md bg-neo-purple text-white border-2 border-white/20 shadow-brutal-sm text-xs font-black uppercase inline-flex items-center gap-1 hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            onClick={() => setSelectedPassReg(reg)}
                            title="View Pass"
                          >
                            <QrCode className="h-3.5 w-3.5 stroke-[2.5]" />
                            Pass
                          </button>
                        )}
                        <button
                          className="h-8 px-2.5 rounded-md bg-[#0e0d15] border-2 border-white/20 shadow-brutal-sm inline-flex items-center gap-1 text-white hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none text-xs font-black uppercase"
                          onClick={() => setViewingReg(reg)}
                          title="View Attendee"
                        >
                          <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* QR Pass Viewing Modal */}
      {selectedPassReg && selectedPassReg.pass && (
        <Dialog
          open={Boolean(selectedPassReg)}
          onOpenChange={() => setSelectedPassReg(null)}
        >
          <DialogContent className="max-w-sm border-2 border-white/20 shadow-brutal-lg rounded-2xl bg-[#171622] text-white">
            <DialogHeader>
              <DialogTitle className="text-center font-black uppercase tracking-tight text-white">
                Attendee QR Pass
              </DialogTitle>
            </DialogHeader>
            <PassCard
              registration={selectedPassReg}
              pass={selectedPassReg.pass}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Attendee Modal - Shows Complete Attendee Profile & Details */}
      {viewingReg && (
        <Dialog
          open={Boolean(viewingReg)}
          onOpenChange={() => setViewingReg(null)}
        >
          <DialogContent className="max-w-lg border-2 border-white/20 shadow-brutal-lg rounded-2xl bg-[#171622] text-white p-5 sm:p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
            <DialogHeader className="pb-3 border-b-2 border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-neo-yellow text-neo-black border-2 border-neo-black shadow-brutal-sm flex items-center justify-center shrink-0">
                  <Eye className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <DialogTitle className="font-black text-lg uppercase tracking-tight text-white">
                    Attendee Details
                  </DialogTitle>
                  <p className="text-xs font-mono font-bold text-neo-lime">
                    {viewingReg.registration_id}
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 pt-3 text-sm">
              {/* Attendee Name & Contact Details */}
              <div className="p-3.5 rounded-xl bg-[#0e0d15] border-2 border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <User className="h-3 w-3 stroke-[2.5]" />
                  <span>Attendee Contact Info</span>
                </div>
                <div className="text-base font-black text-white">
                  {viewingReg.attendee_name}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold pt-1">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Phone className="h-3.5 w-3.5 text-neo-lime stroke-[2.5] shrink-0" />
                    <span>{formatPhone(viewingReg.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Mail className="h-3.5 w-3.5 text-neo-yellow stroke-[2.5] shrink-0" />
                    <span className="truncate">
                      {viewingReg.email || "No email provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pass Tier & Credit Details */}
              <div className="p-3.5 rounded-xl bg-[#0e0d15] border-2 border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                    <Tag className="h-3 w-3 stroke-[2.5]" />
                    <span>Pass & Access Tier</span>
                  </div>
                  {viewingReg.pass && (
                    <button
                      type="button"
                      onClick={() => setSelectedPassReg(viewingReg)}
                      className="text-xs font-black uppercase text-neo-yellow hover:underline flex items-center gap-1"
                    >
                      <QrCode className="h-3.5 w-3.5 stroke-[2.5]" />
                      View QR Pass
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant={
                      viewingReg.pass?.pass_type === "exclusive"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-xs font-black uppercase"
                  >
                    {viewingReg.pass?.pass_type === "exclusive"
                      ? "⭐ Exclusive Pass"
                      : "🎫 One-Day Pass"}
                  </Badge>

                  {viewingReg.pass ? (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                        viewingReg.pass.is_active
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                          : "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {viewingReg.pass.is_active ? "Active Pass" : "Inactive Pass"}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-500 italic">
                      No Pass Record Linked
                    </span>
                  )}
                </div>

                {viewingReg.pass && (
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-[#171622] border border-white/10">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        Total
                      </div>
                      <div className="text-sm font-black text-white">
                        {viewingReg.pass.total_credits}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#171622] border border-white/10">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        Used
                      </div>
                      <div className="text-sm font-black text-rose-400">
                        {viewingReg.pass.used_credits}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-[#171622] border border-white/10">
                      <div className="text-[10px] text-gray-400 font-bold uppercase">
                        Remaining
                      </div>
                      <div className="text-sm font-black text-neo-lime">
                        {viewingReg.pass.remaining_credits}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Event Allocation */}
              <div className="p-3.5 rounded-xl bg-[#0e0d15] border-2 border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <Calendar className="h-3 w-3 stroke-[2.5]" />
                  <span>Associated Event</span>
                </div>
                {(() => {
                  const event = events.find((e) => e.id === viewingReg.event_id);
                  if (event) {
                    return (
                      <div className="space-y-1 text-xs">
                        <div className="font-black text-white text-sm">
                          {event.name}
                        </div>
                        <div className="text-gray-300 font-bold">
                          📍 {event.venue || "Venue not specified"}
                        </div>
                        <div className="text-gray-400 font-bold">
                          📅 {formatDate(event.date)}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="text-xs font-bold text-gray-300">
                      {viewingReg.pass?.pass_type === "exclusive"
                        ? "⭐ Valid for all exclusive-eligible events"
                        : "No specific event linked"}
                    </div>
                  );
                })()}
              </div>

              {/* Additional Metadata / Notes */}
              <div className="p-3.5 rounded-xl bg-[#0e0d15] border-2 border-white/10 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <FileText className="h-3 w-3 stroke-[2.5]" />
                  <span>Registration Metadata</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 font-bold">
                  <div>
                    Registered On:{" "}
                    <span className="text-white">
                      {formatDate(viewingReg.created_at)}
                    </span>
                  </div>
                  <div className="truncate">
                    System ID:{" "}
                    <span className="font-mono text-gray-400 text-[11px]">
                      {viewingReg.id}
                    </span>
                  </div>
                </div>
                {viewingReg.notes && (
                  <div className="pt-2 border-t border-white/10">
                    <span className="text-gray-400 font-bold">Notes: </span>
                    <span className="text-white italic">{viewingReg.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {viewingReg.pass && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setSelectedPassReg(viewingReg)}
                    className="flex items-center gap-1.5"
                  >
                    <QrCode className="h-4 w-4 stroke-[2.5]" />
                    <span>View Pass</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingReg(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
