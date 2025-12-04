import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { Calendar } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function DueDateSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, loanAmount, selectedInstallments, installmentValue, protocol, urlParams, profileAnswers, loanPriority, nubankCustomer, creditStatus } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/due-date-selection'
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

  const dueDateOptions = [5, 10, 15, 20, 25];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleContinue = () => {
    if (!selectedDay) return;

    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.style.animation = 'slideOutLeft 0.4s ease-out forwards';
      setTimeout(() => {
        navigateWithParams(
          navigate,
          '/vsl',
          location,
          {
            userData,
            loanAmount,
            selectedInstallments,
            installmentValue,
            selectedDueDate: selectedDay,
            protocol,
            profileAnswers,
            loanPriority,
            nubankCustomer,
            creditStatus
          }
        );
      }, 300);
    } else {
      navigateWithParams(
        navigate,
        '/vsl',
        location,
        {
          userData,
          loanAmount,
          selectedInstallments,
          installmentValue,
          selectedDueDate: selectedDay,
          protocol,
          profileAnswers,
          loanPriority,
          nubankCustomer,
          creditStatus
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Escolha o dia de vencimento
            </h1>
            <p className="text-sm text-gray-600">
              Selecione o melhor dia para pagar suas parcelas
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 sm:p-6 mb-6 text-center shadow-md animate-slide-up">
            <p className="text-purple-100 text-sm mb-2">Valor da Parcela</p>
            <p className="text-white text-3xl sm:text-4xl font-bold mb-2">
              R$ {formatCurrency(installmentValue)}
            </p>
            <p className="text-purple-100 text-sm">
              {selectedInstallments}x sem juros
            </p>
          </div>

          <div className="mb-6 animate-slide-up-delayed">
            <p className="text-sm font-semibold text-gray-900 mb-4 text-center">
              Dia do vencimento mensal
            </p>
            <div className="grid grid-cols-5 gap-3">
              {dueDateOptions.map((day, index) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-xl font-bold text-lg transition-all duration-200 ${
                    selectedDay === day
                      ? 'bg-purple-600 text-white shadow-lg scale-110'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
                  }`}
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-slide-up-info">
            <p className="text-xs text-blue-800 leading-relaxed">
              {selectedDay ? (
                <>
                  <strong>Primeira parcela:</strong> 14/01/2026
                  <br />
                  <strong>Demais parcelas:</strong> Todo dia {selectedDay} de cada mês
                </>
              ) : (
                'Selecione um dia para ver as informações de vencimento'
              )}
            </p>
          </div>

          <button
            onClick={handleContinue}
            disabled={!selectedDay}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-md animate-slide-up-button ${
              selectedDay
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmar dia de vencimento
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
