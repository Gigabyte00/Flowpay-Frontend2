import React, { useState } from 'react';
import FlowPayLogo from './FlowPayLogo';
import { useAuth } from '../contexts/AuthContext';
import { 
  CreditCard, Users, FileCheck, TrendingUp, Zap, AlertCircle, 
  Eye, EyeOff, Loader2, ChevronRight, Building2, Timer
} from 'lucide-react';

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

export default LandingPage;