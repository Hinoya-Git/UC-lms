
import React, { useState, useRef, useEffect } from 'react';
import { View, Notification } from '../types';
import { UC_LOGO, MOCK_NOTIFICATIONS } from '../constants';

interface LayoutProps {
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Ordered as requested: Enrollment just above Profile
  const navItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'courses', icon: 'auto_stories', label: 'Courses' },
    { id: 'campus', icon: 'domain', label: 'Campus' },
    { id: 'calendar', icon: 'calendar_month', label: 'Calendar' },
    { id: 'ai-helper', icon: 'psychology', label: 'AI Assistant' },
    { id: 'enrollment', icon: 'library_add', label: 'Enrollment' },
    { id: 'profile', icon: 'person', label: 'Profile' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    if (currentView === 'course-dashboard') {
      setView('courses');
    } else if (currentView === 'course-detail' || currentView === 'enrollment-wizard' || currentView === 'payment') {
      setView('enrollment');
    } else if (currentView !== 'dashboard') {
      setView('dashboard');
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'assignment': return 'assignment';
      case 'event': return 'event';
      case 'suspension': return 'warning';
      case 'system': return 'settings';
      default: return 'notifications';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar with Transition Logic */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-emerald-950 text-white flex flex-col hidden md:flex border-r border-emerald-900 transition-all duration-300 ease-in-out relative group shadow-2xl z-30`}>
        <div className="p-4 flex items-center justify-between h-20">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shrink-0 shadow-lg">
              <img src={UC_LOGO} alt="UC Logo" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-sm font-bold tracking-tight">University of the Cordilleras</span>
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Student Portal</span>
              </div>
            )}
          </div>
        </div>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-500 transition-all z-40 border border-emerald-400"
        >
          <span className="material-icons text-sm">{isCollapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
        
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as View)}
              className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all group relative ${
                (currentView === item.id || (item.id === 'courses' && currentView === 'course-dashboard') || (item.id === 'enrollment' && (currentView === 'course-detail' || currentView === 'enrollment-wizard' || currentView === 'payment')))
                ? 'bg-emerald-600/30 text-white border border-emerald-500/50 shadow-inner' 
                : 'text-emerald-200/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`material-icons text-xl transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'mx-auto' : ''}`}>{item.icon}</span>
              {!isCollapsed && <span className="font-semibold text-sm whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-emerald-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg border border-emerald-700">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 bg-emerald-900/40 border-t border-emerald-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-emerald-700 shadow-sm">
              <img src="https://picsum.photos/seed/alex/100/100" className="w-full h-full object-cover" />
            </div>
            {!isCollapsed && (
              <div className="text-xs truncate animate-in fade-in duration-300">
                <p className="font-bold text-emerald-50">Alex Sterling</p>
                <p className="text-emerald-400/80 font-mono tracking-tighter">ID: 2023-10492</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
             {currentView !== 'dashboard' && (
               <button onClick={handleBack} className="p-2 hover:bg-slate-100 rounded-full transition-all flex items-center justify-center text-slate-500 hover:text-emerald-700 active:scale-90">
                  <span className="material-icons text-xl font-bold">arrow_back</span>
               </button>
             )}
             <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                {currentView.replace(/-/g, ' ')}
              </h1>
          </div>
          
          <div className="flex items-center gap-4 relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-xl relative transition-all ${showNotifications ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              <span className="material-icons">notifications</span>
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">{unreadCount}</span>}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 md:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-emerald-800">Alerts & Notifications</h3>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                   {notifications.map((n) => (
                    <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 hover:bg-slate-50 cursor-pointer flex gap-4 transition-colors ${!n.read ? 'bg-emerald-50/20' : ''}`}>
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${!n.read ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        <span className="material-icons text-lg">{getNotificationIcon(n.type)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{n.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{n.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-slate-50/50">
          <div className="max-w-7xl mx-auto pb-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
