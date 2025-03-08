import React from 'react';
import { ClipboardCheck, UserCheck, FileText, CreditCard, Calendar, TrendingUp } from 'lucide-react';

const InvestmentProcess: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            How to Invest with HW Legacy Group
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Our straightforward investment process makes it easy to start earning 12% annual returns with our short-term debt notes.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">1. Register</h3>
            </div>
            <p className="text-gray-600">
              Create your investor account to access our exclusive investment opportunities and secure portal.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">2. Verify</h3>
            </div>
            <p className="text-gray-600">
              Complete our simple verification process to confirm your identity and investor status.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">3. Documentation</h3>
            </div>
            <p className="text-gray-600">
              Review and sign the investment documents electronically through our secure platform.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">4. Fund</h3>
            </div>
            <p className="text-gray-600">
              Transfer your investment amount securely through our banking partners.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">5. Activation</h3>
            </div>
            <p className="text-gray-600">
              Your investment is activated and begins earning interest from the agreed start date.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold">6. Returns</h3>
            </div>
            <p className="text-gray-600">
              Receive your 12% annual returns paid monthly or at maturity, according to your preference.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a 
            href="/register" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Investing Today
          </a>
        </div>
      </div>
    </div>
  );
};

export default InvestmentProcess;