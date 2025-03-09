import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import BusinessCard from '../components/BusinessCard';
import InvestmentProcess from '../components/InvestmentProcess';
import { properties, businesses } from '../data/mockData';
import { Link } from 'react-router-dom';
import { ArrowRight, Building, Briefcase, Users, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface ContentData {
  [key: string]: string;
}

const HomePage: React.FC = () => {
  const [content, setContent] = useState<ContentData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('Welcome');

  // Get only published properties and businesses for the featured section
  const featuredProperties = properties.filter(p => p.status === 'published').slice(0, 3);
  const featuredBusinesses = businesses.filter(b => b.status === 'published').slice(0, 3);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('content')
          .select('*');

        if (fetchError) throw fetchError;

        const contentMap = (data || []).reduce((acc, item) => ({
          ...acc,
          [item.key]: item.value
        }), {} as ContentData);

        setContent(contentMap);

        const { data: titleData, error: titleError } = await supabase
          .from('content')
          .select('value')
          .eq('key', 'home_title')
          .single();

        if (titleError) {
          logger.error('Error fetching home title:', titleError);
          return;
        }

        if (titleData?.value) {
          setTitle(titleData.value);
        }
      } catch (err) {
        const error = err as Error;
        logger.error('Error fetching content:', error);
        setError('Failed to load content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <Hero />
      
      {/* Featured Properties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {content.properties_title || 'Featured Properties'}
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                {content.properties_subtitle || 'Premium property investment opportunities in the North East'}
              </p>
            </div>
            <Link to="/properties" className="flex items-center text-blue-600 hover:text-blue-800">
              <span className="mr-2">View All Properties</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {content.businesses_title || 'Featured Businesses'}
              </h2>
              <p className="mt-2 text-lg text-gray-600">
                {content.businesses_subtitle || 'Exciting business investment opportunities in the North East'}
              </p>
            </div>
            <Link to="/businesses" className="flex items-center text-indigo-600 hover:text-indigo-800">
              <span className="mr-2">View All Businesses</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredBusinesses.map(business => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Investment Process */}
      <InvestmentProcess />
      
      {/* About Us Summary */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {content.why_choose_title || 'Why Choose HW Legacy Group'}
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              {content.why_choose_subtitle || "We're a trusted investment partner with deep expertise in the North East property and business markets."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <Building className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {content.feature_1_title || 'Property Expertise'}
              </h3>
              <p className="text-gray-600">
                {content.feature_1_text || 'Over 25 years of combined experience in property development and management.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {content.feature_2_title || 'Business Acumen'}
              </h3>
              <p className="text-gray-600">
                {content.feature_2_text || 'Proven track record of identifying and growing successful businesses.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {content.feature_3_title || 'Investor Community'}
              </h3>
              <p className="text-gray-600">
                {content.feature_3_text || 'Join our community of over 200 satisfied investors from across the UK.'}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mx-auto bg-blue-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {content.feature_4_title || 'Proven Results'}
              </h3>
              <p className="text-gray-600">
                {content.feature_4_text || 'Consistent delivery of target returns across our investment portfolio.'}
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/about" 
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {content.about_cta || 'Learn More About Us'}
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
            {content.cta_title || 'Ready to Start Your Investment Journey?'}
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            {content.cta_text || 'Join HW Legacy Group today and start earning 12% annual returns on your investment with our secure, asset-backed debt notes.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to="/register"
              className="px-8 py-3 text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-100 md:py-4 md:text-lg md:px-10"
            >
              {content.register_cta || 'Register Now'}
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900 md:py-4 md:text-lg md:px-10"
            >
              {content.contact_cta || 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;