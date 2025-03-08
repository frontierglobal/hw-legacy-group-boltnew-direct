import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { properties } from '../data/mockData';
import { MapPin, Percent, Calendar, Building, ArrowLeft, CheckCircle } from 'lucide-react';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const property = properties.find(p => p.id === id);
  
  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Property Not Found</h1>
        <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
        <Link to="/properties" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </Link>
      </div>
    );
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Calculate monthly interest based on 12% annual rate
  const monthlyInterest = (property.price * 0.12) / 12;
  const annualInterest = property.price * 0.12;
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Property Header */}
      <div className="relative h-96">
        <img 
          src={property.imageUrl} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl font-bold mb-4">{property.title}</h1>
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 mr-1" />
              <span className="text-xl">{property.location}</span>
            </div>
            <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-medium">
              {property.type === 'residential' ? 'Residential Property' : 'Commercial Property'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/properties" className="flex items-center text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Properties
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Property Overview</h2>
              <p className="text-gray-700 mb-6">
                {property.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{property.type === 'residential' ? 'Residential' : 'Commercial'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{property.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Investment</p>
                  <p className="font-semibold">{formatCurrency(property.price)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className="font-semibold">{property.roi}%</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3">Investment Highlights</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Prime location in {property.location} with high rental demand</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Secure 12% annual returns paid monthly or at maturity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Asset-backed investment with tangible property security</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Professional property management included</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Clear exit strategy at the end of the 12-month term</span>
                </li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Location</h3>
              <p className="text-gray-700 mb-4">
                This property is strategically located in {property.location}, offering excellent connectivity and access to local amenities. The area has shown consistent growth in property values over the past 5 years, making it an attractive investment opportunity.
              </p>
              
              {/* Placeholder for a map - in a real app, you would integrate Google Maps or similar */}
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-gray-500 mr-2" />
                <span className="text-gray-500 font-medium">Map of {property.location}</span>
              </div>
            </div>
          </div>
          
          {/* Investment Calculator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Investment Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Investment Amount</span>
                  <span className="font-bold">{formatCurrency(property.price)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Annual Interest Rate</span>
                  <span className="font-bold text-green-600">{property.roi}%</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Term Length</span>
                  <span className="font-bold">12 months</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Monthly Interest</span>
                  <span className="font-bold text-green-600">{formatCurrency(monthlyInterest)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Total Annual Return</span>
                  <span className="font-bold text-green-600">{formatCurrency(annualInterest)}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-bold text-blue-800">Investment Timeline</h3>
                </div>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Day 1:</span>
                    <span>Investment activated</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Monthly:</span>
                    <span>Interest payments (optional)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Month 12:</span>
                    <span>Principal returned with final interest payment</span>
                  </li>
                </ul>
              </div>
              
              <Link
                to="/register"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md mb-3"
              >
                Invest Now
              </Link>
              
              <Link
                to="/contact"
                className="block w-full text-center border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-4 rounded-md"
              >
                Request More Information
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;