import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Clock } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
          alt="Office building"
          className="w-full h-full object-cover opacity-30"
        />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight sm:text-6xl">
            Invest in the Future of North East England
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
            Secure 12% annual returns with our short-term debt notes backed by premium property and business investments.
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
            >
              Become an Investor
            </Link>
            <Link
              to="/properties"
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
            >
              View Opportunities
            </Link>
          </div>
        </div>
      </div>
      
      <div className="relative bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">12% Annual Returns</h3>
              <p className="text-gray-600">
                Our short-term debt notes offer attractive fixed returns, paid monthly or upon maturity.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Asset-Backed Security</h3>
              <p className="text-gray-600">
                All investments are secured against tangible assets in the North East property market.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border border-gray-200 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">12-Month Terms</h3>
              <p className="text-gray-600">
                Short commitment periods with clear exit strategies and transparent investment terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;