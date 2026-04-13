import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, QrCode, Bell, LogOut, Menu, X, Shield, Award } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Alert } from '../types';
import { api } from '../lib/api';
import { GlobalAIChat } from './GlobalAIChat';
import { motion, AnimatePresence } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.getAlerts();
        setAlerts(data);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      }
    };

    fetchAlerts();

    // Real-time subscription
    const channel = supabase
      .channel('doctor_alerts')
      .on('postgres_changes' as any, { event: 'INSERT', table: 'doctor_alerts' }, (payload: any) => {
        setAlerts(prev => [payload.new as Alert, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = alerts.filter(a => !a.is_read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'rankings', label: 'Doctor Rankings', icon: Award },
    { id: 'admin', label: 'Admin Panel', icon: Shield },
    { id: 'scanner', label: 'Scanner', icon: QrCode },
  ];

  return (
    <div className="flex h-screen bg-brand-surface overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-200 transition-transform duration-300 lg:relative lg:translate-x-0",
        !isSidebarOpen && "-translate-x-full lg:w-20"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            {isSidebarOpen && <span className="font-bold text-xl text-text-primary">Swasthya AI</span>}
          </div>

          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  activeTab === item.id 
                    ? "bg-brand-surface text-brand-primary border-l-4 border-brand-primary" 
                    : "text-text-secondary hover:bg-gray-50"
                )}
              >
                <item.icon size={20} />
                {isSidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-text-muted hover:text-risk-high transition-colors">
              <LogOut size={20} />
              {isSidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-text-primary">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-text-primary">Dr. Akshat Sabnis</p>
              <p className="text-xs text-text-muted">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <button 
              onClick={() => setIsAlertsOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell size={20} className="text-text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-risk-high text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
          <GlobalAIChat />
        </main>
      </div>

      {/* Alerts Panel (Sheet) */}
      <AnimatePresence>
        {isAlertsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAlertsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl z-50 flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold">Alerts</h2>
                <button onClick={() => setIsAlertsOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-10 text-text-muted">No alerts today</div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-brand-primary">{alert.patient_name}</span>
                        <span className="text-[10px] text-text-muted">{new Date(alert.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{alert.message}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                          alert.risk_level === 'High' ? 'bg-risk-high text-white' : 'bg-brand-primary-light text-white'
                        )}>
                          {alert.alert_type}
                        </span>
                        <button className="text-xs font-bold text-brand-primary hover:underline">View Patient</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-gray-200">
                <button className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-colors">
                  Mark All Read
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
