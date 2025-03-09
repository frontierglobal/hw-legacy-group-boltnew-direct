import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">HW Legacy Group</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Home</Link>
              <Link to="/properties" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Properties</Link>
              <Link to="/businesses" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Businesses</Link>
              <Link to="/about" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">About Us</Link>
              
              {user ? (
                <>
                  {isAdmin ? (
                    <Link to="/admin" className="px-3 py-2 rounded-md text-sm font-medium bg-purple-600 hover:bg-purple-700">
                      <Settings className="h-4 w-4 inline mr-1" />
                      Admin
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700">Dashboard</Link>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-800">Login</Link>
                  <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-700">Register</Link>
                </>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Home</Link>
            <Link to="/properties" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Properties</Link>
            <Link to="/businesses" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Businesses</Link>
            <Link to="/about" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">About Us</Link>
            
            {user ? (
              <>
                {isAdmin ? (
                  <Link to="/admin" className="flex items-center px-3 py-2 rounded-md text-base font-medium bg-purple-600 hover:bg-purple-700">
                    <Settings className="h-4 w-4 mr-1" />
                    Admin
                  </Link>
                ) : (
                  <Link to="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700">Dashboard</Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-800">Login</Link>
                <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium bg-blue-600 hover:bg-blue-700">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;