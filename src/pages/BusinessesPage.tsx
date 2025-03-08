import React, { useState } from 'react';
import BusinessCard from '../components/BusinessCard';
import { businesses } from '../data/mockData';
import { Briefcase, Filter } from 'lucide-react';

const BusinessesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    sector: 'all',
    status: 'all',
    location: 'all',
  });
  
  const filteredBusinesses = businesses.filter(business => {
    if (filters.sector !== 'all' && business.sector !== filters.sector) return false;
    if (filters.status !== 'all' && business.status !== filters.status) return false;
    if (filters.location !== 'all' && business.location !== filters.location) return false;
    return true;
  });
  
  // Get unique sectors and locations for filters
  const sectors = ['all', ...new Set(businesses.map(b => b.sector))];
  const locations = ['all', ...new Set(businesses.map(b => b.location))];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Briefcase className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">Business Investments</h1>
          </div>
          <p className="text-center text-xl max-w-3xl mx-auto">
            Explore opportunities to invest in thriving businesses across various sectors in the North East of England.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-indigo-600" />
            <h2 className="text-lg font-semibold">Filter Businesses</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="sector-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Business Sector
              </label>
              <select
                id="sector-filter"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
              >
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector === 'all' ? 'All Sectors' : sector}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="coming_soon">Coming Soon</option>
                <option value="funded">Fully Funded</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                id="location-filter"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Results */}
        {filteredBusinesses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No businesses match your current filters.</p>
            <button
              onClick={() => setFilters({ sector: 'all', status: 'all', location: 'all' })}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessesPage;