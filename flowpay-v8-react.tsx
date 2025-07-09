import React, { useState, useEffect, createContext, useContext } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  CreditCard, Home, Send, Users, History, RefreshCw, FileCheck, 
  Settings, User, Menu, X, Plus, Trash2, Edit, Eye, EyeOff,
  TrendingUp, DollarSign, Calendar, Bell, Search, LogOut,
  Check, AlertCircle, Clock, ChevronRight, Shield, Zap,
  Award, Lock, Smartphone, Globe, Headphones, Star, ExternalLink,
  Loader2, ArrowRight, Building2, Banknote, Timer, CheckCircle
} from 'lucide-react';

// Configuration - In production, these would come from environment variables
const CONFIG = {
  API_BASE_URL: 'http://localhost:4242/api',
  STRIPE_PUBLISHABLE_KEY: 'pk_test_51Rg83yR5e4jJ92tPGXX4bvHR3pP56yqppkZ8fiTqEIXwVZTSf0gxoDTc9BRQVoN64tSknjAi7mA3OVCcDjMsWARm00RMldz7DQ',
  DEMO_MODE: true // Set to false when backend is connected
};

// API Service
class ApiService {
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      // In demo mode, return mock data
      if (CONFIG.DEMO_MODE) {
        return this.mockResponse(endpoint, options);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Mock responses for demo mode
  mockResponse(endpoint, options) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint === '/accounts/create') {
          resolve({
            success: true,
            accountId: 'acct_demo_' + Math.random().toString(36).substr(2, 9),
            detailsSubmitted: false,
            chargesEnabled: false,
            payoutsEnabled: false
          });
        } else if (endpoint === '/accounts/onboarding-link') {
          resolve({
            success: true,
            url: 'https://connect.stripe.com/setup/e/acct_demo/demo_onboarding',
            expiresAt: Date.now() + 3600000
          });
        } else if (endpoint.startsWith('/accounts/status/')) {
          resolve({
            success: true,
            account: {
              id: endpoint.split('/').pop(),
              detailsSubmitted: Math.random() > 0.5,
              chargesEnabled: true,
              payoutsEnabled: true
            }
          });
        } else if (endpoint === '/accounts/dashboard-link') {
          resolve({
            success: true,
            url: 'https://dashboard.stripe.com/test/connect/accounts/acct_demo'
          });
        } else if (endpoint === '/payments/create-intent') {
          resolve({
            success: true,
            clientSecret: 'pi_demo_secret_' + Math.random().toString(36).substr(2, 9),
            paymentIntentId: 'pi_demo_' + Math.random().toString(36).substr(2, 9),
            amount: options.body ? JSON.parse(options.body).amount * 100 : 0,
            fee: options.body ? Math.round(JSON.parse(options.body).amount * 3.5) : 0
          });
        } else {
          resolve({ success: true });
        }
      }, 500);
    });
  }

  // Account methods
  async createAccount(email, businessName, businessType = 'individual') {
    return this.request('/accounts/create', {
      method: 'POST',
      body: JSON.stringify({ email, businessName, businessType }),
    });
  }

  async getOnboardingLink(accountId) {
    return this.request('/accounts/onboarding-link', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  }

  async getAccountStatus(accountId) {
    return this.request(`/accounts/status/${accountId}`);
  }

  async getDashboardLink(accountId) {
    return this.request('/accounts/dashboard-link', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  }

  // Payment methods
  async createPaymentIntent(amount, vendorAccountId, description, payoutSpeed) {
    return this.request('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        vendorAccountId, 
        description, 
        payoutSpeed 
      }),
    });
  }

  async createTransfer(amount, destinationAccountId, paymentIntentId) {
    return this.request('/payments/transfer', {
      method: 'POST',
      body: JSON.stringify({ 
        amount, 
        destinationAccountId, 
        paymentIntentId 
      }),
    });
  }
}

const apiService = new ApiService();

