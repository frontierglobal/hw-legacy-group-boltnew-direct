import React from 'react';
import { ClipboardCheck, UserCheck, FileText, CreditCard, Calendar, TrendingUp, Shield, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const InvestmentProcessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold sm:text-5xl">
              How to Invest with HW Legacy Group
            </h1>
            <p className="mt-4 text-xl max-w-3xl mx-auto">
              A straightforward process to start earning 12% annual returns through our property and business investments
            </p>
          </div>
        </div>
      </div>

      {/* Investment Steps */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">1. Register</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Create your investor account to access our exclusive investment opportunities and secure portal.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Complete basic registration form</li>
                <li>• Verify your email address</li>
                <li>• Access your investor dashboard</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">2. Verification</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Complete our verification process to confirm your identity and investor status.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Provide identification documents</li>
                <li>• Confirm investor classification</li>
                <li>• Complete source of funds declaration</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">3. Choose Investment</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Browse and select from our curated investment opportunities.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Review detailed investment information</li>
                <li>• Access due diligence documents</li>
                <li>• Select your preferred opportunity</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">4. Documentation</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Review and sign the investment documents electronically.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Investment agreement</li>
                <li>• Terms and conditions</li>
                <li>• Payment instructions</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">5. Fund Investment</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Transfer your investment amount securely.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Secure bank transfer</li>
                <li>• Confirmation of receipt</li>
                <li>• Investment allocation</li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">6. Start Earning</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Begin receiving your investment returns.
              </p>
              <ul className="text-gray-600 space-y-2">
                <li>• Monthly interest payments</li>
                <li>• Regular investment updates</li>
                <li>• Performance tracking</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Invest With Us</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Investment</h3>
              <p className="text-gray-600">
                All investments are secured against tangible assets with clear legal documentation.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Attractive Returns</h3>
              <p className="text-gray-600">
                Earn 12% annual returns with monthly payment options and clear exit strategies.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Management</h3>
              <p className="text-gray-600">
                Our experienced team handles all aspects of investment management and administration.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Investing?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of investors and start earning attractive returns through our property and business investments.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50"
            >
              Create Account
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-blue-800"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentProcessPage;