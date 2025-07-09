import React from 'react';
import { useData } from '../DataProvider';
import { Plus, Shield } from 'lucide-react';

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

export default CardsContent; 