// Load Stripe
const loadStripe = () => {
  return new Promise((resolve) => {
    if (window.Stripe) {
      resolve(window.Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY));
    } else {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => {
        if (window.Stripe) {
          resolve(window.Stripe(CONFIG.STRIPE_PUBLISHABLE_KEY));
        } else {
          resolve(null);
        }
      };
      document.head.appendChild(script);
    }
  });
};

// Auth Context
const AuthContext = createContext(null);
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Data Context for managing app state
const DataContext = createContext(null);
const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// Initial mock data with Stripe IDs
const initialData = {
  vendors: [
    { id: '1', name: 'ABC Property Management', email: 'abc@property.com', type: 'Rent', preferredMethod: 'ACH', lastPayment: '2025-06-15', amount: 2500, stripeAccountId: 'acct_1ABC123Demo', onboarded: true },
    { id: '2', name: 'State University', email: 'billing@university.edu', type: 'Tuition', preferredMethod: 'Wire', lastPayment: '2025-06-01', amount: 5000, stripeAccountId: 'acct_1DEF456Demo', onboarded: true },
    { id: '3', name: 'City Medical Center', email: 'payments@medical.com', type: 'Medical', preferredMethod: 'Check', lastPayment: '2025-05-20', amount: 1200, stripeAccountId: null, onboarded: false },
  ],
  transactions: [
    { id: 1, date: '2025-06-28', merchant: 'ABC Property Management', amount: 2500, fee: 87.50, status: 'Completed', method: 'ACH', stripePaymentId: 'pi_demo_1ABC' },
    { id: 2, date: '2025-06-25', merchant: 'State University', amount: 5000, fee: 175.00, status: 'Completed', method: 'Wire', stripePaymentId: 'pi_demo_2DEF' },
    { id: 3, date: '2025-06-20', merchant: 'City Medical Center', amount: 1200, fee: 42.00, status: 'Processing', method: 'Check', stripePaymentId: 'pi_demo_3GHI' },
  ],
  cards: [
    { id: 1, last4: '4242', brand: 'Visa', name: 'Personal Card', expiry: '12/26', isDefault: true },
    { id: 2, last4: '5555', brand: 'Mastercard', name: 'Business Card', expiry: '08/25', isDefault: false },
  ],
  recurringPayments: [
    { id: 1, vendor: 'ABC Property Management', amount: 2500, frequency: 'Monthly', nextDate: '2025-07-01', active: true },
    { id: 2, vendor: 'State University', amount: 5000, frequency: 'Quarterly', nextDate: '2025-09-01', active: true },
  ]
};

