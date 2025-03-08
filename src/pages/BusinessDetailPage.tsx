import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { businesses } from '../data/mockData';
import { MapPin, Percent, Calendar, Briefcase, ArrowLeft, CheckCircle, TrendingUp, Users, Shield } from 'lucide-react';

const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const business = businesses.find(b => b.id === id);
  
  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Business Not Found</h1>
        <p className="text-gray-600 mb-6">The business you're looking for doesn't exist or has been removed.</p>
        <Link to="/businesses" className="flex items-center text-indigo-600 hover:text-indigo-800">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Businesses
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
  
  // Calculate monthly interest based on annual rate
  const monthlyInterest = (business.investmentRequired * (business.roi / 100)) / 12;
  const annualInterest = business.investmentRequired * (business.roi / 100);
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Business Header */}
      <div className="relative h-96">
        <img 
          src={business.imageUrl} 
          alt={business.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl font-bold mb-4">{business.name}</h1>
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 mr-1" />
              <span className="text-xl">{business.location}</span>
            </div>
            <div className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-full text-lg font-medium">
              {business.sector}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/businesses" className="flex items-center text-indigo-600 hover:text-indigo-800 mb-8">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Businesses
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Business Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Business Overview</h2>
              <p className="text-gray-700 mb-6">
                {business.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Sector</p>
                  <p className="font-semibold">{business.sector}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{business.location}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">Investment</p>
                  <p className="font-semibold">{formatCurrency(business.investmentRequired)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">ROI</p>
                  <p className="font-semibold">{business.roi}%</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3">Investment Highlights</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Established business with proven revenue model</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Secure {business.roi}% annual returns paid monthly or at maturity</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Asset-backed investment with business equity as security</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Experienced management team with sector expertise</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span>Clear exit strategy at the end of the 12-month term</span>
                </li>
              </ul>
              
              <h3 className="text-xl font-bold mb-3">Business Strategy</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600 mr-2" />
                    <h4 className="font-bold text-indigo-800">Growth Plan</h4>
                  </div>
                  <p className="text-sm text-indigo-800">
                    Strategic expansion into new markets and product development to increase revenue.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-indigo-600 mr-2" />
                    <h4 className="font-bold text-indigo-800">Team</h4>
                  </div>
                  <p className="text-sm text-indigo-800">
                    Experienced management with proven track record in the {business.sector} sector.
                  </p>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                    <h4 className="font-bold text-indigo-800">Risk Mitigation</h4>
                  </div>
                  <p className="text-sm text-indigo-800">
                    Diversified revenue streams and strong client relationships reduce market risks.
                  </p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3">Market Analysis</h3>
              <p className="text-gray-700 mb-4">
                The {business.sector} sector in the North East is experiencing significant growth, with increasing demand for innovative solutions. {business.name} is well-positioned to capitalize on this trend with its established market presence and reputation for quality.
              </p>
              
              <p className="text-gray-700 mb-4">
                Key market indicators show a projected annual growth rate of 8-10% in this sector over the next five years, providing a solid foundation for business expansion and increased returns for investors.
              </p>
            </div>
          </div>
          
          {/* Investment Calculator */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Investment Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Investment Amount</span>
                  <span className="font-bold">{formatCurrency(business.investmentRequired)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                  <span className="text-gray-600">Annual Interest Rate</span>
                  <span className="font-bold text-green-600">{business.roi}%</span>
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
              
              <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 text-indigo-600 mr-2" />
                  <h3 className="font-bold text-indigo-800">Investment Timeline</h3>
                </div>
                <ul className="space-y-2 text-sm text-indigo-800">
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
                className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md mb-3"
              >
                Invest Now
              </Link>
              
              <Link
                to="/contact"
                className="block w-full text-center border border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-3 px-4 rounded-md"
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

export default BusinessDetailPage;