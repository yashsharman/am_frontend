import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  QrCode,
  UserPlus,
  Plus,
  RefreshCw,
  FileDown,
  Camera,
  CheckCircle2,
  Bolt,
  ArrowRight,
  PartyPopper,
  Check,
  Search,
} from "lucide-react";
import { eventsApi } from "../api/events";
import { checkinsApi } from "../api/checkins";
import { MetricsGrid } from "../components/dashboard/MetricsGrid";
import { EventForm } from "../components/admin/EventForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useExport } from "../hooks/useExport";
import { useCheckinStore } from "../stores/checkinStore";
import { formatDateTime } from "../utils/format";
import type { DashboardMetrics } from "../types";

export function DashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportSuccess, setIsExportSuccess] = useState(false);
  const [showAllMetrics, setShowAllMetrics] = useState(false);

  const { setCurrentEvent } = useCheckinStore();

  // 1. Fetch Events List
  const {
    data: events = [],
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventsApi.list(),
  });

  // Automatically select the active or first event
  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      const active = events.find((e) => e.status === "active") || events[0];
      setSelectedEventId(active.id);
      setCurrentEvent(active);
    }
  }, [events, selectedEventId, setCurrentEvent]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // 2. Fetch Metrics for the Selected Event
  const { data: metrics, refetch: refetchMetrics } = useQuery<DashboardMetrics>(
    {
      queryKey: ["event-metrics", selectedEventId],
      queryFn: () => eventsApi.getMetrics(selectedEventId),
      enabled: Boolean(selectedEventId),
      staleTime: 60 * 1000,
    },
  );

  // 3. Fetch Recent Check-ins for this Event
  const { data: recentCheckinsData, refetch: refetchCheckins } = useQuery({
    queryKey: ["checkins-event", selectedEventId],
    queryFn: () => checkinsApi.listByEvent(selectedEventId),
    enabled: Boolean(selectedEventId),
    staleTime: 60 * 1000,
  });

  const { exportCSV, isExporting } = useExport({ event_id: selectedEventId });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchEvents(), refetchMetrics(), refetchCheckins()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportCSV = async () => {
    await exportCSV();
    setIsExportSuccess(true);
    setTimeout(() => setIsExportSuccess(false), 2000);
  };

  const defaultMetrics: DashboardMetrics = {
    total_capacity: selectedEvent?.capacity || 100,
    registered: 0,
    available_slots: selectedEvent?.capacity || 100,
    payment_pending: 0,
    checked_in: 0,
    not_arrived: 0,
    exclusive_members: 0,
  };

  const currentMetrics = metrics || defaultMetrics;

  const capacity = currentMetrics.total_capacity || 100;
  const registered = currentMetrics.registered;
  const checkedIn = currentMetrics.checked_in;
  const slotsLeft = Math.max(0, capacity - registered);

  // Capacity Percentage
  const capacityPercent =
    capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;

  // Check-in Percentage
  const checkinRate =
    registered > 0
      ? Math.min(100, Math.round((checkedIn / registered) * 100))
      : 0;

  // Calculate 10-block graphic fill
  const filledBlocks = Math.min(
    10,
    Math.max(0, Math.round(capacityPercent / 10)),
  );

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full">
      {/* 1. Active Hero Event Card: Chunked, Bold outlines, High-contrast tags */}

      {/* 2. Gate Pulse Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {/* <div className="w-6 h-6 rounded bg-neo-peach border-2 border-neo-black shadow-brutal-sm flex items-center justify-center">
            <Bolt className="h-3.5 w-3.5 text-white stroke-[3]" />
          </div> */}
          <h2 className="text-lg font-black uppercase tracking-tight text-neo-black">
            Live Metrics
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllMetrics((prev) => !prev)}
            className="text-[11px] font-black uppercase text-neo-purple hover:underline"
          >
            {showAllMetrics ? "Show Compact" : "Show All"}
          </button>
        </div>
      </div>

      {/* 3. Split Metric Tiles: High-Contrast Tactile Cards */}
      <div className="grid grid-cols-1 gap-3">
        {/* Capacity Card */}
        <div className="bg-white border-2 border-neo-black rounded-xl p-3.5 shadow-brutal flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase font-black tracking-wider text-gray-500">
                Max Cap
              </span>
              <div className="text-3xl font-black text-neo-black leading-none mt-1">
                {capacity}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded border-2 border-neo-black bg-neo-peach text-white font-black text-xs shadow-brutal-sm">
              {capacityPercent}%
            </span>
          </div>

          {/* Geometric Block Graphic Fill */}
          <div className="mt-4">
            <div className="grid grid-cols-10 gap-1 w-full bg-neo-bg p-1.5 rounded-lg border-2 border-neo-black">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 rounded-[2px] transition-colors ${
                    i < filledBlocks
                      ? "bg-neo-purple border border-neo-black"
                      : "bg-white border border-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 font-bold text-[11px] text-neo-black">
              <span>
                {registered} / {capacity} claimed
              </span>
              <span className="font-black text-neo-purple">
                {slotsLeft} left
              </span>
            </div>
          </div>
        </div>

        {/* Check-in Rate Card */}
        <div className="bg-white border-2 border-neo-black rounded-xl p-3.5 shadow-brutal flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase font-black tracking-wider text-gray-500">
                Rate
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-3xl font-black text-neo-black leading-none">
                  {checkinRate}
                </span>
                <span className="text-lg font-black text-neo-purple">%</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-neo-lime border-2 border-neo-black shadow-brutal-sm flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-neo-black stroke-[3]" />
            </div>
          </div>

          {/* Segmented Bold Progress Bar */}
          <div className="mt-4">
            <div className="h-3 w-full bg-neo-bg border-2 border-neo-black rounded-md overflow-hidden flex">
              <div
                className="h-full bg-neo-lime border-r-2 border-neo-black transition-all duration-500"
                style={{ width: `${checkinRate}%` }}
              />
              <div
                className="h-full bg-transparent"
                style={{ width: `${100 - checkinRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 font-bold text-[11px] text-neo-black">
              <span>
                {checkedIn} of {registered} entered
              </span>
              <CheckCircle2 className="h-4 w-4 text-neo-peach fill-neo-peach text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Metrics Grid if toggled */}
      {showAllMetrics && (
        <div className="mt-1">
          <MetricsGrid metrics={currentMetrics} />
        </div>
      )}

      {/* Event Creation Modal */}
      <EventForm
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}