// Data Provider Component
function DataProvider({ children }) {
  const [vendors, setVendors] = useState(initialData.vendors);
  const [transactions, setTransactions] = useState(initialData.transactions);
  const [cards, setCards] = useState(initialData.cards);
  const [recurringPayments, setRecurringPayments] = useState(initialData.recurringPayments);

  const addVendor = (vendor) => {
    setVendors([...vendors, vendor]);
  };

  const updateVendor = (id, updates) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);
  };

  const value = {
    vendors,
    transactions,
    cards,
    recurringPayments,
    addVendor,
    updateVendor,
    addTransaction,
    setVendors,
    setTransactions,
    setCards,
    setRecurringPayments
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Logo Component
const FlowPayLogo = ({ size = 'large' }) => {
  const dimensions = size === 'large' ? { width: 180, height: 50 } : { width: 120, height: 32 };
  
  return (
    <svg width={dimensions.width} height={dimensions.height} viewBox="0 0 180 50" fill="none">
      <defs>
        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>
      <path d="M10 25C10 25 20 15 30 25C40 35 50 15 60 25" stroke="url(#flowGradient)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <text x="70" y="32" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="url(#flowGradient)">FlowPay</text>
    </svg>
  );
};

// Main App Component
export default function FlowPayApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('flowpay_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-pulse">
          <FlowPayLogo size="large" />
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <DataProvider>
        {user ? <Dashboard /> : <LandingPage />}
      </DataProvider>
    </AuthContext.Provider>
  );
}

// Landing Page Component
function LandingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isLogin && !name) {
      setError('Please enter your name');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      // Simulate auth - in production, this would call your auth API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        name: isLogin ? email.split('@')[0] : name,
      };
      
      setUser(userData);
      localStorage.setItem('flowpay_user', JSON.stringify(userData));
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const userData = {
        id: 'demo_user',
        email: 'demo@flowpay.com',
        name: 'Demo User'
      };
      setUser(userData);
      localStorage.setItem('flowpay_user', JSON.stringify(userData));
    } catch (error) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <FlowPayLogo size="small" />
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 transition-colors">Pricing</a>
              <button 
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powered by Stripe Connect
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Pay Anyone with Your <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">Credit Card</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your credit card payments into ACH transfers, wires, or checks. Pay rent, tuition, medical bills, and more while earning rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button 
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all transform hover:scale-105"
              >
                Start Paying Smarter
              </button>
              <button 
                onClick={handleDemoLogin}
                className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all"
              >
                Try Demo
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">3.5%</div>
              <div className="text-gray-600">Transaction Fee</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">Instant</div>
              <div className="text-gray-600">Stripe Payouts</div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-xl p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-pink-600 mb-2">Secure</div>
              <div className="text-gray-600">PCI Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose FlowPay?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Universal Payments</h3>
              <p className="text-gray-600">Pay anyone, anywhere. We handle ACH, wire transfers, and even mail checks when needed.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Stripe Connect</h3>
              <p className="text-gray-600">Powered by Stripe's trusted infrastructure for secure, compliant payment processing.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center mb-6">
                <Timer className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Flexible Payouts</h3>
              <p className="text-gray-600">Choose standard ACH (2-3 days), instant payouts, wire transfers, or mailed checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Add Recipient', desc: 'Merchant creates Stripe account', icon: Users },
              { step: 2, title: 'Choose Method', desc: 'Select ACH, wire, or instant', icon: FileCheck },
              { step: 3, title: 'Pay with Card', desc: 'Use any credit or debit card', icon: CreditCard },
              { step: 4, title: 'Automatic Transfer', desc: 'Funds sent via Stripe Connect', icon: TrendingUp },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-10 h-10 text-white" />
                  </div>
                  {item.step < 4 && (
                    <ChevronRight className="absolute top-10 -right-4 w-8 h-8 text-gray-300 hidden md:block" />
                  )}
                </div>
                <h3 className="text-xl font-semibold mb-2">Step {item.step}: {item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Transparent Pricing</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
                <h3 className="text-2xl font-bold mb-2">Simple, Fair Pricing</h3>
                <p className="text-blue-100">Pay only for what you use. No hidden fees.</p>
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h4 className="font-semibold text-lg">Credit Card Payments</h4>
                      <p className="text-gray-600">Standard processing fee</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">3.5%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h4 className="font-semibold text-lg">Standard ACH Payout</h4>
                      <p className="text-gray-600">2-3 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">Free</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b">
                    <div>
                      <h4 className="font-semibold text-lg">Instant Payout</h4>
                      <p className="text-gray-600">Available in minutes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">1%</p>
                      <p className="text-sm text-gray-500">min $0.50</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">Wire Transfer</h4>
                      <p className="text-gray-600">1-2 business days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">$15</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <FlowPayLogo size="small" />
              <h2 className="text-2xl font-bold mt-6">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-gray-600 mt-2">{isLogin ? 'Log in to your account' : 'Start paying smarter today'}</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleAuth}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isLogin ? 'Log In' : 'Sign Up'
                )}
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={handleDemoLogin}
                className="text-gray-600 hover:text-gray-700 font-medium text-sm"
              >
                Or try the demo account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <FlowPayLogo size="small" />
          <p className="mt-4 text-gray-400">© 2025 FlowPay. All rights reserved. Powered by Stripe Connect.</p>
        </div>
      </footer>
    </div>
  );
}

