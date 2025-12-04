import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function InstallmentSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, loanAmount = 4600.00, urlParams, profileAnswers, loanPriority, nubankCustomer, creditStatus } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [selectedInstallments, setSelectedInstallments] = useState(60);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/installment-selection'
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

  const installmentOptions = [2, 3, 6, 9, 12, 18, 24, 36, 48, 60];

  const calculateInstallmentValue = (installments: number) => {
    return loanAmount / installments;
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
      '/termos-emprestimo',
      location,
      {
        userData,
        loanAmount,
        selectedInstallments,
        installmentValue: calculateInstallmentValue(selectedInstallments),
        profileAnswers,
        loanPriority,
        nubankCustomer,
        creditStatus
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Selecione em quantas vezes deseja pagar
            </h1>
            <p className="text-sm text-gray-600">
              Sem juros em todas as opções
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 sm:p-6 mb-6 text-center shadow-md animate-slide-up">
            <p className="text-purple-100 text-sm mb-2">Valor Total do Empréstimo</p>
            <p className="text-white text-3xl sm:text-4xl font-bold mb-3">
              R$ {formatCurrency(loanAmount)}
            </p>
            <div className="bg-purple-500/30 backdrop-blur-sm rounded-lg p-3">
              <p className="text-purple-50 text-xs mb-1">Valor da parcela selecionada</p>
              <p className="text-white text-xl sm:text-2xl font-bold">
                {selectedInstallments}x de R$ {formatCurrency(calculateInstallmentValue(selectedInstallments))}
              </p>
            </div>
          </div>

          <div className="mb-6 animate-slide-up-delayed">
            <p className="text-sm font-semibold text-gray-900 mb-3 text-center">
              Escolha o número de parcelas
            </p>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {installmentOptions.map((option, index) => (
                <button
                  key={option}
                  onClick={() => setSelectedInstallments(option)}
                  className={`aspect-square rounded-full font-semibold text-sm sm:text-base transition-all duration-200 ${
                    selectedInstallments === option
                      ? 'bg-purple-600 text-white shadow-lg scale-110'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
                  }`}
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  {option}x
                </button>
              ))}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-slide-up-info">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">
                  Sem Juros
                </p>
                <p className="text-xs text-green-800 leading-relaxed">
                  Você pagará exatamente R$ {formatCurrency(loanAmount)}, sem nenhum centavo a mais. Condição especial válida para esta oferta.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full py-4 px-6 rounded-xl font-semibold text-base bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 shadow-md animate-slide-up-button"
          >
            Continuar com {selectedInstallments}x parcelas
          </button>
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
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out 0.2s backwards;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.6s ease-out 0.3s backwards;
        }

        .animate-slide-up-info {
          animation: slide-up 0.6s ease-out 0.5s backwards;
        }

        .animate-slide-up-button {
          animation: slide-up 0.6s ease-out 0.7s backwards;
        }
      `}</style>
    </div>
  );
}
