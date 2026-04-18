import { useState, useEffect } from "react";
import { getToken } from "../utils/auth";
import "../App.css";

const BACKEND = "https://life-mentor-backend.onrender.com";

const SLOTS = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function AvailabilityCalendar({ onSelectSlot }) {
  const token = getToken();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  const formatDate = (day) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const isPast = (day) => {
    const d = new Date(year, month, day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const handleDayClick = async (day) => {
    if (isPast(day)) return;
    const dateStr = formatDate(day);
    setSelectedDate(day);
    setLoadingSlots(true);
    try {
      const res = await fetch(`${BACKEND}/api/appointments/booked-slots?date=${dateStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookedSlots(Array.isArray(data) ? data : []);
    } catch { setBookedSlots([]); }
    finally { setLoadingSlots(false); }
  };

  const handleSlotClick = (slot) => {
    if (bookedSlots.includes(slot)) return;
    if (onSelectSlot) onSelectSlot(formatDate(selectedDate), slot);
  };

  return (
    <div className="cal-wrapper">

      {/* Month navigation */}
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <h3>{MONTHS[month]} {year}</h3>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>

      {/* Day labels */}
      <div className="cal-grid">
        {DAYS.map(d => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}

        {/* Empty cells */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const past = isPast(day);
          const selected = selectedDate === day;
          return (
            <div
              key={day}
              className={`cal-day ${past ? "past" : "available"} ${selected ? "selected" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="cal-slots">
          <h4>Available slots for {formatDate(selectedDate)}</h4>
          {loadingSlots ? (
            <p className="cal-loading">Loading slots...</p>
          ) : (
            <div className="cal-slots-grid">
              {SLOTS.map(slot => {
                const booked = bookedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    className={`cal-slot ${booked ? "booked" : "free"}`}
                    onClick={() => handleSlotClick(slot)}
                    disabled={booked}
                  >
                    {booked ? "🔴" : "🟢"} {slot}
                    <span>{booked ? "Booked" : "Free"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

export default AvailabilityCalendar;
