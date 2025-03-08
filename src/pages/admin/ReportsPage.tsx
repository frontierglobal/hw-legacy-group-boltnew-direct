import React, { useState } from 'react';
import { 
  BarChart,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  Calendar,
  Filter
} from 'lucide-react';

const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('all');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">View and download investment performance reports</p>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="all">All Reports</option>
            <option value="investments">Investment Reports</option>
            <option value="users">User Reports</option>
            <option value="performance">Performance Reports</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Investments</p>
              <p className="text-xl font-semibold">£4,250,000</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Average ROI</p>
              <p className="text-xl font-semibold">12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Investors</p>
              <p className="text-xl font-semibold">156</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <BarChart className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Monthly Growth</p>
              <p className="text-xl font-semibold">+8.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Available Reports */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Available Reports</h2>
        </div>

        <div className="divide-y divide-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart className="h-5 w-5 text-gray-400" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Investment Performance Report</h3>
                  <p className="text-sm text-gray-500">Detailed analysis of investment returns and performance metrics</p>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Download className="h-5 w-5 mr-1" />
                Download
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Investor Demographics Report</h3>
                  <p className="text-sm text-gray-500">Analysis of investor profiles and investment patterns</p>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Download className="h-5 w-5 mr-1" />
                Download
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-gray-400" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Monthly Growth Report</h3>
                  <p className="text-sm text-gray-500">Month-over-month platform growth and investment trends</p>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Download className="h-5 w-5 mr-1" />
                Download
              </button>
            </div>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Financial Summary Report</h3>
                  <p className="text-sm text-gray-500">Complete financial overview including revenue and returns</p>
                </div>
              </div>
              <button className="flex items-center text-blue-600 hover:text-blue-800">
                <Download className="h-5 w-5 mr-1" />
                Download
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Investment Distribution</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart Placeholder</p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Returns</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;