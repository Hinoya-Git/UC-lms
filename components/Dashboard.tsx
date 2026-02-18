
import React from 'react';
import { MOCK_STUDENT, MOCK_COURSES, MOCK_EVENTS } from '../constants';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-green-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome back, {MOCK_STUDENT.name}!</h2>
          <p className="text-emerald-100 opacity-90 max-w-md">
            You have 2 lectures today and 1 assignment due in Philosophy of Mind tomorrow.
          </p>
          <button className="mt-6 px-6 py-2 bg-white text-emerald-800 rounded-full font-semibold shadow-sm hover:bg-emerald-50 transition-colors">
            View Schedule
          </button>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center min-w-[100px]">
            <p className="text-2xl font-bold">3.85</p>
            <p className="text-xs uppercase tracking-wider opacity-70">Current GPA</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl text-center min-w-[100px]">
            <p className="text-2xl font-bold">14</p>
            <p className="text-xs uppercase tracking-wider opacity-70">Credits</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Today's Lectures</h3>
            <button className="text-emerald-700 text-sm font-semibold hover:underline">See full calendar</button>
          </div>
          <div className="grid gap-4">
            {MOCK_COURSES.slice(0, 3).map((course) => (
              <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
                    <span className="material-icons">auto_stories</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{course.name}</h4>
                    {/* Fix: Access the schedule from the first available block as the Course type does not have a top-level schedule property */}
                    <p className="text-sm text-slate-500">{course.blocks[0]?.schedule || 'TBA'} • {course.room}</p>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Ongoing
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800">University Events</h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
            {MOCK_EVENTS.map((event) => (
              <div key={event.id} className="p-5 hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center bg-emerald-50 text-emerald-800 w-14 h-14 rounded-xl font-bold shrink-0">
                    <span className="text-xs uppercase font-medium">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg">{new Date(event.date).getDate()}</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800 line-clamp-1">{event.title}</h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-emerald-800 rounded-2xl p-6 text-white text-center">
            <span className="material-icons text-3xl mb-2">stars</span>
            <p className="font-medium mb-3">Join the Academic Council</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
