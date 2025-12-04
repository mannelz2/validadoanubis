import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithParams } from '../utils/urlParams';

export default function LoanTermsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, loanAmount, selectedInstallments, installmentValue, urlParams, profileAnswers, loanPriority, nubankCustomer, creditStatus } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/loan-terms'
    });
  }
  }, [navigate, userData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!userData) {
    return null;
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleAccept = () => {
    navigateWithParams(
      navigate,
      '/confirmacao-transferencia',
      location,
      {
        userData,
        loanAmount,
        selectedInstallments,
        installmentValue,
        profileAnswers,
        loanPriority,
        nubankCustomer,
        creditStatus
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Termos do Empréstimo
            </h1>
            <p className="text-sm text-gray-600">
              Leia atentamente antes de aceitar
            </p>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl p-5 sm:p-6 mb-6 shadow-sm animate-slide-up">
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Por este instrumento, o cliente e a empresa <strong>Nubank S/A</strong>, firmam o presente termo de empréstimo, segundo as condições a seguir:
              </p>

              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                O cliente solicita um empréstimo no valor total de <strong>R$ {formatCurrency(loanAmount)}</strong> com pagamento da primeira parcela somente em <strong>14/01/2026</strong>.
              </p>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-purple-900 mb-2">Condições do Empréstimo:</h3>
                <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
                  <li>Valor do empréstimo: R$ {formatCurrency(loanAmount)}</li>
                  <li>Número de parcelas: {selectedInstallments}x</li>
                  <li>Valor da parcela: R$ {formatCurrency(installmentValue)}</li>
                  <li>Taxa de juros: 0% (SEM JUROS)</li>
                  <li>Primeira parcela: 14/01/2026</li>
                </ul>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Ambas as partes concordam com os valores e condições estipuladas neste termo. Este termo visa assegurar que tanto você quanto Nubank tenham clareza sobre o que foi acordado, garantindo uma relação transparente e confiável.
              </p>

              <p className="text-sm text-gray-700 leading-relaxed mb-2">
                Cordialmente,
              </p>
              <p className="text-sm font-semibold text-purple-600">
                Nubank
              </p>
            </div>
          </div>

          <button
            ref={buttonRef}
            onClick={handleAccept}
            className="w-full py-4 px-6 rounded-xl font-semibold text-base bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 shadow-md animate-slide-up-button"
          >
            Li e aceito os termos
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

        .animate-slide-up-button {
          animation: slide-up 0.6s ease-out 0.4s backwards;
        }
      `}</style>
    </div>
  );
}
