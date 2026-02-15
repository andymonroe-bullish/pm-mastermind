"use client";

import { useState, useEffect } from "react";

const EVENT_DATE = new Date("2026-04-16T00:00:00");

export default function EventCountdown() {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    const diff = EVENT_DATE.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    setDaysLeft(days);
  }, []);

  if (daysLeft === null) return null;

  if (daysLeft <= 0) {
    return (
      <div className="bg-cyan text-white rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-center">
        <p className="text-lg sm:text-2xl font-bold">The event is happening now!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider font-medium">
            Days until PM Mastermind
          </p>
          <p className="text-3xl sm:text-5xl font-bold text-cyan mt-1">
            {daysLeft}
          </p>
        </div>
        <div className="text-right text-sm sm:text-base text-gray-500">
          <p className="font-medium text-dark-text">April 16 - 19, 2026</p>
          <p>Phoenix, AZ</p>
        </div>
      </div>
    </div>
  );
}
