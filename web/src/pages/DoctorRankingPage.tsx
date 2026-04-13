import React, { useState, useEffect } from 'react';
import { Star, Award, MessageSquare, Search, Filter, X, Calendar, MapPin, Phone, Mail, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { Doctor, Review } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const DoctorRankingPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
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

    fetchDoctors();
  }, []);

  const handleViewProfile = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsLoadingReviews(true);
    try {
      const data = await api.getDoctorReviews(doctor.id);
      setReviews(data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">Medical Excellence</h2>
          <p className="text-text-muted">Top-tier specialists ranked by clinical outcomes and patient satisfaction.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text"
            placeholder="Search by name or specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-sm transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor, index) => (
            <motion.div 
              key={doctor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-base p-6 space-y-5 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:bg-brand-primary/10" />
              
              <div className="flex items-start justify-between relative z-10">
                <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary font-black text-3xl shadow-inner">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                    <span className="font-black text-yellow-700">{doctor.rating}</span>
                  </div>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Global Rank #{index + 1}</span>
                </div>
              </div>

              <div className="space-y-1">
                <h3 className="font-black text-xl text-text-primary group-hover:text-brand-primary transition-colors">{doctor.name}</h3>
                <p className="text-sm text-brand-primary font-bold uppercase tracking-wider">{doctor.specialization}</p>
                <p className="text-xs text-text-muted font-medium line-clamp-1">{doctor.qualification}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Award size={16} className="text-text-muted" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Experience</span>
                    <span className="text-sm font-bold">{doctor.experience_years} Years</span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <MessageSquare size={16} className="text-text-muted" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-text-muted uppercase">Reviews</span>
                    <span className="text-sm font-bold">{doctor.review_count}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleViewProfile(doctor)}
                className="w-full py-3.5 bg-brand-surface text-brand-primary rounded-2xl font-black text-sm hover:bg-brand-primary hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
              >
                View Profile & Reviews
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-text-muted font-bold">No specialists found matching your search criteria.</p>
        </div>
      )}

      {/* Profile Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDoctor(null)}
              className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white transition-colors shadow-lg"
              >
                <X size={20} />
              </button>

              {/* Sidebar Info */}
              <div className="w-full md:w-80 bg-gray-50 p-8 flex flex-col items-center text-center border-r border-gray-100">
                <div className="w-32 h-32 bg-brand-primary rounded-[40px] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-brand-primary/30 mb-6">
                  {selectedDoctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-2xl font-black text-text-primary mb-1">{selectedDoctor.name}</h3>
                <p className="text-brand-primary font-bold uppercase tracking-widest text-xs mb-6">{selectedDoctor.specialization}</p>
                
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Award size={16} className="text-brand-primary" /></div>
                    <span className="font-bold">{selectedDoctor.qualification}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><MapPin size={16} className="text-brand-primary" /></div>
                    <span className="font-bold">Swasthya AI Central, Delhi</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Phone size={16} className="text-brand-primary" /></div>
                    <span className="font-bold">+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-white rounded-xl shadow-sm"><Mail size={16} className="text-brand-primary" /></div>
                    <span className="font-bold">{selectedDoctor.email}</span>
                  </div>
                </div>

                <button className="w-full mt-10 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                  <Calendar size={18} />
                  Book Appointment
                </button>
              </div>

              {/* Main Content: Reviews */}
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-black text-text-primary">Patient Reviews</h4>
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-100">
                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-black text-yellow-700">{selectedDoctor.rating}</span>
                    <span className="text-xs text-yellow-600 font-bold ml-1">({selectedDoctor.review_count} reviews)</span>
                  </div>
                </div>

                {isLoadingReviews ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-gray-50 animate-pulse rounded-3xl" />
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review, idx) => (
                      <motion.div 
                        key={review.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-text-muted">
                              {review.patient_name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{review.patient_name}</p>
                              <p className="text-[10px] text-text-muted font-bold uppercase">{new Date(review.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={cn(i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-200")} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed italic">"{review.comment}"</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
                    <MessageSquare size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-text-muted font-bold">No reviews yet for this specialist.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
