import type { EventInfo } from "@/lib/types";

export default function EventInfoCard({ event }: { event: EventInfo | null }) {
  if (!event) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
        <span className="relative z-10">Event Details</span>
        <span className="absolute bottom-0 left-0 h-2 w-32 bg-cyan/20 -z-0" />
      </h2>

      <div className="space-y-3 text-dark-text">
        {event.event_date && (
          <div className="flex items-start gap-3">
            <span className="text-cyan font-bold text-lg">📅</span>
            <div>
              <p className="font-medium">Date</p>
              <p className="text-gray-600">
                {new Date(event.event_date + "T00:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {event.event_time && ` at ${event.event_time}`}
              </p>
            </div>
          </div>
        )}

        {event.venue_name && (
          <div className="flex items-start gap-3">
            <span className="text-cyan font-bold text-lg">🏢</span>
            <div>
              <p className="font-medium">Venue</p>
              <p className="text-gray-600">{event.venue_name}</p>
            </div>
          </div>
        )}

        {event.location && (
          <div className="flex items-start gap-3">
            <span className="text-cyan font-bold text-lg">📍</span>
            <div>
              <p className="font-medium">Location</p>
              <p className="text-gray-600">{event.location}</p>
            </div>
          </div>
        )}

        {event.description && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
          </div>
        )}

        {event.additional_notes && (
          <div className="mt-3 p-3 bg-cyan/5 rounded-lg border border-cyan/10">
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{event.additional_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
