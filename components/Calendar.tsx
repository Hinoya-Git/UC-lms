
import React, { useState, useMemo } from 'react';
import { MOCK_COURSES, MOCK_EVENTS } from '../constants';
import { Course, SchoolEvent, Assignment } from '../types';

interface CalendarItem {
  id: string;
  type: 'assignment' | 'event' | 'lecture' | 'meeting';
  title: string;
  courseCode?: string;
  time?: string;
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthYearString = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Map day names to JS getDay() indices
  const dayMap: { [key: string]: number } = {
    'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: { [day: number]: CalendarItem[] } = {};

    const totalDays = daysInMonth(year, month);

    for (let d = 1; d <= totalDays; d++) {
      days[d] = [];
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = new Date(year, month, d).getDay();

      // 1. Add Events & Holidays
      MOCK_EVENTS.forEach(event => {
        if (event.date === dateStr) {
          days[d].push({
            id: event.id,
            type: event.type === 'Holiday' ? 'event' : 'event',
            title: event.title
          });
        }
      });

      // 2. Add Assignments
      MOCK_COURSES.forEach(course => {
        course.assignments?.forEach(assignment => {
          if (assignment.dueDate === dateStr) {
            days[d].push({
              id: assignment.id,
              type: 'assignment',
              title: `${course.code}: ${assignment.title}`,
              courseCode: course.code
            });
          }
        });

        // 3. Add Lectures & Meetings
        course.blocks.forEach(block => {
          const scheduleParts = block.schedule.split(' ');
          const daysPart = scheduleParts[0]; // e.g. "Mon/Wed"
          const timePart = scheduleParts.slice(1).join(' ');

          const activeDays = daysPart.split('/').map(day => dayMap[day]);
          if (activeDays.includes(dayOfWeek)) {
            days[d].push({
              id: `${course.id}-lec-${d}`,
              type: 'lecture',
              title: `${course.code} Lecture`,
              time: timePart
            });

            // If it's a meeting day (using same schedule for simplicity)
            if (course.meetUrl) {
                days[d].push({
                    id: `${course.id}-meet-${d}`,
                    type: 'meeting',
                    title: `${course.code} Online`,
                    time: timePart
                });
            }
          }
        });
      });
    }

    return days;
  }, [currentDate]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{monthYearString}</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">University Academic Calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-100">
            <span className="material-icons">chevron_left</span>
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-all border border-slate-100">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {weekDays.map(day => (
            <div key={day} className="py-4 text-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{day}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-fr">
          {/* Empty cells for previous month */}
          {Array.from({ length: firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth()) }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[120px] p-2 bg-slate-50/30 border-b border-r border-slate-50"></div>
          ))}

          {/* Actual days */}
          {Object.entries(calendarData).map(([day, items]) => {
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), parseInt(day)).toDateString();
            
            return (
              <div key={day} className={`min-h-[140px] p-2 border-b border-r border-slate-100 transition-colors hover:bg-slate-50/50 group`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm font-black w-7 h-7 flex items-center justify-center rounded-lg transition-all ${isToday ? 'bg-emerald-800 text-white shadow-lg' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {day}
                  </span>
                  {items.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                
                <div className="space-y-1 overflow-hidden">
                  {items.slice(0, 4).map((item, idx) => (
                    <div 
                      key={item.id} 
                      className={`px-2 py-1 rounded-md text-[9px] font-bold leading-tight truncate shadow-sm animate-in fade-in slide-in-from-left-1 ${
                        item.type === 'assignment' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                        item.type === 'event' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        item.type === 'lecture' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                        'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}
                    >
                      {item.title}
                    </div>
                  ))}
                  {items.length > 4 && (
                    <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest pl-1">
                      + {items.length - 4} More
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4">
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignments</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Events / Holidays</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sky-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lectures</span>
          </div>
          <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Online Meetings</span>
          </div>
      </div>
    </div>
  );
};

export default Calendar;
