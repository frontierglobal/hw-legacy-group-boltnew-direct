import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Briefcase, TrendingUp, Clock, FileText, Calendar, PieChart, ArrowUpRight, Download } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';

interface Investment {
  id: string;
  title: string;
  investment_type: string;
  amount: number;
  start_date: string;
  end_date: string;
  interest_rate: number;
  status: string;
}

interface Document {
  id: string;
  title: string;
  created_at: string;
  status: string;
  file_url: string;
}

const DashboardPage: React.FC = () => {
  const { user, initialized } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch investments with correct column names
        const { data: investmentsData, error: investmentsError } = await supabase
          .from('investments')
          .select(`
            id,
            title,
            investment_type,
            amount,
            start_date,
            end_date,
            interest_rate,
            status
          `)
          .eq('user_id', user.id);

        if (investmentsError) {
          console.error('Error fetching investments:', investmentsError);
          throw new Error('Failed to fetch investments');
        }

        // Fetch documents with correct column names
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select(`
            id,
            title,
            created_at,
            status,
            file_url
          `)
          .eq('user_id', user.id);

        if (documentsError) {
          console.error('Error fetching documents:', documentsError);
          throw new Error('Failed to fetch documents');
        }

        // Map the data to match our component's expectations
        const mappedInvestments = (investmentsData || []).map(inv => ({
          ...inv,
          type: inv.investment_type,
          name: inv.title
        }));

        const mappedDocuments = (documentsData || []).map(doc => ({
          ...doc,
          name: doc.title,
          url: doc.file_url
        }));

        setInvestments(mappedInvestments);
        setDocuments(mappedDocuments);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (initialized) {
      fetchData();
    }
  }, [user, initialized]);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Calculate total invested and projected returns
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const projectedReturns = investments.reduce((sum, inv) => sum + (inv.amount * inv.interest_rate / 100), 0);
  
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">Please log in to view your investor dashboard.</p>
        <Link 
          to="/login" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Log In
        </Link>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your investments...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Dashboard Header */}
      <div className="bg-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Investor Dashboard</h1>
          <p className="mt-2">Welcome back, {user.email}</p>
        </div>
      </div>
      
      {/* Dashboard Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'investments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('investments')}
            >
              My Investments
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'opportunities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('opportunities')}
            >
              New Opportunities
            </button>
          </nav>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Total Invested</h3>
                  <div className="bg-blue-100 p-2 rounded-full">
                    <PieChart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalInvested)}</p>
                <p className="text-sm text-gray-500 mt-2">Across {investments.length} investments</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Annual Returns</h3>
                  <div className="bg-green-100 p-2 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(projectedReturns)}</p>
                <p className="text-sm text-gray-500 mt-2">Projected annual interest</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Next Payment</h3>
                  <div className="bg-indigo-100 p-2 rounded-full">
                    <Calendar className="h-6 w-6 text-indigo-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(projectedReturns / 12)}</p>
                <p className="text-sm text-gray-500 mt-2">Due on 15 Feb 2025</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Documents</h3>
                  <div className="bg-yellow-100 p-2 rounded-full">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {documents.filter(d => d.status === 'pending').length} pending signature
                </p>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-md mb-8">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-4">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Interest Payment Received</p>
                        <p className="text-sm text-gray-500">Luxury Serviced Apartments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">+£500</p>
                      <p className="text-sm text-gray-500">15 Jan 2025</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Document Signed</p>
                        <p className="text-sm text-gray-500">Investment Agreement - TechNorth</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">25 Oct 2024</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-4">
                        <Building className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Investment</p>
                        <p className="text-sm text-gray-500">Luxury Serviced Apartments</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">£50,000</p>
                      <p className="text-sm text-gray-500">15 Jan 2025</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200">
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                  View all activity
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
            
            {/* Upcoming Payments */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Upcoming Payments</h3>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Luxury Serviced Apartments</p>
                      <p className="text-sm text-gray-500">Monthly Interest</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">£500</p>
                      <p className="text-sm text-gray-500">15 Feb 2025</p>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">TechNorth Solutions</p>
                      <p className="text-sm text-gray-500">Monthly Interest</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-green-600">£312</p>
                      <p className="text-sm text-gray-500">1 Feb 2025</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Investments</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Investment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interest Rate
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.map((investment) => (
                      <tr key={investment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {investment.type === 'property' ? (
                              <Building className="h-4 w-4 text-blue-600 mr-1" />
                            ) : (
                              <Briefcase className="h-4 w-4 text-indigo-600 mr-1" />
                            )}
                            <span className="text-sm text-gray-500">
                              {investment.type === 'property' ? 'Property' : 'Business'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatCurrency(investment.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-green-600">{investment.interest_rate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(investment.start_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(investment.end_date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Documents</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Created
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {documents.map((document) => (
                      <tr key={document.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{document.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(document.created_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {document.status === 'completed' ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.status === 'completed' ? (
                            <button className="text-blue-600 hover:text-blue-800 flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          ) : (
                            <button className="text-indigo-600 hover:text-indigo-800">
                              Sign Document
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">New Investment Opportunities</h3>
              <p className="text-gray-600 mb-4">
                Explore our latest investment opportunities. As a valued investor, you get early access to our premium property and business investments.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/properties" className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-3 rounded-full mr-4">
                      <Building className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-medium">Property Investments</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Discover our curated selection of high-yield property investments across the North East of England.
                  </p>
                  <div className="flex items-center text-blue-600">
                    View Properties
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
                
                <Link to="/businesses" className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-100 p-3 rounded-full mr-4">
                      <Briefcase className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h4 className="text-lg font-medium">Business Investments</h4>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Explore opportunities to invest in thriving businesses across various sectors in the North East.
                  </p>
                  <div className="flex items-center text-indigo-600">
                    View Businesses
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Investment Opportunity</h3>
                  <p className="text-gray-600 mb-4">
                    We have an exclusive new property investment opportunity coming soon. Register your interest now to get priority access when it launches.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                    Register Interest
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;