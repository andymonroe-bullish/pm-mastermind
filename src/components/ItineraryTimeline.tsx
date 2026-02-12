"use client";

import { useState } from "react";

interface ScheduleEvent {
  time: string;
  title: string;
}

interface Day {
  id: string;
  label: string;
  date: string;
  events: ScheduleEvent[];
}

const days: Day[] = [
  {
    id: "thu",
    label: "Thursday",
    date: "April 16th",
    events: [
      { time: "6:30pm", title: "Welcome Dinner" },
      { time: "8:00pm", title: "Opening Session + Hangout" },
    ],
  },
  {
    id: "fri",
    label: "Friday",
    date: "April 17th",
    events: [
      { time: "8:00am", title: "Breakfast & Coffee" },
      { time: "9:00am - 11:00am", title: "Session 1" },
      { time: "11:00am - 11:15am", title: "Break" },
      { time: "11:15am - 12:00pm", title: "Session 2" },
      { time: "12:00pm - 1:30pm", title: "Lunch" },
      { time: "1:30pm - 3:30pm", title: "Session 3" },
      { time: "3:30pm - 3:45pm", title: "Break" },
      { time: "3:45pm - 5:00pm", title: "Live Build" },
      { time: "5:00pm - 6:00pm", title: "Personal Time / Enjoy the Airbnb" },
      { time: "6:00pm - 7:30pm", title: "Dinner" },
      { time: "7:30pm - 9:00pm", title: "Activities" },
    ],
  },
  {
    id: "sat",
    label: "Saturday",
    date: "April 18th",
    events: [
      { time: "8:00am - 9:00am", title: "Breakfast" },
      { time: "9:00am - 12:30pm", title: "Excursion / Activity" },
      { time: "12:30pm - 2:00pm", title: "Lunch" },
      { time: "2:00pm - 4:00pm", title: "Session" },
      { time: "4:00pm - 4:15pm", title: "Break" },
      { time: "4:15pm - 5:00pm", title: "Session" },
      { time: "5:00pm - 5:45pm", title: "Personal Reflection / Closing Session" },
      { time: "6:00pm - 7:30pm", title: "Dinner" },
      { time: "7:30pm - 9:00pm", title: "Party" },
    ],
  },
  {
    id: "sun",
    label: "Sunday",
    date: "April 19th",
    events: [
      { time: "9:00am", title: "Breakfast / Event End" },
    ],
  },
];

export default function ItineraryTimeline() {
  const [activeDay, setActiveDay] = useState("thu");

  const currentDay = days.find((d) => d.id === activeDay)!;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <h2 className="text-base sm:text-lg font-bold text-dark-text uppercase tracking-wider mb-4 relative">
        <span className="relative z-10">Schedule</span>
        <span className="absolute bottom-0 left-0 h-2 w-20 sm:w-24 bg-cyan/20 -z-0" />
      </h2>

      {/* Day toggle buttons */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1">
        {days.map((day) => (
          <button
            key={day.id}
            onClick={() => setActiveDay(day.id)}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 min-w-0 ${
              activeDay === day.id
                ? "bg-cyan text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="block sm:hidden">{day.label.slice(0, 3)}</span>
            <span className="hidden sm:block">{day.label}</span>
            <span className={`block text-[10px] sm:text-xs ${activeDay === day.id ? "text-white/80" : "text-gray-400"}`}>
              {day.date}
            </span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {currentDay.events.map((event, index) => (
          <div key={index} className="flex gap-2.5 sm:gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-cyan flex-shrink-0 mt-1.5" />
              {index < currentDay.events.length - 1 && (
                <div className="w-0.5 bg-cyan/20 flex-1 min-h-[1.5rem] sm:min-h-[2rem]" />
              )}
            </div>

            {/* Content */}
            <div className="pb-4 sm:pb-5">
              <span className="text-[10px] sm:text-xs font-semibold text-cyan bg-cyan/10 px-1.5 py-0.5 sm:px-2 rounded">
                {event.time}
              </span>
              <p className="text-sm sm:text-base font-semibold text-dark-text mt-1">{event.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
