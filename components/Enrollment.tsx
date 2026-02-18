
import React, { useState } from 'react';
import { MOCK_COURSES } from '../constants';
import { Course, EnrollmentEntry } from '../types';

interface CourseListProps {
  enrolledBlocks: EnrollmentEntry[];
  onViewDetail: (courseId: string) => void;
  onStartEnrollment: (courseId: string) => void;
}

const CourseList: React.FC<CourseListProps> = ({ enrolledBlocks, onViewDetail, onStartEnrollment }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sortedCourses = [...MOCK_COURSES].sort((a, b) => {
    const aEnrolled = enrolledBlocks.some(eb => eb.courseId === a.id);
    const bEnrolled = enrolledBlocks.some(eb => eb.courseId === b.id);
    if (aEnrolled && !bEnrolled) return -1;
    if (!aEnrolled && bEnrolled) return 1;
    return 0;
  });

  const filteredCourses = sortedCourses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Academic Catalog</h2>
          <p className="text-slate-500 text-sm font-medium">Browse and select subjects for your current term</p>
        </div>
        <div className="relative group">
          <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors">search</span>
          <input 
            type="text"
            placeholder="Search catalog..."
            className="pl-12 pr-6 py-4 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none w-full md:w-80 shadow-sm transition-all font-medium text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledBlocks.some(eb => eb.courseId === course.id);

          return (
            <div key={course.id} className={`bg-white rounded-[2.5rem] border-2 transition-all flex flex-col group relative overflow-hidden ${isEnrolled ? 'border-emerald-500/30 shadow-2xl scale-105 z-10' : 'border-slate-50 shadow-md hover:border-emerald-200'}`}>
              {isEnrolled && (
                 <div className="absolute top-0 right-0 p-4">
                    <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                       <span className="material-icons text-xl font-bold">check</span>
                    </div>
                 </div>
              )}
              
              <div className="p-8 pb-4 flex-1">
                <div className="flex justify-between items-center mb-6">
                   <span className="text-[10px] font-black text-emerald-800 px-4 py-1.5 bg-emerald-50 rounded-full uppercase tracking-[0.2em] border border-emerald-100 shadow-sm">{course.code}</span>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.credits} ACADEMIC UNITS</span>
                </div>
                
                <div className="mb-4">
                  <h3 className="font-black text-xl text-slate-800 mb-2 group-hover:text-emerald-900 transition-colors leading-tight">{course.name}</h3>
                  <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${isEnrolled ? 'text-emerald-600' : 'text-slate-400'}`}>
                     <div className={`w-2 h-2 rounded-full ${isEnrolled ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                     {isEnrolled ? 'Confirmed in Schedule' : 'Available for Selection'}
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 line-clamp-3">{course.description}</p>
              </div>
              
              <div className="p-8 pt-0 mt-auto flex gap-4">
                <button
                  onClick={() => onViewDetail(course.id)}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border-2 border-slate-100 text-slate-600 hover:bg-slate-50 active:scale-95 flex items-center justify-center gap-2"
                >
                  <span className="material-icons text-sm">visibility</span>
                  Details
                </button>
                {!isEnrolled && (
                  <button
                    onClick={() => onStartEnrollment(course.id)}
                    className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all bg-emerald-800 text-white hover:bg-emerald-950 shadow-xl active:scale-95 flex items-center justify-center gap-2"
                  >
                    <span className="material-icons text-sm">how_to_reg</span>
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourseList;
