import React, { useState, useEffect } from 'react';
import { useData } from '../DataProvider';
import { apiService, CONFIG } from '../../services/apiService';
import { Plus, Search, Check, AlertCircle, Loader2, Building2, ExternalLink } from 'lucide-react';

function VendorsContent() {
  const { vendors, addVendor, updateVendor } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newVendor, setNewVendor] = useState({ name: '', email: '', type: 'Business' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL params for returning from Stripe onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const successAccountId = urlParams.get('success');
    const refreshAccountId = urlParams.get('refresh');
    
    if (successAccountId || refreshAccountId) {
      checkAccountStatus(successAccountId || refreshAccountId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const checkAccountStatus = async (accountId) => {
    try {
      const response = await apiService.getAccountStatus(accountId);
      if (response.success && response.account.detailsSubmitted) {
        const vendor = vendors.find(v => v.stripeAccountId === accountId);
        if (vendor) {
          updateVendor(vendor.id, { onboarded: true });
        }
      }
    } catch (error) {
      console.error('Error checking account status:', error);
    }
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create Stripe Connect account
      const accountResponse = await apiService.createAccount(
        newVendor.email,
        newVendor.name,
        'business'
      );

      if (!accountResponse.success) {
        throw new Error(accountResponse.error || 'Failed to create account');
      }

      // Add vendor to local state
      const vendor = {
        id: Date.now().toString(),
        name: newVendor.name,
        email: newVendor.email,
        type: newVendor.type,
        preferredMethod: 'ACH',
        lastPayment: new Date().toISOString(),
        amount: 0,
        stripeAccountId: accountResponse.accountId,
        onboarded: false
      };
      
      addVendor(vendor);
      
      // Get onboarding link
      const linkResponse = await apiService.getOnboardingLink(accountResponse.accountId);
      
      if (linkResponse.success) {
        // In demo mode, show alert instead of opening new tab
        if (CONFIG.DEMO_MODE) {
          alert('Demo Mode: In production, this would open Stripe Connect onboarding at: ' + linkResponse.url);
          // Simulate successful onboarding after a delay
          setTimeout(() => {
            updateVendor(vendor.id, { onboarded: true });
          }, 2000);
        } else {
          window.open(linkResponse.url, '_blank');
        }
      }
      
      setShowAddModal(false);
      setNewVendor({ name: '', email: '', type: 'Business' });
    } catch (error) {
      setError(error.message || 'Error adding vendor');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDashboard = async (vendor) => {
    try {
      const response = await apiService.getDashboardLink(vendor.stripeAccountId);
      if (response.success) {
        if (CONFIG.DEMO_MODE) {
          alert('Demo Mode: In production, this would open Stripe Express Dashboard at: ' + response.url);
        } else {
          window.open(response.url, '_blank');
        }
      }
    } catch (error) {
      console.error('Error opening dashboard:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
          <p className="text-gray-600 mt-1">Manage your saved vendors and their Stripe Connect accounts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-semibold">
                {vendor.name[0]}
              </div>
              <div className="flex items-center space-x-2">
                {vendor.onboarded ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                ) : (
                  <button
                    onClick={() => vendor.stripeAccountId && checkAccountStatus(vendor.stripeAccountId)}
                    className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full hover:bg-amber-200"
                  >
                    Check Status
                  </button>
                )}
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{vendor.name}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>Type: {vendor.type}</p>
              <p>Email: {vendor.email}</p>
              {vendor.stripeAccountId && (
                <p className="text-xs text-gray-500 font-mono">
                  ID: {vendor.stripeAccountId}
                </p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              {vendor.onboarded && (
                <button 
                  onClick={() => handleOpenDashboard(vendor)}
                  className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Dashboard
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Add New Vendor</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={newVendor.name}
                  onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., ABC Property Management"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="vendor@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select 
                  value={newVendor.type}
                  onChange={(e) => setNewVendor({...newVendor, type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option>Rent</option>
                  <option>Tuition</option>
                  <option>Medical</option>
                  <option>Business</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p className="font-medium mb-1">What happens next?</p>
                <p>The vendor will be redirected to Stripe to complete their account setup. They'll need to provide:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Business information</li>
                  <li>Bank account details</li>
                  <li>Tax identification</li>
                </ul>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVendor}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Building2 className="w-4 h-4 mr-2" />
                      Add & Setup Stripe
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VendorsContent; 