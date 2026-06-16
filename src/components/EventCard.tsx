import React, { useState } from 'react';
import { MapPin, Music, Disc, Ticket, GraduationCap, ChevronDown, Moon } from 'lucide-react';
import { SwingEvent } from '@/types/event';
import { getTemporalBadge, formatEventDateRange, TemporalBadge } from '@/lib/datetime';
import { ShareButton } from '@/components/ShareButton';

interface EventCardProps {
  event: SwingEvent;
  /** All dates covered by this card (ascending). Length > 1 means multi-night. */
  dates: string[];
  /** Number of nights remaining in the expansion (1 for single-night cards). */
  nightCount: number;
  isThisWeek: boolean;
  currentDate: string;
  currentTime: string;
}

function TemporalBadgeDisplay({ badge }: { badge: TemporalBadge }) {
  if (!badge) return null;

  switch (badge) {
    case 'happening-now':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-600 text-white text-[11px] uppercase font-bold tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          Happening Now
        </span>
      );
    case 'just-ended':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] text-[11px] uppercase font-bold tracking-wider border border-[var(--outline-variant)]">
          Just Ended
        </span>
      );
    case 'tonight':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--primary)] text-white text-[11px] uppercase font-bold tracking-wider">
          Tonight
        </span>
      );
    case 'tomorrow':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--secondary)] text-white text-[11px] uppercase font-bold tracking-wider">
          Tomorrow
        </span>
      );
    case 'this-week':
      return (
        <span className="px-2.5 py-0.5 rounded bg-[var(--primary)]/15 text-[var(--primary)] text-[11px] uppercase font-bold tracking-wider border border-[var(--primary)]/20">
          This Week
        </span>
      );
    default:
      return null;
  }
}

function MusicHint({ type }: { type: 'live' | 'dj' }) {
  const Icon = type === 'live' ? Music : Disc;
  return (
    <span
      className="text-[var(--on-surface-variant)] flex items-center"
      aria-label={type === 'live' ? 'Live music' : 'DJ set'}
    >
      <Icon className="w-3.5 h-3.5" />
    </span>
  );
}

