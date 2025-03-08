import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Percent, Briefcase } from 'lucide-react';
import { Business } from '../types';

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={business.imageUrl} 
          alt={business.name} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
          {business.sector}
        </div>
        {business.status === 'coming_soon' && (
          <div className="absolute bottom-0 left-0 right-0 bg-yellow-500 text-white px-3 py-1 text-center text-sm font-medium">
            Coming Soon
          </div>
        )}
        {business.status === 'funded' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gray-700 text-white px-3 py-1 text-center text-sm font-medium">
            Fully Funded
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{business.name}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{business.location}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {business.description}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-500">Investment</p>
            <p className="text-lg font-bold">{formatCurrency(business.investmentRequired)}</p>
          </div>
          <div className="flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">
            <Percent className="h-4 w-4 mr-1" />
            <span className="font-bold">{business.roi}% ROI</span>
          </div>
        </div>
        
        {business.status === 'available' && (
          <Link 
            to={`/businesses/${business.id}`}
            className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded"
          >
            View Opportunity
          </Link>
        )}
        
        {business.status === 'coming_soon' && (
          <button 
            className="block w-full bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded cursor-not-allowed"
            disabled
          >
            Coming Soon
          </button>
        )}
        
        {business.status === 'funded' && (
          <button 
            className="block w-full bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded cursor-not-allowed"
            disabled
          >
            Fully Funded
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;