import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, User, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout, guestEditsUsed, maxGuestEdits } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">PDFEdit Pro</span>
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.isPremium ? (
                  <Crown className="h-5 w-5 text-yellow-500" />
                ) : (
                  <span className="text-sm text-gray-600">
                    {user.maxEdits - user.editsUsed} edits left
                  </span>
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <User className="h-5 w-5 text-gray-600" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {maxGuestEdits - guestEditsUsed} free edits left
              </span>
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;