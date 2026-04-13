import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ScannerPage } from './pages/ScannerPage';
import { DoctorRankingPage } from './pages/DoctorRankingPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const handlePatientClick = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('patient-detail');
  };

  const handleScan = (id: string) => {
    setSelectedPatientId(id);
    setActiveTab('patient-detail');
  };

  const renderContent = () => {
    if (activeTab === 'patient-detail' && selectedPatientId) {
      return (
        <PatientDetailPage 
          patientId={selectedPatientId} 
          onBack={() => setActiveTab('dashboard')} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
      case 'patients':
        return <DashboardPage onPatientClick={handlePatientClick} />;
      case 'scanner':
        return <ScannerPage onScan={handleScan} onBack={() => setActiveTab('dashboard')} />;
      case 'rankings':
        return <DoctorRankingPage />;
      case 'admin':
        return <AdminDashboardPage />;
      default:
        return <DashboardPage onPatientClick={handlePatientClick} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}
