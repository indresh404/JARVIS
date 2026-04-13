import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Users, Star, Award, MoreVertical, Download } from 'lucide-react';
import { api } from '../lib/api';
import { Doctor } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const AdminDashboardPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSeedDoctors = async () => {
    try {
      setIsSeeding(true);
      await api.seedAllData();
      await fetchDoctors();
    } catch (err) {
      console.error('Failed to seed data:', err);
      alert('Failed to seed data. Make sure your Supabase tables exist.');
    } finally {
      setIsSeeding(false);
    }
  };

  const stats = [
    { label: 'Total Doctors', value: doctors.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Rating', value: (doctors.reduce((acc, d) => acc + d.rating, 0) / (doctors.length || 1)).toFixed(1), icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Reviews', value: doctors.reduce((acc, d) => acc + d.review_count, 0), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-primary rounded-2xl text-white">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">Admin Control Center</h2>
            <p className="text-text-muted text-sm">Manage medical professionals and monitor performance.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSeedDoctors}
            disabled={isSeeding}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 disabled:opacity-50"
          >
            {isSeeding ? 'Seeding...' : 'Seed Doctor Data'}
          </button>
          <button className="px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 flex items-center gap-2">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="card-base p-6 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
        <div className="card-base p-6 flex items-center gap-4 bg-brand-primary text-white">
          <div className="p-4 rounded-2xl bg-white/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">System Health</p>
            <p className="text-2xl font-black">99.9%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Ranking Table */}
        <div className="lg:col-span-2 card-base overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-black text-lg text-text-primary">Performance Leaderboard</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-muted uppercase">Sort:</span>
              <select className="text-xs font-bold bg-transparent focus:outline-none border-b-2 border-brand-primary/20 pb-0.5">
                <option>Highest Rating</option>
                <option>Experience</option>
                <option>Review Count</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white text-text-muted text-[10px] uppercase tracking-widest font-black border-b border-gray-100">
                  <th className="px-6 py-5">Rank</th>
                  <th className="px-6 py-5">Specialist</th>
                  <th className="px-6 py-5">Rating</th>
                  <th className="px-6 py-5">Reviews</th>
                  <th className="px-6 py-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-16 bg-gray-50/50" />
                    </tr>
                  ))
                ) : doctors.length > 0 ? (
                  doctors.map((doctor, idx) => (
                    <tr key={doctor.id} className="hover:bg-brand-primary/5 transition-colors group">
                      <td className="px-6 py-5">
                        <span className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm",
                          idx === 0 ? "bg-yellow-400 text-white" : 
                          idx === 1 ? "bg-gray-300 text-white" :
                          idx === 2 ? "bg-orange-300 text-white" : "bg-gray-50 text-text-muted"
                        )}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-black text-xs group-hover:bg-brand-primary group-hover:text-white transition-colors">
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-black text-text-primary">{doctor.name}</p>
                            <p className="text-[10px] text-brand-primary font-bold uppercase tracking-tighter">{doctor.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-black text-text-primary">{doctor.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-text-secondary">{doctor.review_count}</td>
                      <td className="px-6 py-5 text-right">
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-black uppercase tracking-widest">Active</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted italic font-bold">
                      No doctor data available. Click "Seed Doctor Data" to populate.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="card-base p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-lg text-text-primary">System Activity</h3>
            <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-[10px] font-black uppercase tracking-widest">Live</span>
          </div>
          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {[
              { time: '2 mins ago', action: 'New Doctor Registered', details: 'Dr. Sunita Gupta joined Oncology', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { time: '15 mins ago', action: 'Critical Alert Resolved', details: 'Patient Amit Kumar status updated', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
              { time: '1 hour ago', action: 'New Review Received', details: '5-star review for Dr. Sarah Johnson', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { time: '3 hours ago', action: 'System Backup Complete', details: 'Cloud storage sync successful', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((item, idx) => (
              <div key={idx} className="relative pl-10 group">
                <div className={cn("absolute left-1.5 top-1 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110", item.bg, item.color)}>
                  <item.icon size={12} />
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.time}</p>
                <p className="text-sm font-black text-text-primary">{item.action}</p>
                <p className="text-xs text-text-secondary font-medium">{item.details}</p>
              </div>
            ))}
          </div>
          <button className="w-full py-3 bg-gray-50 text-text-muted rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-colors">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
};
