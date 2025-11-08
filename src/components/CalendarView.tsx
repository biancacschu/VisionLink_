import { useMemo, useState } from "react";
// Kept for future integration, but not used in this mock-up
import { apiGet, apiPost, apiDelete } from "../lib/api"; 

export default function CalendarView() {
  
  // State for tracking the currently displayed date
  const [currentDate, setCurrentDate] = useState(new Date());

  // Optional: Keep form states for the mock event creator
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");

  const canCreate = useMemo(() => title.trim() && start, [title, start]);

  // Helper function to generate the days for the displayed month
  const getCalendarData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed (0 = Jan)
    
    // 1. Get the first day of the month and its day of the week (0=Sun, 6=Sat)
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    // 2. Get the number of days in the month
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Add nulls for preceding month days (to align the first day correctly)
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    
    // Add the days of the current month
    for (let i = 1; i <= lastDayOfMonth; i++) {
        days.push(i);
    }
    
    // Fill the rest with nulls if needed (for grid completion)
    while (days.length % 7 !== 0) {
        days.push(null);
    }

    return {
        calendarDays: days,
    };
  };

  // Recalculates the calendar data whenever currentDate changes
  const { calendarDays } = useMemo(() => getCalendarData(currentDate), [currentDate]);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  // --- Data Arrays and Handlers for Drop-downs ---
  
  const months = [
    { name: 'January', value: 0 }, { name: 'February', value: 1 }, { name: 'March', value: 2 },
    { name: 'April', value: 3 }, { name: 'May', value: 4 }, { name: 'June', value: 5 },
    { name: 'July', value: 6 }, { name: 'August', value: 7 }, { name: 'September', value: 8 },
    { name: 'October', value: 9 }, { name: 'November', value: 10 }, { name: 'December', value: 11 }
  ];

  // 💥 CHANGE: Generate a large range of years (1950 to 2050) to force scrollability
  const startYear = 1950;
  const endYear = 2050;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  // ----------------------------------------------------------------------------------

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(prevDate => {
        return new Date(prevDate.getFullYear(), newMonth, 1);
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(prevDate => {
        return new Date(newYear, prevDate.getMonth(), 1);
    });
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1);
        return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1);
        return newDate;
    });
  };

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!canCreate) return;
    setTitle(""); setDescription(""); setStart(""); setEnd(""); setLocation("");
  }
  
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">Team schedule and milestones.</p>
      </header>
      
      {/* --- Dynamic Month View Calendar Grid --- */}
      <div className="bg-white rounded-2xl shadow overflow-hidden p-6">
        <div className="flex justify-between items-center mb-4">
            
            {/* Previous Month Button */}
            <button 
                onClick={handlePrevMonth} 
                className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100"
            >
                &lt;
            </button>
            
            {/* --- Month and Year Selectors --- */}
            <div className="flex items-center gap-3">
                
                {/* Month Selector */}
                <select 
                    value={currentDate.getMonth()} 
                    onChange={handleMonthChange} 
                    className="text-xl font-semibold border rounded-md p-1"
                >
                    {months.map(month => (
                        <option key={month.value} value={month.value}>{month.name}</option>
                    ))}
                </select>

                {/* Year Selector */}
                <select 
                    value={currentDate.getFullYear()} 
                    onChange={handleYearChange} 
                    className="text-xl font-semibold border rounded-md p-1"
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            {/* ---------------------------------- */}
            
            {/* Next Month Button */}
            <button 
                onClick={handleNextMonth} 
                className="text-gray-500 hover:text-black p-2 rounded-full hover:bg-gray-100"
            >
                &gt;
            </button>
        </div>
        
        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 border-b border-t py-2">
            {daysOfWeek.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600">
                    {day}
                </div>
            ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 divide-x divide-y border-b">
            {calendarDays.map((day, index) => (
                <div 
                    key={index} 
                    className={`h-24 p-2 text-right text-sm ${day ? 'bg-white' : 'bg-gray-50 text-gray-400'}`}
                >
                    {/* Day Number */}
                    <div className={`font-semibold ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() ? 'text-blue-600' : ''}`}>
                        {day || ""}
                    </div>
                    
                    {/* Mock Event Markers (Example) */}
                    {day === 12 && (
                        <span className="text-xs bg-red-100 text-red-700 rounded-md px-1 block mt-1">
                            Deadline
                        </span>
                    )}
                    {day === 20 && (
                        <span className="text-xs bg-green-100 text-green-700 rounded-md px-1 block mt-1">
                            Team Lunch
                        </span>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* --- Event Creation Form --- */}
      <form onSubmit={createEvent} className="grid gap-3 md:grid-cols-2 bg-white rounded-2xl p-4 shadow">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Title</label>
          <input className="border rounded-md px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Location</label>
          <input className="border rounded-md px-3 py-2" value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <div className="grid gap-1 md:col-span-2">
          <label className="text-sm font-medium">Description</label>
          <textarea className="border rounded-md px-3 py-2 min-h-20" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">Start</label>
          <input type="datetime-local" className="border rounded-md px-3 py-2" value={start} onChange={e => setStart(e.target.value)} required />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium">End</label>
          <input type="datetime-local" className="border rounded-md px-3 py-2" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <button disabled={!canCreate} className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-40">
            Create event
          </button>
        </div>
      </form>
    </div>
  );
}