export function EventCard({ event, dates, nightCount, isThisWeek, currentDate, currentTime }: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const badge = getTemporalBadge(
    event.date,
    event.start,
    event.end,
    currentDate,
    currentTime,
    isThisWeek
  );

  const getStyleLabel = (style: string) => {
    switch (style.toLowerCase()) {
      case 'lindy':
        return 'Lindy Hop';
      case 'balboa':
        return 'Balboa';
      case 'blues':
        return 'Blues';
      case 'all':
        return 'Social – all styles';
      default:
        return style.charAt(0).toUpperCase() + style.slice(1);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style.toLowerCase()) {
      case 'lindy':
        return 'bg-[var(--tertiary)]/10 text-[var(--tertiary)] border-[var(--tertiary)]/20';
      case 'balboa':
        return 'bg-[var(--secondary)]/10 text-[var(--secondary)] border-[var(--secondary)]/20';
      case 'blues':
        return 'bg-[var(--surface-container-high)] text-[var(--on-surface-variant)] border-[var(--outline-variant)]';
      default:
        return 'bg-[var(--surface-container)] text-[var(--on-surface-variant)] border-[var(--surface-container-highest)]';
    }
  };

  const getStripeColor = () => {
    switch (badge) {
      case 'happening-now':
        return 'bg-red-600';
      case 'just-ended':
        return '';
      case 'tonight':
        return 'bg-[var(--primary)]';
      case 'tomorrow':
        return 'bg-[var(--secondary)]';
      default:
        return isThisWeek ? 'bg-[var(--primary)]' : '';
    }
  };

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.address}`)}`;

  const priceDisplay = event.price ? `${event.price}${event.payment ? ` (${event.payment})` : ''}` : null;

  const musicRows: { type: 'live' | 'dj'; name?: string }[] = [];
  if (event.band) musicRows.push({ type: 'live', name: event.band });
  if (event.dj) musicRows.push({ type: 'dj', name: event.dj });
  if (musicRows.length === 0) {
    if (event.music === 'live') musicRows.push({ type: 'live' });
    else if (event.music === 'dj') musicRows.push({ type: 'dj' });
    else if (event.music === 'mixed') musicRows.push({ type: 'live' }, { type: 'dj' });
  }

  const byLine = [event.organizer && `By ${event.organizer}`, event.address].filter(Boolean).join(' · ');
  const hasPills = nightCount > 1 || !!event.beginnerClass;

  return (
    <div className={`relative lift-card rounded border-2 overflow-hidden flex flex-col text-[var(--on-surface)] ${event.cancelled ? 'border-red-400 bg-red-50/40' : 'border-[var(--on-surface)] bg-[var(--surface-container-low)]'} ${!event.cancelled && badge === 'happening-now' ? 'ring-2 ring-red-500/30' : ''}`}>
      {/* Highlighting border/accent stripe — red for cancelled, temporal colour otherwise */}
      {event.cancelled ? (
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-500" />
      ) : (isThisWeek || badge) && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${getStripeColor()}`} />
      )}

      <div className={event.cancelled ? 'opacity-60' : ''}>
        {/* ---------- Collapsed summary ---------- */}
        <div className="p-5">
          {/* Time + music hints + temporal status */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-sans font-bold text-base tabular-nums tracking-tight text-[var(--on-surface)] ${event.cancelled ? 'line-through' : ''}`}>
                  {event.start} – {event.end}
                </span>
                {musicRows.map((row) => (
                  <MusicHint key={row.type} type={row.type} />
                ))}
              </div>
              {nightCount > 1 && (
                <div className="font-sans text-xs text-[var(--on-surface-variant)] mt-0.5 font-medium">
                  {formatEventDateRange(dates[0], dates[dates.length - 1])}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {event.cancelled && (
                <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] uppercase font-bold tracking-wider">
                  Cancelled
                </span>
              )}
              {event.status === 'draft' && (
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 text-[10px] uppercase font-bold tracking-wider">
                  Draft Preview
                </span>
              )}
              {!event.cancelled && <TemporalBadgeDisplay badge={badge} />}
            </div>
          </div>

          {/* Title */}
          <h3
            title={event.title}
            className={`font-serif text-xl font-bold tracking-tight text-[var(--on-surface)] leading-snug mb-1.5 truncate ${event.cancelled ? 'line-through' : ''}`}
          >
            {event.title}
          </h3>

          {/* Venue · neighborhood · price (all inline) */}
          <div className={`text-sm ${hasPills ? 'mb-3.5' : 'mb-1'}`}>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-bold text-[var(--on-surface)] underline decoration-[var(--outline)] underline-offset-4 hover:text-[var(--primary)] transition-colors ${event.cancelled ? 'line-through' : ''}`}
            >
              {event.venue}
            </a>
            {event.neighborhood && (
              <span className="text-[var(--outline)]"> · {event.neighborhood}</span>
            )}
            {priceDisplay && (
              <span className="text-[var(--outline)]"> · {priceDisplay}</span>
            )}
          </div>

          {/* Pills: multi-night + beginner only */}
          {hasPills && (
            <div className="flex flex-wrap items-center gap-2 font-sans">
              {nightCount > 1 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] uppercase font-bold tracking-wider whitespace-nowrap shrink-0">
                  <Moon className="w-3 h-3" />
                  {nightCount} nights
                </span>
              )}
              {event.beginnerClass && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-green-50 text-green-800 border border-green-200 text-[10px] uppercase font-bold tracking-wider">
                  <GraduationCap className="w-3 h-3" />
                  {event.beginnerClass.toLowerCase() === 'yes'
                    ? 'Beginner friendly'
                    : `Beginner class ${event.beginnerClass}`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ---------- Expandable details (style always shown here) ---------- */}
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="flex items-center gap-1.5 w-full border-t-2 border-[var(--on-surface)] px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-[var(--on-surface-variant)] hover:bg-[var(--surface-container)] transition-colors cursor-pointer"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          {isExpanded ? 'Hide details' : 'Details'}
        </button>

        {isExpanded && (
          <div className="border-t-2 border-[var(--on-surface)] p-5 space-y-3 font-sans">
            {/* Style */}
            <div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${getStyleColor(event.style)}`}>
                {getStyleLabel(event.style)}
              </span>
            </div>

            {/* Performers */}
            {musicRows.some((r) => r.name) && (
              <div className="space-y-1 font-sans">
                {musicRows.filter((r) => r.name).map((row) => (
                  <div key={row.type} className="flex items-center gap-2 text-sm text-[var(--on-surface-variant)]">
                    {row.type === 'live' ? <Music className="w-3.5 h-3.5 shrink-0" /> : <Disc className="w-3.5 h-3.5 shrink-0" />}
                    <span>{row.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Organizer + address */}
            {byLine && (
              <div className="flex items-start gap-2 text-xs text-[var(--outline)] font-medium">
                <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{byLine}</span>
              </div>
            )}

            {/* Description */}
            {event.body && (
              <p className="text-sm text-[var(--on-surface-variant)] leading-relaxed whitespace-pre-line">
                {event.body}
              </p>
            )}

            {/* Ticket CTA + Share */}
            <div className="flex items-center gap-2">
              {event.ticket && (
                <a
                  href={event.ticket}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border border-[var(--on-surface)] bg-[var(--primary)] text-white hover:bg-[var(--primary-container)] font-bold uppercase tracking-wider text-xs lift-btn-primary"
                >
                  <Ticket className="w-4 h-4" />
                  Get Tickets / Info
                </a>
              )}
              <ShareButton eventId={event.id} eventDate={event.date} eventTitle={event.title} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
