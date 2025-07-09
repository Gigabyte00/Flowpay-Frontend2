import React, { useState, useEffect } from 'react';
import { useData } from '../DataProvider';
import { apiService, loadStripe } from '../../services/apiService';
import { CreditCard, AlertCircle, Loader2, Lock, Shield, Banknote, Zap, Check, CheckCircle } from 'lucide-react';

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

export default MakePaymentContent;