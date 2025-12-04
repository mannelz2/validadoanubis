import React from 'react';
import { User } from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
  showUserIcon?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, showUserIcon = false }) => {
  return (
    <header className="w-full bg-white/80 backdrop-blur-md py-3 px-6 md:px-12 fixed top-0 left-0 right-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <img
            src="/Nubank_logo_2021.svg"
            alt="Nubank Logo"
            className="h-6 md:h-7"
          />
        </div>

        <div className="flex items-center gap-4">
          {showUserIcon && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2.5 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
              aria-label="Perfil"
            >
              <User className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;