// Dashboard Component
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

// Dashboard Content Component
function DashboardContent() {
  const { transactions } = useData();
  
  const stats = [
    { label: 'Total Payments', value: '$127,000', change: '+12.5%', icon: DollarSign },
    { label: 'This Month', value: '$28,000', change: '+8.2%', icon: TrendingUp },
    { label: 'Saved in Fees', value: '$4,445', change: '+15.3%', icon: Award },
    { label: 'Active Vendors', value: '24', change: '+4', icon: Users },
  ];

  const chartData = [
    { month: 'Jan', amount: 15000 },
    { month: 'Feb', amount: 18000 },
    { month: 'Mar', amount: 22000 },
    { month: 'Apr', amount: 19000 },
    { month: 'May', amount: 25000 },
    { month: 'Jun', amount: 28000 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your payment overview.</p>
      </div>

      {CONFIG.DEMO_MODE && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-900">Demo Mode Active</p>
              <p className="text-sm text-amber-700 mt-1">
                This is a demonstration of FlowPay with simulated Stripe integration. In production, connect to a real backend server for live payments.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-purple-600" />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Payment Volume</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="url(#colorGradient)"
              strokeWidth={3}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 3).map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.merchant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Make Payment Content Component
function MakePaymentContent() {
  const { vendors, addTransaction } = useData();
  const [selectedVendor, setSelectedVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ACH');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [payoutSpeed, setPayoutSpeed] = useState('standard');
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    loadStripe().then(setStripe);
  }, []);

  const calculateFee = () => {
    if (!amount || isNaN(parseFloat(amount))) return { fee: '0.00', total: '0.00' };
    const amountNum = parseFloat(amount);
    const fee = amountNum * 0.035;
    return {
      fee: fee.toFixed(2),
      total: (amountNum + fee).toFixed(2)
    };
  };

  const handleCreatePaymentIntent = async () => {
    if (!selectedVendor || !amount) {
      setError('Please select a vendor and enter an amount');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const vendor = vendors.find(v => v.id === selectedVendor);
      if (!vendor) throw new Error('Vendor not found');

      if (!vendor.onboarded) {
        setError('This vendor needs to complete Stripe onboarding first');
        setProcessing(false);
        return;
      }

      const response = await apiService.createPaymentIntent(
        parseFloat(amount),
        vendor.stripeAccountId,
        `Payment to ${vendor.name}`,
        payoutSpeed
      );

      setClientSecret(response.clientSecret);
    } catch (err) {
      setError(err.message || 'Failed to create payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    if (!clientSecret || !stripe) return;

    setProcessing(true);
    
    try {
      // In production, you would use Stripe Elements to collect card details
      // For demo, we'll simulate a successful payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newTransaction = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        merchant: vendors.find(v => v.id === selectedVendor)?.name || 'Unknown',
        amount: parseFloat(amount),
        fee: parseFloat(calculateFee().fee),
        status: 'Completed',
        method: paymentMethod,
        stripePaymentId: 'pi_' + Math.random().toString(36).substr(2, 9)
      };
      
      addTransaction(newTransaction);
      
      setSuccess(true);
      setProcessing(false);
      
      setTimeout(() => {
        setSuccess(false);
        setAmount('');
        setSelectedVendor('');
        setClientSecret('');
      }, 3000);
    } catch (error) {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const fees = calculateFee();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Make a Payment</h1>
        <p className="text-gray-600 mt-1">Send payments to any vendor using your credit card</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-green-800">Payment Successful!</p>
            <p className="text-sm text-green-600">Your payment has been processed through Stripe.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* Vendor Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Choose a vendor...</option>
            {vendors.map((vendor) => (
              <option key={vendor.id} value={vendor.id}>
                {vendor.name} - {vendor.type} 
                {!vendor.onboarded && ' (Needs Stripe Setup)'}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* Payout Speed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payout Speed</label>
          <div className="space-y-3">
            <label className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
              payoutSpeed === 'standard' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="payoutSpeed"
                value="standard"
                checked={payoutSpeed === 'standard'}
                onChange={(e) => setPayoutSpeed(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <Banknote className="w-6 h-6 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium">Standard ACH</p>
                  <p className="text-sm text-gray-600">2-3 business days • Free</p>
                </div>
              </div>
              {payoutSpeed === 'standard' && <Check className="w-5 h-5 text-purple-600" />}
            </label>

            <label className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
              payoutSpeed === 'instant' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="payoutSpeed"
                value="instant"
                checked={payoutSpeed === 'instant'}
                onChange={(e) => setPayoutSpeed(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <Zap className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium">Instant Payout</p>
                  <p className="text-sm text-gray-600">Within 30 minutes • 1% fee</p>
                </div>
              </div>
              {payoutSpeed === 'instant' && <Check className="w-5 h-5 text-purple-600" />}
            </label>
          </div>
        </div>

        {/* Fee Breakdown */}
        {amount && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-medium text-gray-900">Fee Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Amount:</span>
                <span className="font-medium">${parseFloat(amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (3.5%):</span>
                <span className="font-medium">${fees.fee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="text-gray-900 font-medium">Total Charge:</span>
                <span className="font-bold">${fees.total}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!clientSecret ? (
          <button
            onClick={handleCreatePaymentIntent}
            disabled={processing || !selectedVendor || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {processing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Proceed to Payment
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Payment intent created. In production, Stripe Elements would appear here to collect card details.
              </p>
            </div>
            <button
              onClick={handleStripePayment}
              disabled={processing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {processing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Complete Payment
                </>
              )}
            </button>
          </div>
        )}

        {/* Stripe Security Badge */}
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Shield className="w-4 h-4 mr-2" />
          Secured by Stripe • PCI DSS Compliant
        </div>
      </div>
    </div>
  );
}

// Vendors Content Component
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

// Transactions Content Component
function TransactionsContent() {
  const { transactions } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-1">View and track all your Stripe payments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stripe ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.merchant}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ${transaction.fee.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.method}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {transaction.stripePaymentId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Recurring Content Component
function RecurringContent() {
  const { recurringPayments } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recurring Payments</h1>
          <p className="text-gray-600 mt-1">Manage your automated Stripe subscriptions</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>New Recurring Payment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurringPayments.map((payment) => (
          <div key={payment.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <RefreshCw className={`w-8 h-8 ${payment.active ? 'text-green-500' : 'text-gray-400'}`} />
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={payment.active} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            <h3 className="font-semibold text-lg mb-2">{payment.vendor}</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="text-2xl font-bold text-gray-900">${payment.amount.toLocaleString()}</p>
              <p>{payment.frequency}</p>
              <p>Next: {new Date(payment.nextDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cards Content Component
function CardsContent() {
  const { cards } = useData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Cards</h1>
          <p className="text-gray-600 mt-1">Manage your credit and debit cards</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all transform hover:scale-105 flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-gray-400 text-sm">{card.name}</p>
                  <p className="text-2xl font-bold mt-1">•••• {card.last4}</p>
                </div>
                {card.isDefault && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Default</span>
                )}
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-gray-400 text-xs">Expires</p>
                  <p className="text-lg">{card.expiry}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{card.brand}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium text-purple-900">Stripe Security</p>
            <p className="text-sm text-purple-700 mt-1">
              Your card information is encrypted and tokenized by Stripe. We never store your actual card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings Content Component
function SettingsContent() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    twoFactor: true,
    biometric: false,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              defaultValue={user?.name || ''}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive payment confirmations and updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105">
        Save Changes
      </button>
    </div>
  );
}