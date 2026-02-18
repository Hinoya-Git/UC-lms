
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Student, Course, EnrollmentEntry, CourseBlock, CourseSubView, Module, Assignment } from './types';
import { MOCK_STUDENT, MOCK_COURSES } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CourseList from './components/Enrollment';
import CampusLife from './components/CampusLife';
import AssignmentHelper from './components/AssignmentHelper';
import Calendar from './components/Calendar';

const App: React.FC = () => {
  const [currentView, setView] = useState<View>('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeCourseTab, setActiveCourseTab] = useState<CourseSubView>('home');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'BDO' | 'BPI' | 'Card' | 'Cashier' | null>(null);

  const [enrolledBlocks, setEnrolledBlocks] = useState<EnrollmentEntry[]>(() => {
    const saved = localStorage.getItem('edu_enrolled_blocks');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [student, setStudent] = useState<Student>(() => {
    const saved = localStorage.getItem('edu_profile');
    try {
      return saved ? JSON.parse(saved) : MOCK_STUDENT;
    } catch {
      return MOCK_STUDENT;
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Student>(student);
  const profileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('edu_profile', JSON.stringify(student));
  }, [student]);

  useEffect(() => {
    localStorage.setItem('edu_enrolled_blocks', JSON.stringify(enrolledBlocks));
  }, [enrolledBlocks]);

  const handleSave = () => {
    setStudent(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(student);
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const checkScheduleConflict = (newBlock: CourseBlock) => {
    return enrolledBlocks.some(eb => {
      const course = MOCK_COURSES.find(c => c.id === eb.courseId);
      const block = course?.blocks.find(b => b.id === eb.blockId);
      return block?.schedule === newBlock.schedule;
    });
  };

  const addEnrollment = (courseId: string, blockId: string) => {
    setEnrolledBlocks(prev => {
      if (prev.some(eb => eb.courseId === courseId)) {
        return prev.map(eb => eb.courseId === courseId ? { courseId, blockId } : eb);
      }
      return [...prev, { courseId, blockId }];
    });
  };

  const calculateTotal = () => {
    return enrolledBlocks.reduce((total, eb) => {
      const course = MOCK_COURSES.find(c => c.id === eb.courseId);
      return total + (course ? course.pricePerUnit * course.credits : 0);
    }, 0);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'enrollment':
        return (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">University Enrollment</h2>
                  <p className="text-slate-500 text-xs font-bold">Priority Enrollment Session • Fall Semester 2024</p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                   <span className="text-[10px] font-black uppercase text-emerald-800 tracking-widest">Enrolled Units</span>
                   <p className="text-xl font-black text-emerald-700">{enrolledBlocks.length * 3}</p>
                </div>
             </div>
             <CourseList 
                enrolledBlocks={enrolledBlocks} 
                onViewDetail={(id) => { setSelectedCourseId(id); setView('course-detail'); }}
                onStartEnrollment={(id) => { setSelectedCourseId(id); setView('enrollment-wizard'); }}
              />
          </div>
        );
      case 'courses':
        const enrolledCourses = MOCK_COURSES.filter(c => enrolledBlocks.some(eb => eb.courseId === c.id));
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">My Subjects</h2>
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-200">Total: {enrolledCourses.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                const blockEntry = enrolledBlocks.find(eb => eb.courseId === course.id);
                const block = course.blocks.find(b => b.id === blockEntry?.blockId);
                return (
                  <button 
                    key={course.id}
                    onClick={() => { setSelectedCourseId(course.id); setView('course-dashboard'); setActiveCourseTab('home'); setActiveModuleId(null); setActiveAssignmentId(null); }}
                    className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all text-left flex flex-col group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/50 -mr-8 -mt-8 rounded-full transition-all group-hover:scale-150"></div>
                    <div className="flex justify-between items-start mb-6 relative">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-emerald-700 px-3 py-1 bg-emerald-50 rounded-full uppercase tracking-widest w-fit mb-2">3rd Year</span>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{course.code}-{block?.section}</span>
                      </div>
                      <span className="material-icons text-emerald-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">arrow_forward</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-emerald-800 transition-colors">{course.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                       <span className="material-icons text-sm">schedule</span>
                       {block?.schedule}
                    </p>
                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between relative">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.credits} Units • {course.room}</span>
                       <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>)}
                       </div>
                    </div>
                  </button>
                );
              })}
              {enrolledCourses.length === 0 && (
                <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-inner">
                   <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="material-icons text-4xl text-emerald-600">school</span>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800">No active enrollments</h3>
                   <p className="text-slate-500 mt-2 mb-8 max-w-xs mx-auto">Enroll in subjects from the catalog to start your academic journey this semester.</p>
                   <button onClick={() => setView('enrollment')} className="px-8 py-3 bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg">Go to Enrollment</button>
                </div>
              )}
            </div>
          </div>
        );
      case 'course-dashboard':
        const dashCourse = MOCK_COURSES.find(c => c.id === selectedCourseId);
        if (!dashCourse) return <div>Course error</div>;

        return (
          <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-800 text-white rounded-2xl shadow-lg">
                    <span className="material-icons text-2xl">auto_stories</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{dashCourse.code} Dashboard</h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dashCourse.name}</p>
                  </div>
                </div>
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-hide">
                  {(['home', 'modules', 'assignments', 'grades', 'meet'] as CourseSubView[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCourseTab(tab)}
                      className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold transition-all capitalize whitespace-nowrap ${
                        activeCourseTab === tab ? 'bg-emerald-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-icons text-lg">
                        {tab === 'home' ? 'home' : tab === 'modules' ? 'view_module' : tab === 'assignments' ? 'assignment' : tab === 'grades' ? 'grade' : 'video_call'}
                      </span>
                      <span className="text-xs uppercase tracking-widest">{tab}</span>
                    </button>
                  ))}
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm min-h-[500px] animate-in slide-in-from-bottom-2 duration-300">
                {activeCourseTab === 'home' && (
                  <div className="flex flex-col lg:flex-row gap-16">
                     <div className="flex-1 space-y-8">
                        <div>
                          <h3 className="text-4xl font-black text-slate-800 mb-4">{dashCourse.name}</h3>
                          <p className="text-slate-600 leading-relaxed text-lg font-medium">{dashCourse.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Credits</span>
                              <p className="text-2xl font-black text-slate-800">{dashCourse.credits}.0 Units</p>
                           </div>
                           <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Classroom</span>
                              <p className="text-2xl font-black text-slate-800">{dashCourse.room}</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">About this Course</h4>
                           <p className="text-slate-500 text-sm leading-relaxed">
                              This course provides a comprehensive exploration of the fundamentals and advanced applications within the field. 
                              Students will engage in rigorous theoretical study paired with practical, hands-on lab sessions to ensure a well-rounded mastery of the subject matter.
                           </p>
                        </div>
                     </div>
                     <div className="lg:w-96 shrink-0">
                        <div className="bg-emerald-900 rounded-[2rem] p-8 text-white sticky top-8 shadow-2xl overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700"></div>
                           <h4 className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-8 relative">Primary Instructor</h4>
                           <div className="relative text-center">
                              <img src={dashCourse.detailedInstructor?.photo} className="w-32 h-32 rounded-3xl mx-auto border-4 border-emerald-800 shadow-2xl mb-6 object-cover" />
                              <h5 className="text-2xl font-black mb-1">{dashCourse.detailedInstructor?.name}</h5>
                              <p className="text-emerald-300 text-xs font-bold uppercase tracking-widest mb-6">{dashCourse.detailedInstructor?.email}</p>
                              <div className="h-px bg-emerald-800 w-full mb-6"></div>
                              <p className="text-xs text-emerald-100/80 leading-relaxed italic text-center px-4">"{dashCourse.detailedInstructor?.bio}"</p>
                              <button className="mt-8 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg">Contact via Email</button>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeCourseTab === 'modules' && (
                  <div className="space-y-6">
                    {!activeModuleId ? (
                      <div className="grid gap-6">
                        {dashCourse.modules?.map((m, idx) => (
                          <button 
                            key={m.id} 
                            onClick={() => setActiveModuleId(m.id)}
                            className="p-8 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between hover:bg-emerald-50 hover:border-emerald-200 transition-all group"
                          >
                            <div className="flex items-center gap-6">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-black text-xl text-emerald-800 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">0{idx+1}</div>
                               <div className="text-left">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Module Title</span>
                                  <h4 className="text-lg font-bold text-slate-800 group-hover:text-emerald-900">{m.title}</h4>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Module</span>
                               <span className="material-icons text-slate-300 group-hover:text-emerald-700 transition-colors">arrow_forward_ios</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center justify-between mb-8">
                           <button onClick={() => setActiveModuleId(null)} className="flex items-center gap-2 text-emerald-700 font-black uppercase tracking-widest text-[10px] hover:text-emerald-900">
                             <span className="material-icons text-sm">arrow_back</span> Back to Modules
                           </button>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reading View</span>
                        </div>
                        {(() => {
                           const mod = dashCourse.modules?.find(m => m.id === activeModuleId);
                           const modIdx = dashCourse.modules?.findIndex(m => m.id === activeModuleId) ?? 0;
                           return (
                             <div className="space-y-12 max-w-4xl mx-auto">
                                <div className="text-center">
                                   <h3 className="text-4xl font-black text-slate-800 mb-2">{mod?.title}</h3>
                                   <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Section {modIdx + 1}</p>
                                </div>
                                <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 leading-relaxed text-slate-700 text-lg font-medium shadow-inner">
                                   {mod?.content}
                                   <div className="mt-8 p-8 bg-white/50 rounded-2xl border border-white">
                                      <h5 className="font-black text-sm uppercase text-slate-800 mb-4">Summary Points</h5>
                                      <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                                         <li>Understanding the core methodology described in the session.</li>
                                         <li>Application of these principles in real-world scenarios.</li>
                                         <li>Comparative analysis of alternative approaches.</li>
                                      </ul>
                                   </div>
                                </div>
                                <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                                   <button 
                                      disabled={modIdx === 0}
                                      onClick={() => setActiveModuleId(dashCourse.modules?.[modIdx-1]?.id || null)}
                                      className="px-8 py-3 bg-white border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 hover:bg-slate-50 transition-all"
                                   >Previous</button>
                                   <span className="text-xs font-black text-slate-300">{modIdx + 1} of {dashCourse.modules?.length}</span>
                                   <button 
                                      disabled={modIdx === (dashCourse.modules?.length || 1) - 1}
                                      onClick={() => setActiveModuleId(dashCourse.modules?.[modIdx+1]?.id || null)}
                                      className="px-8 py-3 bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] disabled:opacity-30 hover:bg-emerald-900 transition-all shadow-lg"
                                   >Next Module</button>
                                </div>
                             </div>
                           )
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {activeCourseTab === 'assignments' && (
                  <div className="space-y-6">
                    {!activeAssignmentId ? (
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor Coursework</h4>
                           <div className="flex gap-4">
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-red-500"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Missed</span>
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-500"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Due Soon</span>
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-500"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Submitted</span>
                           </div>
                        </div>
                        {dashCourse.assignments?.map((a) => (
                          <button 
                            key={a.id} 
                            onClick={() => setActiveAssignmentId(a.id)}
                            className="p-8 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-between hover:bg-white hover:shadow-xl hover:border-emerald-200 transition-all group"
                          >
                            <div className="flex items-center gap-6">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                                 a.status === 'submitted' ? 'bg-green-100 text-green-700' : 
                                 a.status === 'missed' ? 'bg-red-100 text-red-700' : 
                                 a.status === 'near-due' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'
                               }`}>
                                  <span className="material-icons text-2xl">{a.type === 'quiz' ? 'quiz' : 'description'}</span>
                               </div>
                               <div className="text-left">
                                  <h5 className="text-lg font-bold text-slate-800 group-hover:text-emerald-900 transition-colors">{a.title}</h5>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Deadline: {a.dueDate}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-6">
                               {a.score && (
                                 <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Grade</p>
                                    <p className="text-xl font-black text-emerald-800">{a.score}%</p>
                                 </div>
                               )}
                               <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${
                                 a.status === 'submitted' ? 'bg-green-700 text-white' : 
                                 a.status === 'missed' ? 'bg-red-700 text-white' : 
                                 a.status === 'near-due' ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-500'
                               }`}>
                                 {a.status === 'none' ? 'Incomplete' : a.status}
                               </span>
                            </div>
                          </button>
                        ))}
                        <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-700 shadow-sm border border-emerald-100">
                                 <span className="material-icons">check_circle_outline</span>
                              </div>
                              <div className="text-left">
                                 <h5 className="text-lg font-bold text-emerald-900">Course Attendance</h5>
                                 <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Status: Regular Attendance (95%)</p>
                              </div>
                           </div>
                           <button className="px-6 py-2 bg-emerald-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg opacity-0 group-hover:opacity-100 transition-all">View Log</button>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in slide-in-from-right-4 duration-300">
                        <button onClick={() => setActiveAssignmentId(null)} className="flex items-center gap-2 text-emerald-700 font-black uppercase tracking-widest text-[10px] mb-8 hover:text-emerald-900">
                          <span className="material-icons text-sm">arrow_back</span> Back to Coursework
                        </button>
                        {(() => {
                           const ass = dashCourse.assignments?.find(a => a.id === activeAssignmentId);
                           return (
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-8">
                                   <div>
                                      <h3 className="text-3xl font-black text-slate-800 mb-2">{ass?.title}</h3>
                                      <div className="flex gap-4">
                                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Type: {ass?.type}</span>
                                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Points: 100</span>
                                      </div>
                                   </div>
                                   <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 text-slate-600 font-medium leading-relaxed shadow-inner">
                                      <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4">Submission Instructions</h4>
                                      {ass?.type === 'quiz' ? 'This is a time-sensitive assessment. Once you click "Start Quiz", you will have 30 minutes to complete all sections. Ensure a stable internet connection.' : 
                                       ass?.type === 'file' ? 'Upload your final project documentation in PDF format. Files must not exceed 20MB. Make sure to include your name and student ID in the document footer.' : 
                                       'Compose a 500-word reflection based on this week\'s lecture and readings. You may use the text entry box below.'}
                                   </div>
                                   <div className="p-10 border-4 border-dashed border-slate-100 rounded-[3rem] bg-white text-center space-y-6">
                                      {ass?.type === 'text' ? (
                                        <textarea className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 focus:outline-none font-medium text-slate-700" placeholder="Begin typing your entry here..." rows={10}></textarea>
                                      ) : ass?.type === 'file' ? (
                                        <div className="py-12 group cursor-pointer">
                                           <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                              <span className="material-icons text-3xl">cloud_upload</span>
                                           </div>
                                           <p className="text-slate-500 font-bold">Drag and drop submission files or <span className="text-emerald-700 underline">browse computer</span></p>
                                        </div>
                                      ) : (
                                        <div className="py-10">
                                          <button className="px-12 py-5 bg-emerald-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition-all scale-110">Start Quiz Assessment</button>
                                        </div>
                                      )}
                                      <button className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">Confirm & Submit Work</button>
                                   </div>
                                </div>
                                <div className="space-y-6">
                                   <div className="bg-emerald-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12"></div>
                                      <h4 className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-6 relative">Submission Portal</h4>
                                      <div className="space-y-6 relative">
                                         <div className="flex items-center gap-4">
                                            <div className={`w-3 h-3 rounded-full ${ass?.status === 'submitted' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></div>
                                            <div className="flex flex-col">
                                               <span className="text-sm font-black tracking-tight">{ass?.status === 'submitted' ? 'SUBMITTED' : 'NOT SUBMITTED'}</span>
                                               {ass?.status === 'submitted' && <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">Verified on {ass.submissionDate}</span>}
                                            </div>
                                         </div>
                                         <div className="h-px bg-emerald-800 w-full"></div>
                                         <div className="space-y-4">
                                            <div>
                                               <p className="text-[9px] font-black uppercase text-emerald-400 mb-1">Due Date</p>
                                               <p className="text-sm font-bold">{ass?.dueDate}</p>
                                            </div>
                                            <div>
                                               <p className="text-[9px] font-black uppercase text-emerald-400 mb-1">Max Grade</p>
                                               <p className="text-sm font-bold">100 / 100</p>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </div>
                           )
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {activeCourseTab === 'grades' && (
                  <div className="space-y-12">
                     <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner">
                        <table className="w-full text-left">
                           <thead className="bg-slate-50/50 border-b border-slate-200">
                              <tr>
                                 <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Assessment Title</th>
                                 <th className="px-10 py-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Performance Score</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                              {dashCourse.assignments?.filter(a => a.status === 'submitted').map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/30 transition-colors group">
                                   <td className="px-10 py-6">
                                      <div className="flex items-center gap-4">
                                         <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                         <span className="font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">{a.title}</span>
                                      </div>
                                   </td>
                                   <td className="px-10 py-6 text-right">
                                      <span className="font-black text-xl text-emerald-800">{a.score}%</span>
                                   </td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Accumulated</p>
                           <p className="text-4xl font-black text-slate-800">475 / 500</p>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Class Average</p>
                           <p className="text-4xl font-black text-slate-800">95.0%</p>
                        </div>
                        <div className="md:col-span-2 p-10 bg-emerald-900 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full -mr-24 -mt-24 transition-transform group-hover:scale-125"></div>
                           <div className="relative">
                              <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest mb-4">Current Tentative Grade</p>
                              <div className="flex items-end gap-6">
                                 <p className="text-7xl font-black leading-none">A+</p>
                                 <div className="flex flex-col">
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Pass Status: Verified</span>
                                    <span className="text-lg font-black text-white">4.0 GPA Value</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeCourseTab === 'meet' && (
                  <div className="flex flex-col items-center justify-center min-h-[450px] py-20 text-center space-y-10 animate-in zoom-in duration-300">
                     <div className="relative">
                        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-800 shadow-inner relative z-10">
                           <span className="material-icons text-6xl">video_camera_front</span>
                        </div>
                        <div className="absolute -inset-4 bg-emerald-50 rounded-full animate-ping opacity-30"></div>
                     </div>
                     <div className="max-w-md">
                        <h3 className="text-3xl font-black text-slate-800 mb-4">Synchronous Lecture Room</h3>
                        <p className="text-slate-500 font-medium leading-relaxed">The instructor has scheduled a live session. Ensure your microphone and camera are ready before joining the meeting.</p>
                     </div>
                     <a 
                        href={dashCourse.meetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-12 py-5 bg-emerald-800 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-2xl flex items-center gap-4 scale-110 active:scale-100"
                     >
                        <span className="material-icons">meeting_room</span>
                        Join Virtual Session
                     </a>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meeting ID: {dashCourse.code}-LIVE-S24</p>
                  </div>
                )}
             </div>
          </div>
        );
      case 'course-detail':
        const detailCourse = MOCK_COURSES.find(c => c.id === selectedCourseId);
        if (!detailCourse) return <div>Course not found</div>;
        return (
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-emerald-950 p-12 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
              <div className="flex justify-between items-start relative">
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 block">{detailCourse.code} Catalog Entry</span>
                  <h2 className="text-5xl font-black mb-4 leading-tight">{detailCourse.name}</h2>
                  <div className="flex items-center gap-4">
                     <img src={detailCourse.detailedInstructor?.photo} className="w-8 h-8 rounded-lg" />
                     <p className="text-emerald-100 font-bold uppercase text-xs tracking-widest">Lead: {detailCourse.instructor}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-black mb-1">₱{detailCourse.pricePerUnit.toLocaleString()}</p>
                  <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest">{detailCourse.credits} Academic Units</p>
                </div>
              </div>
            </div>
            <div className="p-12 space-y-12">
              <div className="grid md:grid-cols-3 gap-12">
                 <div className="md:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Curriculum Overview</h4>
                      <p className="text-xl text-slate-700 font-medium leading-relaxed">{detailCourse.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 rounded-2xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Schedule Range</span>
                          <span className="text-sm font-bold text-slate-700">Mon - Fri Sessions</span>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-2xl">
                          <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Primary Room</span>
                          <span className="text-sm font-bold text-slate-700">{detailCourse.room} Lab</span>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 shadow-sm">
                       <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-4 text-center">Enrollment Progress</h5>
                       <div className="w-full bg-white h-4 rounded-full overflow-hidden border border-emerald-200">
                          <div className="bg-emerald-600 h-full w-[85%]"></div>
                       </div>
                       <p className="text-[10px] font-bold text-emerald-700 mt-4 text-center uppercase tracking-widest">85% Capacity Reached</p>
                    </div>
                    <button 
                      onClick={() => setView('enrollment-wizard')}
                      className="w-full py-5 bg-emerald-800 text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-emerald-900 transition-all shadow-xl scale-105 active:scale-100"
                    >
                      Proceed to Select Block
                    </button>
                 </div>
              </div>
            </div>
          </div>
        );
      case 'enrollment-wizard':
        const wizardCourse = MOCK_COURSES.find(c => c.id === selectedCourseId);
        if (!wizardCourse) return <div>Course selection error</div>;
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-4 duration-500">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">Select Section Block</h2>
                <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">Configuring {wizardCourse.code} for Alex Sterling</p>
             </div>

             <div className="grid gap-6">
                {wizardCourse.blocks.map(b => {
                  const isConflict = checkScheduleConflict(b);
                  const isFull = b.enrolled >= b.capacity;
                  const isAlreadyEnrolled = enrolledBlocks.some(eb => eb.courseId === wizardCourse.id && eb.blockId === b.id);

                  return (
                    <div 
                      key={b.id} 
                      className={`relative p-8 rounded-[2.5rem] border-2 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                        isAlreadyEnrolled ? 'bg-emerald-50 border-emerald-400 shadow-xl ring-8 ring-emerald-500/5' :
                        isConflict ? 'bg-red-50/50 border-red-100 opacity-60' : 
                        'bg-white border-slate-100 hover:border-emerald-200 hover:shadow-lg'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="text-2xl font-black text-slate-800 tracking-tighter">{wizardCourse.code}-{b.section}</h4>
                          {isAlreadyEnrolled && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-200 px-3 py-1 rounded-full">ACTIVE SELECTION</span>}
                          {isFull && <span className="text-[10px] font-black uppercase tracking-widest text-red-700 bg-red-100 px-3 py-1 rounded-full">SECTION FULL</span>}
                        </div>
                        <div className="flex flex-wrap gap-6 text-sm">
                           <p className="font-bold text-slate-600 flex items-center gap-2">
                             <span className="material-icons text-emerald-600 text-lg">event_available</span>
                             {b.schedule}
                           </p>
                           <p className="font-bold text-slate-400 flex items-center gap-2">
                             <span className="material-icons text-lg">person_outline</span>
                             Prof. {b.instructor}
                           </p>
                        </div>
                      </div>
                      
                      <button 
                        disabled={isConflict || isFull || isAlreadyEnrolled}
                        onClick={() => addEnrollment(wizardCourse.id, b.id)}
                        className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
                          isAlreadyEnrolled ? 'bg-emerald-800 text-white shadow-inner scale-95 opacity-50' :
                          isConflict || isFull ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-white border-2 border-emerald-700 text-emerald-800 hover:bg-emerald-700 hover:text-white shadow-md'
                        }`}
                      >
                        {isAlreadyEnrolled ? 'Block Selected' : isFull ? 'Capacity Reached' : isConflict ? 'Time Conflict' : 'Select This Section'}
                      </button>
                    </div>
                  )
                })}
             </div>

             <div className="bg-emerald-950 p-10 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full"></div>
                <div className="relative">
                  <h4 className="text-2xl font-black mb-1">Session Summary</h4>
                  <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest">Enrolled Subjects: {enrolledBlocks.length}</p>
                </div>
                <div className="flex gap-4 relative">
                  <button onClick={() => setView('enrollment')} className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">Add More Subjects</button>
                  <button onClick={() => setView('payment')} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl">Confirm & Checkout</button>
                </div>
             </div>
          </div>
        );
      case 'payment':
        const totalAmount = calculateTotal();
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="text-center">
                <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Tuition Settlement</h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Transaction Ref: UC-TXN-{Date.now().toString().slice(-6)}</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-6">
                   <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative">
                      <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-8 border-b border-slate-100 pb-4">Assessment Slip</h4>
                      <div className="space-y-4">
                        {enrolledBlocks.map(eb => {
                           const course = MOCK_COURSES.find(c => c.id === eb.courseId);
                           return (
                             <div key={eb.courseId} className="flex justify-between items-center py-2">
                                <div className="flex flex-col">
                                   <span className="font-black text-slate-800 text-sm">{course?.code}</span>
                                   <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{course?.name}</span>
                                </div>
                                <span className="font-black text-slate-800">₱{(course ? course.pricePerUnit * course.credits : 0).toLocaleString()}</span>
                             </div>
                           )
                        })}
                      </div>
                      <div className="mt-10 pt-10 border-t-4 border-double border-slate-100 flex justify-between items-center">
                         <div className="flex flex-col">
                            <span className="font-black text-emerald-800 uppercase text-[10px] tracking-widest">Total Assessment</span>
                            <span className="text-xs text-slate-400 font-bold italic">Inclusive of all miscellaneous fees</span>
                         </div>
                         <span className="text-4xl font-black text-emerald-900 tracking-tighter">₱{totalAmount.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-4">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payment Method</h4>
                   {(['GCash', 'BDO', 'BPI', 'Card', 'Cashier'] as const).map(method => (
                     <button 
                        key={method} 
                        onClick={() => setPaymentMethod(method)}
                        className={`w-full p-6 rounded-3xl border-2 font-black uppercase tracking-widest text-[10px] flex items-center justify-between transition-all ${paymentMethod === method ? 'bg-emerald-950 text-white border-emerald-900 shadow-xl scale-105' : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-200'}`}
                     >
                        {method}
                        <span className="material-icons text-lg">{method === 'Cashier' ? 'account_balance' : 'wallet'}</span>
                     </button>
                   ))}
                   {paymentMethod && (
                     <button 
                        onClick={() => { alert('Tuition Settle successfully! You are now enrolled.'); setView('courses'); }}
                        className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs mt-8 shadow-2xl hover:bg-emerald-500 transition-all scale-110 active:scale-100"
                     >Finalize Payment</button>
                   )}
                </div>
             </div>
          </div>
        );
      case 'campus':
        return <CampusLife />;
      case 'ai-helper':
        return <AssignmentHelper />;
      case 'calendar':
        return <Calendar />;
      case 'profile':
        return (
          <div className="max-w-3xl mx-auto bg-white rounded-[3rem] border border-slate-200 overflow-hidden shadow-2xl animate-in slide-in-from-bottom-6 duration-500">
            <div className="h-48 bg-emerald-950 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900 to-transparent"></div>
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
               {!isEditing ? (
                 <button 
                  onClick={() => { setEditForm(student); setIsEditing(true); }}
                  className="absolute top-8 right-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-lg border border-white/10"
                 >
                    <span className="material-icons text-lg">settings</span>
                    Modify Account
                 </button>
               ) : (
                 <div className="absolute top-8 right-8 flex gap-3">
                    <button 
                      onClick={handleSave}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-2xl border border-emerald-400"
                    >
                      <span className="material-icons text-sm">save</span>
                      Commit
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl backdrop-blur-xl font-black uppercase tracking-widest text-xs transition-all border border-white/10"
                    >
                      Abort
                    </button>
                 </div>
               )}
            </div>
            <div className="px-12 pb-12 -mt-20 text-center relative z-10">
              <div className="relative inline-block mb-6">
                <div className="w-40 h-40 rounded-[2.5rem] border-8 border-white bg-slate-200 shadow-2xl overflow-hidden relative">
                   <img 
                    src={isEditing ? editForm.avatar : student.avatar} 
                    className="w-full h-full object-cover" 
                    alt="Profile"
                   />
                </div>
                {(isEditing ? editForm.isOnline : student.isOnline) && <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>}
                {isEditing && (
                  <button 
                    onClick={() => profileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-800 text-white rounded-2xl border-4 border-white shadow-xl hover:bg-emerald-900 transition-all flex items-center justify-center"
                  >
                    <span className="material-icons">add_a_photo</span>
                    <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
                  </button>
                )}
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">{student.name}</h2>
              <p className="text-emerald-700 font-bold uppercase text-[10px] tracking-[0.2em] mb-4">{student.major}</p>

              {/* Status Section */}
              <div className="flex items-center justify-center gap-6 py-6 border-y border-slate-50 my-6">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">Availability Status</span>
                    <button 
                      disabled={!isEditing}
                      onClick={() => setEditForm({...editForm, isOnline: !editForm.isOnline})}
                      className={`w-14 h-7 rounded-full transition-all relative p-1 ${
                        (isEditing ? editForm.isOnline : student.isOnline) ? 'bg-emerald-500' : 'bg-slate-300'
                      } ${!isEditing ? 'opacity-80' : 'cursor-pointer hover:shadow-lg'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md transform ${(isEditing ? editForm.isOnline : student.isOnline) ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                 </div>
              </div>
              
              <div className="mt-8 text-left max-w-xl mx-auto">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Student Statement (Bio)</h4>
                {isEditing ? (
                  <textarea 
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    rows={5}
                    className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-200 text-sm text-slate-700 font-medium focus:ring-4 focus:ring-emerald-500/10 focus:outline-none resize-none transition-all shadow-inner"
                    placeholder="Express your academic goals and interests..."
                  />
                ) : (
                  <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner relative group">
                    <span className="material-icons absolute top-4 left-4 text-emerald-100 text-4xl">format_quote</span>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium relative z-10 italic">
                      {student.bio || 'Please provide a bio to personalize your profile.'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 text-left">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm opacity-60">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-widest">Permanent ID</p>
                  <p className="font-mono text-xs font-bold text-slate-800">{student.id}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm opacity-60">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-widest">DOB Registry</p>
                  <p className="font-mono text-xs font-bold text-slate-800">{student.birthdate}</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-widest">Standing</p>
                  <p className="font-bold text-slate-800 text-sm">{student.year}{student.year === 1 ? 'st' : student.year === 2 ? 'nd' : student.year === 3 ? 'rd' : 'th'} Year</p>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[9px] uppercase text-slate-400 font-black mb-1 tracking-widest">Cum. GPA</p>
                  <p className="font-black text-emerald-800 text-sm">{student.gpa} / 4.0</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
