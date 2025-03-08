import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Briefcase,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Clock,
  BarChart
} from 'lucide-react';
import { signOut } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (!error) {
      setUser(null);
      navigate('/login');
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Properties',
      href: '/admin/properties',
      icon: Building,
    },
    {
      name: 'Businesses',
      href: '/admin/businesses',
      icon: Briefcase,
    },
    {
      name: 'Investments',
      href: '/admin/investments',
      icon: CreditCard,
    },
    {
      name: 'Documents',
      href: '/admin/documents',
      icon: FileText,
    },
    {
      name: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: Clock,
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-gray-900">
              <div className="flex items-center flex-shrink-0 px-4">
                <Link to="/admin" className="flex items-center">
                  <Building className="h-8 w-8 text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-white">Admin</span>
                </Link>
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`mr-3 flex-shrink-0 h-6 w-6 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                          }`}
                        />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-800 p-4">
                <button
                  onClick={handleSignOut}
                  className="flex-shrink-0 w-full group block"
                >
                  <div className="flex items-center">
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-300 group-hover:text-white flex items-center">
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;