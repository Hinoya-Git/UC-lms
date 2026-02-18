
import React, { useState } from 'react';
import { MOCK_CLASSROOMS, MOCK_TAPS } from '../constants';

const CampusLife: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'taps'>('rooms');
  const [buildingFilter, setBuildingFilter] = useState<string>('All');

  const buildings = ['All', 'U', 'M', 'N', 'S', 'G', 'F'];
  
  const filteredRooms = MOCK_CLASSROOMS.filter(r => 
    buildingFilter === 'All' || r.building.startsWith(buildingFilter)
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('rooms')}
            className={`pb-4 px-2 font-bold transition-colors border-b-2 ${activeTab === 'rooms' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Classroom Availability
          </button>
          <button 
            onClick={() => setActiveTab('taps')}
            className={`pb-4 px-2 font-bold transition-colors border-b-2 ${activeTab === 'taps' ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Access Logs (Gate Taps)
          </button>
        </div>

        {activeTab === 'rooms' && (
          <div className="flex items-center gap-2 pb-4 md:pb-0">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Filter Building:</span>
             <div className="flex flex-wrap gap-1">
                {buildings.map(b => (
                  <button
                    key={b}
                    onClick={() => setBuildingFilter(b)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      buildingFilter === b 
                      ? 'bg-emerald-700 text-white shadow-md' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      {activeTab === 'rooms' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <div key={room.id} className={`bg-white p-5 rounded-3xl border ${room.status === 'In Use' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-200'} shadow-sm hover:shadow-md transition-all group`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl transition-colors ${room.status === 'In Use' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                  <span className="material-icons text-lg">{room.status === 'In Use' ? 'sensors' : 'meeting_room'}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  room.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                  room.status === 'In Use' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {room.status}
                </span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-800">{room.roomNumber}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.building}</p>
              </div>

              {room.status === 'In Use' && room.currentActivity && (
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 space-y-2 animate-in fade-in slide-in-from-top-1">
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                         {room.currentActivity.type === 'class' ? 'Lecture' : 'Event'}
                      </span>
                      <span className="text-xs font-black text-slate-700 truncate">{room.currentActivity.name}</span>
                   </div>
                   {room.currentActivity.instructor && (
                     <p className="text-[11px] text-slate-500 font-medium">Instructor: <span className="font-bold text-slate-700">{room.currentActivity.instructor}</span></p>
                   )}
                   <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <span className="material-icons text-[12px]">schedule</span>
                      {room.currentActivity.timeRange}
                   </p>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">Next Entry</span>
                  <span className="text-xs font-bold text-slate-600">{room.nextClass || 'N/A'}</span>
                </div>
                <button className="w-10 h-10 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors">
                  <span className="material-icons text-xl">info</span>
                </button>
              </div>
            </div>
          ))}
          {filteredRooms.length === 0 && (
            <div className="col-span-full py-24 text-center">
               <span className="material-icons text-7xl text-slate-100 mb-4">search_off</span>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No classrooms detected in this sector</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-50/50 border-b border-slate-200 flex justify-between items-center">
             <h3 className="font-black text-slate-800 uppercase tracking-tight">University Access History</h3>
             <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">Live Logs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Location Terminal</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Time & Date</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {MOCK_TAPS.map((tap) => (
                  <tr key={tap.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${tap.location.includes('Library') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500'}`}>
                          <span className="material-icons text-lg">{tap.location.includes('Library') ? 'local_library' : 'room'}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className={`font-bold ${tap.location.includes('Library') ? 'text-emerald-900' : 'text-slate-700'}`}>{tap.location}</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Campus Terminal 0{Math.floor(Math.random() * 9) + 1}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-500">{tap.timestamp}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        tap.status === 'In' ? 'bg-emerald-100 text-emerald-800 shadow-[0_2px_10px_-3px_rgba(16,185,129,0.3)]' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <span className="material-icons text-[14px]">{tap.status === 'In' ? 'login' : 'logout'}</span>
                        {tap.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50/50 border-t border-slate-200 text-center">
            <button className="bg-white px-8 py-3 rounded-2xl border border-slate-200 text-slate-700 font-black uppercase tracking-widest text-xs hover:border-emerald-300 hover:text-emerald-700 transition-all shadow-sm">
              Load Previous Access Logs
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusLife;
