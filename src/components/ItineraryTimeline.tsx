import type { ItineraryItem } from "@/lib/types";

export default function ItineraryTimeline({ items }: { items: ItineraryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
          <span className="relative z-10">Itinerary</span>
          <span className="absolute bottom-0 left-0 h-2 w-24 bg-cyan/20 -z-0" />
        </h2>
        <p className="text-gray-400 text-sm">No schedule items yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
        <span className="relative z-10">Itinerary</span>
        <span className="absolute bottom-0 left-0 h-2 w-24 bg-cyan/20 -z-0" />
      </h2>

      <div className="space-y-0">
        {items.map((item, index) => (
          <div key={item.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-cyan flex-shrink-0 mt-1.5" />
              {index < items.length - 1 && (
                <div className="w-0.5 bg-cyan/20 flex-1 min-h-[2rem]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {(item.start_time || item.end_time) && (
                  <span className="text-xs font-semibold text-cyan bg-cyan/10 px-2 py-0.5 rounded">
                    {item.start_time}
                    {item.end_time && ` – ${item.end_time}`}
                  </span>
                )}
                {item.date && (
                  <span className="text-xs text-gray-400">
                    {new Date(item.date + "T00:00:00").toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <p className="font-semibold text-dark-text mt-1">{item.title}</p>
              {item.description && (
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
