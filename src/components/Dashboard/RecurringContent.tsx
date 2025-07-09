import React from 'react';
import { useData } from '../DataProvider';
import { RefreshCw, Plus } from 'lucide-react';

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

export default RecurringContent; 