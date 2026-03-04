import React, { useState } from 'react';
import { Truck, Star, Phone, MapPin, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  avatar: string;
  deliveriesCompleted: number;
  successRate: number;
  rating: number;
  status: 'active' | 'inactive' | 'on-delivery';
  joinDate: string;
}

const DeliveryPersonnel: React.FC = () => {
  const [deliveryPersonnel] = useState<DeliveryPerson[]>([
    { id: 'DP001', name: 'Raihan Ahmed', phone: '+880 1700 111111', email: 'raihan@delivery.com', area: 'Dhaka North', avatar: '👨‍💼', deliveriesCompleted: 324, successRate: 98.5, rating: 4.8, status: 'active', joinDate: '2022-03-15' },
    { id: 'DP002', name: 'Karim Hassan', phone: '+880 1700 222222', email: 'karim@delivery.com', area: 'Dhaka South', avatar: '👨‍💼', deliveriesCompleted: 287, successRate: 96.2, rating: 4.6, status: 'on-delivery', joinDate: '2022-05-20' },
    { id: 'DP003', name: 'Arif Khan', phone: '+880 1700 333333', email: 'arif@delivery.com', area: 'Chittagong', avatar: '👨‍💼', deliveriesCompleted: 145, successRate: 94.0, rating: 4.4, status: 'active', joinDate: '2023-01-10' },
    { id: 'DP004', name: 'Nasir Ali', phone: '+880 1700 444444', email: 'nasir@delivery.com', area: 'Sylhet', avatar: '👨‍💼', deliveriesCompleted: 89, successRate: 91.2, rating: 4.2, status: 'inactive', joinDate: '2023-06-05' },
    { id: 'DP005', name: 'Rony Islam', phone: '+880 1700 555555', email: 'rony@delivery.com', area: 'Khulna', avatar: '👨‍💼', deliveriesCompleted: 212, successRate: 97.3, rating: 4.7, status: 'active', joinDate: '2022-09-12' },
    { id: 'DP006', name: 'Hasan Uddin', phone: '+880 1700 666666', email: 'hasan@delivery.com', area: 'Rajshahi', avatar: '👨‍💼', deliveriesCompleted: 156, successRate: 95.8, rating: 4.5, status: 'active', joinDate: '2023-02-28' },
  ]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border border-green-300';
      case 'on-delivery': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'inactive': return 'bg-gray-100 text-gray-800 border border-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRating = (rating: number) => {
    return '⭐'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '✨' : '');
  };

  return (
    <>
      <div className="mb-6 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Delivery Personnel</h1>
        <p className="text-sm sm:text-base text-gray-600 font-medium">Manage and track your delivery team.</p>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 lg:mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <p className="text-xs text-blue-700 font-semibold mb-1">Total Personnel</p>
          <p className="text-xl lg:text-2xl font-bold text-blue-900">6</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <p className="text-xs text-green-700 font-semibold mb-1">Active Now</p>
          <p className="text-xl lg:text-2xl font-bold text-green-900">4</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-yellow-700 font-semibold mb-1">On Delivery</p>
          <p className="text-xl lg:text-2xl font-bold text-yellow-900">1</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <p className="text-xs text-purple-700 font-semibold mb-1">Total Deliveries</p>
          <p className="text-xl lg:text-2xl font-bold text-purple-900">1.2K</p>
        </div>
      </div>

      {/* Add Personnel Button */}
      <div className="mb-6 lg:mb-8">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Personnel
        </button>
      </div>

      {/* Personnel List */}
      <div className="space-y-4">
        {deliveryPersonnel.map(person => (
          <div key={person.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {person.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{person.id}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-blue-600" />
                      {person.area}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone size={14} className="text-blue-600" />
                      {person.phone}
                    </div>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${getStatusColor(person.status)}`}>
                {person.status}
              </span>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-600 mb-1">Deliveries</p>
                <p className="font-bold text-lg text-gray-900">{person.deliveriesCompleted}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                <p className="font-bold text-lg text-green-600">{person.successRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Rating</p>
                <p className="font-bold text-lg text-yellow-600">{person.rating}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Joined</p>
                <p className="font-bold text-lg text-gray-900">{new Date(person.joinDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</p>
              </div>
            </div>

            {/* Rating Stars */}
            <div className="flex items-center justify-between mb-4 p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-700 font-semibold">Customer Rating</div>
              <div className="text-lg">{getRating(person.rating)}</div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm">
                <Truck size={16} />
                Assign
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm">
                <TrendingUp size={16} />
                Performance
              </button>
              <button className="flex items-center justify-center px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DeliveryPersonnel;
