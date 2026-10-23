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
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent } from '../components/ui/card';
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
      const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
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
    <div className="max-w-xl mx-auto space-y-4">
      {/* Event Selection & Controls Header */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">
              Event:
            </span>
            <Select
              value={currentEvent?.id || ''}
              onValueChange={(val) => {
                const evt = events.find((e) => e.id === val);
                if (evt) setCurrentEvent(evt);
              }}
            >
              <SelectTrigger className="h-8 text-xs font-medium border-gray-200 flex-1 min-w-0">
                <SelectValue placeholder="Choose Event" />
              </SelectTrigger>
              <SelectContent>
                {events.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoAdvance(!autoAdvance)}
              className={`h-8 px-2 text-xs font-medium ${
                autoAdvance ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400'
              }`}
              title={autoAdvance ? 'Auto-advance on (3s)' : 'Auto-advance off'}
            >
              <FastForward className="h-3.5 w-3.5 mr-1" />
              Auto
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-8 px-2 text-gray-500"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-indigo-600" /> : <VolumeX className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mode Selector Tabs (Scanner vs Manual Search) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('scan');
              handleNextAttendee();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'scan'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Camera className="h-4 w-4" />
            Camera Scan
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              handleNextAttendee();
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'manual'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="h-4 w-4" />
            Manual Search
          </button>
        </div>
      </div>

      {/* Main Check-in Viewport */}
      {lastResult ? (
        /* Instant Verification Result Card */
        <CheckinResult
          result={lastResult}
          onScanNext={handleNextAttendee}
        />
      ) : activeTab === 'scan' ? (
        /* Live Camera Scanner */
        <div className="space-y-2">
          <QRScanner
            onScan={handleScan}
            isProcessing={isScanning || inFlightRef.current}
            disabled={!currentEvent}
          />
          <p className="text-center text-xs text-gray-500">
            Center the attendee's QR pass inside the frame. Verification is instant.
          </p>
        </div>
      ) : (
        /* Manual Search by Phone, Name, or Reg ID */
        <ManualSearch
          onCheckin={handleManualCheckin}
          isLoading={isManualChecking}
        />
      )}

      {/* Quick Access Info / Recent Check-ins */}
      {recentCheckins.length > 0 && (
        <Card className="border border-gray-200">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Recent Check-ins at This Gate
            </p>
            <div className="space-y-1.5">
              {recentCheckins.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span className="font-medium text-gray-800 truncate">
                      {item.attendee_name || 'Attendee'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 font-mono shrink-0">
                    {item.checked_in_at ? new Date(item.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
