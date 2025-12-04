import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithParams } from '../utils/urlParams';

export default function CreditStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams, profileAnswers, loanPriority, nubankCustomer } = location.state || {};
  const userData = stateUserData || funnelData.userData;

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/status-credito'
    });
  }, [navigate, userData]);

  if (!userData) {
    return null;
  }

  const options = [
    {
      icon: AlertTriangle,
      text: 'Sim, tenho restrições',
      value: 'restricted',
      color: 'amber'
    },
    {
      icon: CheckCircle,
      text: 'Não, CPF limpo',
      value: 'clean',
      color: 'green'
    }
  ];

  const handleOptionSelect = (value: string) => {
    navigateWithParams(
      navigate,
      '/emprestimo-aprovado',
      location,
      {
        userData,
        indemnityAmount,
        profileAnswers,
        loanPriority,
        nubankCustomer,
        creditStatus: value
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 animate-fade-in-down">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Você está negativado?
            </h1>
            <p className="text-xs text-gray-600">
              Seja sincero, isso não impede sua aprovação
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

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fade-in-delayed">
            <p className="text-xs text-blue-800 text-center leading-relaxed">
              Independente da sua resposta, analisaremos sua solicitação e faremos o possível para aprovar seu empréstimo.
            </p>
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

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out 0.5s backwards;
        }
      `}</style>
    </div>
  );
}
