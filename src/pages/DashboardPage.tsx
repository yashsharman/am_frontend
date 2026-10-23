import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  QrCode,
  UserPlus,
  Plus,
  RefreshCw,
  Camera,
  CheckCircle2,
  ArrowRight,
  PartyPopper,
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
import { useCheckinStore } from "../stores/checkinStore";
import { formatDateTime } from "../utils/format";
import type { DashboardMetrics } from "../types";

export function DashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchEvents(), refetchMetrics(), refetchCheckins()]);
    setTimeout(() => setIsRefreshing(false), 500);
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
    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full text-white">
      {/* 2. Gate Pulse Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            Live Metrics
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllMetrics((prev) => !prev)}
            className="text-[11px] font-black uppercase text-neo-lime hover:underline"
          >
            {showAllMetrics ? "Show Compact" : "Show All"}
          </button>
        </div>
      </div>

      {/* 3. Split Metric Tiles: High-Contrast Tactile Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Capacity Card */}
        <div className="bg-[#171622] border-2 border-white/15 rounded-xl p-3.5 shadow-brutal flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase font-black tracking-wider text-gray-400">
                Max Cap
              </span>
              <div className="text-3xl font-black text-white leading-none mt-1">
                {capacity}
              </div>
            </div>
            <span className="px-2 py-0.5 rounded border-2 border-white/20 bg-neo-peach text-white font-black text-xs shadow-brutal-sm">
              {capacityPercent}%
            </span>
          </div>

          {/* Geometric Block Graphic Fill */}
          <div className="mt-4">
            <div className="grid grid-cols-10 gap-1 w-full bg-[#0e0d15] p-1.5 rounded-lg border-2 border-white/20">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 rounded-[2px] transition-colors ${
                    i < filledBlocks
                      ? "bg-neo-purple border border-white/30"
                      : "bg-[#252338] border border-white/5"
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 font-bold text-[11px] text-gray-300">
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
        <div className="bg-[#171622] border-2 border-white/15 rounded-xl p-3.5 shadow-brutal flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] uppercase font-black tracking-wider text-gray-400">
                Rate
              </span>
              <div className="flex items-baseline gap-0.5 mt-1">
                <span className="text-3xl font-black text-white leading-none">
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
            <div className="h-3 w-full bg-[#0e0d15] border-2 border-white/20 rounded-md overflow-hidden flex">
              <div
                className="h-full bg-neo-lime border-r-2 border-neo-black transition-all duration-500"
                style={{ width: `${checkinRate}%` }}
              />
              <div
                className="h-full bg-transparent"
                style={{ width: `${100 - checkinRate}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 font-bold text-[11px] text-gray-300">
              <span>
                {checkedIn} of {registered} entered
              </span>
              <CheckCircle2 className="h-4 w-4 text-neo-lime stroke-[3]" />
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
      {/* 1. Active Hero Event Card: Chunked, Bold outlines, High-contrast tags */}
      <div className="w-full bg-[#171622] border-2 border-white/15 rounded-xl p-4 shadow-brutal flex flex-col gap-3 relative overflow-hidden">
        {/* Top banner strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neo-yellow border-2 border-neo-black text-xs font-black uppercase tracking-wider text-neo-black shadow-brutal-sm">
              Live Active
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              aria-label="Create New Event"
              onClick={() => setIsEventModalOpen(true)}
              className="h-8 px-2.5 rounded-md bg-[#1f1d2e] border-2 border-white/20 shadow-brutal-sm flex items-center gap-1 text-white hover:bg-neo-yellow hover:text-neo-black hover:border-neo-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-xs font-black uppercase"
              type="button"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span className="hidden sm:inline">New Event</span>
            </button>

            <button
              aria-label="Sync gate data"
              onClick={handleRefresh}
              className={`w-8 h-8 rounded-md bg-[#1f1d2e] border-2 border-white/20 shadow-brutal-sm flex items-center justify-center text-white hover:bg-neo-lime hover:text-neo-black hover:border-neo-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all ${
                isRefreshing ? "rotate-180 duration-500" : ""
              }`}
              type="button"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Event Selector Header */}
        {events.length > 0 ? (
          <div className="p-3 rounded-lg bg-[#1f1d2e] border-2 border-white/15">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-lg bg-neo-purple border-2 border-white/20 text-white flex items-center justify-center shrink-0 shadow-brutal-sm">
                  <PartyPopper className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <Select
                    value={selectedEventId}
                    onValueChange={(val) => {
                      setSelectedEventId(val);
                      const evt = events.find((e) => e.id === val);
                      if (evt) setCurrentEvent(evt);
                    }}
                  >
                    <SelectTrigger className="border-0 p-0 h-auto font-black text-white tracking-tight uppercase text-sm sm:text-base bg-transparent shadow-none hover:bg-transparent focus:ring-0 focus:outline-none">
                      <SelectValue placeholder="Select Event" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-white/20 shadow-brutal-lg rounded-xl bg-[#171622] text-white">
                      {events.map((evt) => (
                        <SelectItem
                          key={evt.id}
                          value={evt.id}
                          className="font-bold text-xs uppercase"
                        >
                          {evt.name} ({evt.date})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs font-bold text-gray-400 truncate mt-0.5">
                    {selectedEvent?.date || "Today"} •{" "}
                    {selectedEvent?.venue || "Main Gate"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          !isLoadingEvents && (
            <div className="p-4 rounded-lg bg-[#1f1d2e] border-2 border-white/15 text-center">
              <p className="text-xs font-bold uppercase text-gray-400">
                No active events found
              </p>
              <button
                onClick={() => setIsEventModalOpen(true)}
                className="mt-2 text-xs font-black uppercase text-neo-lime underline"
              >
                + Create your first event
              </button>
            </div>
          )
        )}

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <Link
            to="/checkin"
            className="h-12 px-3 rounded-lg bg-neo-purple text-white border-2 border-white/20 shadow-brutal flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wide hover:bg-indigo-600 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <QrCode className="h-5 w-5 stroke-[2.5]" />
            <span className="truncate">Scan Badges</span>
          </Link>
          <Link
            to="/register"
            className="h-12 px-3 rounded-lg bg-neo-lime text-neo-black border-2 border-neo-black shadow-brutal font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-[#34e294] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <UserPlus className="h-5 w-5 stroke-[2.5]" />
            <span className="truncate">Register</span>
          </Link>
        </div>
      </div>

      {/* 4. Live Gate Stream Ticker */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Check-ins
            </h2>
          </div>
          <Link
            to="/history"
            className="text-xs font-black uppercase tracking-wider text-neo-lime flex items-center gap-1 hover:underline"
          >
            View all ({recentCheckinsData?.items?.length || 0})
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {recentCheckinsData?.items && recentCheckinsData.items.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {recentCheckinsData.items.slice(0, 4).map((ci) => {
              const initials = ci.attendee_name
                ? ci.attendee_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "AT";

              const isScan = ci.method === "qr_scan";

              return (
                <div
                  key={ci.id}
                  className="w-full bg-[#171622] border-2 border-white/15 rounded-xl p-3 shadow-brutal flex items-center justify-between gap-3 hover:translate-x-0.5 hover:translate-y-0.5 hover:border-white/30 transition-all text-white"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-lg bg-neo-yellow border-2 border-neo-black shadow-brutal-sm flex items-center justify-center font-black text-sm text-neo-black">
                        {initials}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-black text-white truncate">
                        {ci.attendee_name || "Verified Attendee"}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-gray-400 truncate mt-0.5">
                        {isScan ? (
                          <Camera className="h-3.5 w-3.5 text-neo-purple stroke-[2.5]" />
                        ) : (
                          <Search className="h-3.5 w-3.5 text-neo-purple stroke-[2.5]" />
                        )}
                        <span>{isScan ? "Camera Scan" : "Manual Entry"}</span>
                        {/* <span className="text-white font-black">Gate #01</span> */}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="px-2 py-0.5 rounded border-2 border-neo-black bg-neo-lime text-neo-black text-[11px] font-black uppercase shadow-brutal-sm">
                      Checked In
                    </span>
                    <span className="text-[11px] font-bold text-gray-400">
                      {formatDateTime(ci.checked_in_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="w-full bg-[#171622]/60 border-2 border-white/15 border-dashed rounded-xl p-4 text-center">
            <p className="text-xs font-black uppercase text-gray-300">
              No live gate scans recorded yet
            </p>
            <p className="text-[11px] font-bold text-gray-500 mt-0.5">
              Attendees checking in via QR badge or manual search will appear
              here live.
            </p>
          </div>
        )}
      </div>

      {/* Event Creation Modal */}
      <EventForm
        open={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
      />
    </div>
  );
}
