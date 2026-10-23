import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Camera,
  Search,
  CheckCircle,
  Calendar,
  Volume2,
  VolumeX,
  FastForward,
} from 'lucide-react';
import { eventsApi } from '../api/events';
import { QRScanner } from '../components/checkin/QRScanner';
import { CheckinResult } from '../components/checkin/CheckinResult';
import { ManualSearch } from '../components/checkin/ManualSearch';
import { useCheckin } from '../hooks/useCheckin';
import { useCheckinStore } from '../stores/checkinStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import toast from 'react-hot-toast';

export function CheckinPage() {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(false);

  // Synchronous ref to prevent rapid consecutive scans
  const inFlightRef = useRef(false);

  const { currentEvent, setCurrentEvent, recentCheckins } = useCheckinStore();
  const {
    lastResult,
    clearResult,
    scan,
    manualCheckin,
    isScanning,
    isManualChecking,
  } = useCheckin();

  // Fetch events list to ensure active event is selected
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list(),
  });

  // Default to active or first event if currentEvent is not set
  useEffect(() => {
    if (events.length > 0 && !currentEvent) {
      const active = events.find((e) => e.status === 'active') || events[0];
      setCurrentEvent(active);
    }
  }, [events, currentEvent, setCurrentEvent]);

  // Handle scan feedback and optional auto-advance ONLY on success
  useEffect(() => {
    if (lastResult) {
      inFlightRef.current = false;

      if (lastResult.success) {
        if (soundEnabled) {
          playBeep(880, 0.15); // high pitch success beep
        }
        if (navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        // Only auto-reset if the volunteer explicitly turned on Auto-advance
        if (autoAdvance) {
          const timer = window.setTimeout(() => {
            clearResult();
          }, 3000);
          return () => clearTimeout(timer);
        }
      } else {
        // Error or duplicate scan: alert volunteer and DO NOT auto-reset
        if (soundEnabled) {
          playBeep(300, 0.3); // low pitch error buzz
        }
        if (navigator.vibrate) {
          navigator.vibrate(300);
        }
      }
    }
  }, [lastResult, soundEnabled, autoAdvance, clearResult]);

  // Audio helper using Web Audio API
  const playBeep = (freq: number, duration: number) => {
    try {
      const AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof window.AudioContext })
          .webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio might be blocked until user interacts
    }
  };

  const handleScan = (qrToken: string) => {
    if (!currentEvent) {
      toast.error('Please select an event first');
      return;
    }
    if (isScanning || lastResult || inFlightRef.current) return;
    inFlightRef.current = true;
    scan({ qrToken, eventId: currentEvent.id });
  };

  const handleManualCheckin = (query: string) => {
    if (!currentEvent) {
      toast.error('Please select an event first');
      return;
    }
    manualCheckin({ registrationId: query, eventId: currentEvent.id });
  };

  const handleNextAttendee = () => {
    inFlightRef.current = false;
    clearResult();
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 text-white">
      {/* Event Selection & Gate Controls Header */}
      <div className="bg-[#171622] p-3.5 sm:p-4 rounded-xl border-2 border-white/15 shadow-brutal space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 rounded-md bg-neo-purple border-2 border-white/20 shadow-brutal-sm flex items-center justify-center text-white shrink-0">
              <Calendar className="h-4 w-4 stroke-[2.5]" />
            </div>
            <span className="text-xs font-black text-white uppercase tracking-wider shrink-0">
              Gate:
            </span>
            <Select
              value={currentEvent?.id || ''}
              onValueChange={(val) => {
                const evt = events.find((e) => e.id === val);
                if (evt) setCurrentEvent(evt);
              }}
            >
              <SelectTrigger className="h-9 text-xs font-black uppercase border-2 border-white/20 shadow-brutal-sm flex-1 min-w-0 bg-[#0e0d15] text-white">
                <SelectValue placeholder="Choose Event" />
              </SelectTrigger>
              <SelectContent className="border-2 border-white/20 shadow-brutal-lg rounded-xl bg-[#171622] text-white">
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id} className="font-bold text-xs uppercase">
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`h-9 px-2.5 rounded-md border-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                autoAdvance
                  ? 'bg-neo-yellow text-neo-black border-neo-black shadow-brutal-sm'
                  : 'bg-[#0e0d15] text-gray-400 border-white/20 shadow-brutal-sm hover:text-white'
              }`}
              title={autoAdvance ? 'Auto-advance on (3s)' : 'Auto-advance off'}
              type="button"
            >
              <FastForward className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Auto</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-9 h-9 rounded-md bg-[#0e0d15] border-2 border-white/20 shadow-brutal-sm flex items-center justify-center text-white hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black transition-all"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              type="button"
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-neo-lime stroke-[2.5]" />
              ) : (
                <VolumeX className="h-4 w-4 text-gray-500 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (Scanner vs Manual Search) */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0e0d15] border-2 border-white/15 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setActiveTab('scan');
              handleNextAttendee();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'scan'
                ? 'bg-neo-yellow border-2 border-neo-black text-neo-black shadow-brutal-sm'
                : 'text-gray-300 hover:bg-white/5 border-2 border-transparent'
            }`}
          >
            <Camera className="h-4 w-4 stroke-[2.5]" />
            Camera Scan
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              handleNextAttendee();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'manual'
                ? 'bg-neo-yellow border-2 border-neo-black text-neo-black shadow-brutal-sm'
                : 'text-gray-300 hover:bg-white/5 border-2 border-transparent'
            }`}
          >
            <Search className="h-4 w-4 stroke-[2.5]" />
            Manual Search
          </button>
        </div>
      </div>

      {/* Main Check-in Viewport */}
      {lastResult ? (
        /* Instant Verification Result Card */
        <CheckinResult result={lastResult} onScanNext={handleNextAttendee} />
      ) : activeTab === 'scan' ? (
        /* Live Camera Scanner */
        <div className="space-y-2">
          <QRScanner
            onScan={handleScan}
            isProcessing={isScanning || inFlightRef.current}
            disabled={!currentEvent}
          />
          <p className="text-center text-xs font-bold text-gray-400">
            Center attendee QR badge inside frame. Verification is instant.
          </p>
        </div>
      ) : (
        /* Manual Search by Phone, Name, or Reg ID */
        <ManualSearch
          onCheckin={handleManualCheckin}
          isLoading={isManualChecking}
        />
      )}

      {/* Recent Check-ins at Gate */}
      {recentCheckins.length > 0 && (
        <div className="bg-[#171622] border-2 border-white/15 rounded-xl p-3.5 shadow-brutal">
          <p className="text-xs font-black text-white uppercase tracking-wider mb-2">
            Recent Check-ins at This Gate
          </p>
          <div className="space-y-2">
            {recentCheckins.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs py-1.5 px-2 bg-[#0e0d15] rounded-lg border border-white/15"
              >
                <div className="flex items-center gap-2 truncate">
                  <CheckCircle className="h-4 w-4 text-neo-lime stroke-[2.5] shrink-0" />
                  <span className="font-black text-white truncate">
                    {item.attendee_name || 'Attendee'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-gray-400 shrink-0">
                  {item.checked_in_at
                    ? new Date(item.checked_in_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Just now'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
