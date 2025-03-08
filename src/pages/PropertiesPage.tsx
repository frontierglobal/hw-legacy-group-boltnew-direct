import React, { useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import { properties } from '../data/mockData';
import { Building, Filter } from 'lucide-react';

const PropertiesPage: React.FC = () => {
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    location: 'all',
  });
  
  const filteredProperties = properties.filter(property => {
    if (filters.type !== 'all' && property.type !== filters.type) return false;
    if (filters.status !== 'all' && property.status !== filters.status) return false;
    if (filters.location !== 'all' && property.location !== filters.location) return false;
    return true;
  });
  
  // Get unique locations for filter
  const locations = ['all', ...new Set(properties.map(p => p.location))];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-6">
            <Building className="h-12 w-12 mr-4" />
            <h1 className="text-4xl font-bold">Property Investments</h1>
          </div>
          <p className="text-center text-xl max-w-3xl mx-auto">
            Discover our curated selection of high-yield property investment opportunities across the North East of England.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 mr-2 text-blue-600" />
            <h2 className="text-lg font-semibold">Filter Properties</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type
              </label>
              <select
                id="type-filter"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
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
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties match your current filters.</p>
            <button
              onClick={() => setFilters({ type: 'all', status: 'all', location: 'all' })}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPage;