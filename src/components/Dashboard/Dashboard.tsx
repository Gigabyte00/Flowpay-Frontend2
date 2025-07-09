import React, { useState } from 'react';
import FlowPayLogo from '../FlowPayLogo';
import { useAuth } from '../../contexts/AuthContext';
import { Home, Send, Users, History, RefreshCw, CreditCard, Settings, LogOut, Menu, X, Bell } from 'lucide-react';
import DashboardContent from './DashboardContent';
import MakePaymentContent from './MakePaymentContent';
import VendorsContent from './VendorsContent';
import TransactionsContent from './TransactionsContent';
import RecurringContent from './RecurringContent';
import CardsContent from './CardsContent';
import SettingsContent from './SettingsContent';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('flowpay_user');
    setUser(null);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'make-payment', label: 'Make Payment', icon: Send },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'recurring', label: 'Recurring', icon: RefreshCw },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <FlowPayLogo size="small" />
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-64 bg-white border-r border-gray-200 overflow-y-auto`}>
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'dashboard' && <DashboardContent />}
            {activeTab === 'make-payment' && <MakePaymentContent />}
            {activeTab === 'vendors' && <VendorsContent />}
            {activeTab === 'transactions' && <TransactionsContent />}
            {activeTab === 'recurring' && <RecurringContent />}
            {activeTab === 'cards' && <CardsContent />}
            {activeTab === 'settings' && <SettingsContent />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard; 