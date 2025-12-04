import React from 'react';
import { X, User, Lock, ShieldCheck, ChevronRight } from 'lucide-react';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ isOpen, onClose, userName }) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60]"
        onClick={onClose}
      />

      {/* Popup Menu */}
      <div className="fixed top-16 right-4 md:right-8 w-64 bg-white rounded-2xl shadow-2xl z-[70] animate-slide-down">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* User Profile Section */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            Olá, {userName}!
          </h2>
        </div>

        {/* Access Account Button */}
        <div className="px-4 pb-3">
          <button className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            CONTA VALIDADA
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 pb-4 space-y-0.5">
          <button className="w-full flex items-center justify-between py-2.5 px-2.5 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">Meus dados</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </button>

          <button className="w-full flex items-center justify-between py-2.5 px-2.5 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">Segurança</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </button>

          <button className="w-full flex items-center justify-between py-2.5 px-2.5 hover:bg-gray-50 rounded-lg transition-colors group">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-900">Privacidade</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default UserMenu;
