import React from 'react';
import { Users, Award, Target, Shield, MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white py-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80"
            alt="Office building"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl mb-6">About HW Legacy Group</h1>
          <p className="text-xl max-w-3xl mx-auto">
            A private investment holding company focused on creating value through strategic property and business investments in the North East of England.
          </p>
        </div>
      </div>
      
      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Our Story</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto my-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-gray-700 mb-6">
              Founded in 2015, HW Legacy Group was established with a clear vision: to identify, acquire, and develop high-potential properties and businesses in the North East of England, creating value for both investors and local communities.
            </p>
            <p className="text-lg text-gray-700 mb-6">
              Our founders, with over 30 years of combined experience in property development, business management, and financial services, recognized the untapped potential in the region's property market and business landscape.
            </p>
            <p className="text-lg text-gray-700">
              Today, we manage a diverse portfolio of residential and commercial properties, as well as operating businesses across multiple sectors. Our focus remains on delivering consistent, above-market returns for our investors while contributing to the economic growth of the North East.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              alt="Office meeting" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Our Values */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto my-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from property selection to investor relations.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Integrity</h3>
              <p className="text-gray-600">
                We operate with complete transparency and honesty in all our business dealings.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Partnership</h3>
              <p className="text-gray-600">
                We build long-term relationships with our investors, tenants, and business partners.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
                <Award className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We embrace innovative approaches to property development and business growth.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Leadership Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Our Leadership Team</h2>
          <div className="w-20 h-1 bg-blue-600 mx-auto my-4"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="CEO" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-bold mb-1">James Harrison</h3>
            <p className="text-blue-600 mb-3">Chief Executive Officer</p>
            <p className="text-gray-600 mb-4">
              With over 15 years in property development and investment banking, James leads our strategic vision and investment decisions.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img 
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="COO" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-bold mb-1">Sarah Wilson</h3>
            <p className="text-blue-600 mb-3">Chief Operations Officer</p>
            <p className="text-gray-600 mb-4">
              Sarah oversees our property portfolio and business operations, bringing 12 years of experience in commercial real estate.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <img 
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
              alt="CFO" 
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h3 className="text-xl font-bold mb-1">Michael Thompson</h3>
            <p className="text-blue-600 mb-3">Chief Financial Officer</p>
            <p className="text-gray-600 mb-4">
              Michael manages our financial strategy and investor relations with his background in private equity and wealth management.
            </p>
          </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Get in Touch</h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto my-4"></div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Have questions about our investment opportunities or want to learn more about HW Legacy Group? We'd love to hear from you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Visit Us</h3>
              <p className="text-gray-300">
                Newcastle Business Park<br />
                Newcastle upon Tyne<br />
                NE4 7YL
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Email Us</h3>
              <p className="text-gray-300">
                General Inquiries:<br />
                info@hwlegacygroup.com<br /><br />
                Investor Relations:<br />
                investors@hwlegacygroup.com
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Call Us</h3>
              <p className="text-gray-300">
                Main Office:<br />
                +44 (0) 191 123 4567<br /><br />
                Investor Hotline:<br />
                +44 (0) 191 765 4321
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              to="/contact" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-white hover:bg-gray-100"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;