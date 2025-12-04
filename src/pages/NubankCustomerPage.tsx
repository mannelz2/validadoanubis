import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { UserCheck, UserPlus } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function NubankCustomerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams, profileAnswers, loanPriority } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/nubank-customer'
    });
  }
  }, [navigate, userData]);

  if (!userData) {
    return null;
  }

  const firstName = userData.nome.split(' ')[0];

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const options = [
    {
      icon: UserCheck,
      text: 'Sim, já sou cliente',
      value: 'existing_customer'
    },
    {
      icon: UserPlus,
      text: 'Não, seria o primeiro',
      value: 'new_customer'
    }
  ];

  const handleOptionSelect = (value: string) => {
    navigateWithParams(
      navigate,
      '/status-credito',
      location,
      {
        userData,
        indemnityAmount,
        profileAnswers,
        loanPriority,
        nubankCustomer: value
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 animate-fade-in-down">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Você já fez empréstimo na Nubank?
            </h1>
            <p className="text-xs text-gray-600">
              Queremos conhecer seu histórico
            </p>
          </div>

          <div className="space-y-3 animate-slide-up">
            {options.map((option, index) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="w-full p-4 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group shadow-sm"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-sm sm:text-base text-gray-900 group-hover:text-purple-600 font-medium block">
                  {option.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out 0.2s backwards;
        }
      `}</style>
    </div>
  );
}
