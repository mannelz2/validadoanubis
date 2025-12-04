import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle, Video } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function VSLPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, loanAmount, selectedInstallments, installmentValue, selectedDueDate, protocol, urlParams, profileAnswers, loanPriority, nubankCustomer, creditStatus } = location.state || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [countdown, setCountdown] = useState(50);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userData) {
      navigate('/');
    }
  }, [navigate, userData]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsButtonEnabled(true);
    }
  }, [countdown]);

  useEffect(() => {
    const playerScript = document.createElement('script');
    playerScript.src = 'https://scripts.converteai.net/4d4e70f9-0240-4c3c-b9ad-d61479b06700/players/6930f7cb8f0253bca6641105/v4/player.js';
    playerScript.async = true;
    document.head.appendChild(playerScript);

    return () => {
      document.head.removeChild(playerScript);
    };
  }, []);

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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleContinue = () => {
    navigateWithParams(
      navigate,
      '/detalhamento-taxas',
      location,
      {
        userData,
        indemnityAmount: loanAmount,
        pixKeyType: 'cpf',
        pixKey: userData.cpf,
        loanAmount,
        selectedInstallments,
        installmentValue,
        selectedDueDate,
        protocol,
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

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20 animate-slide-in-right">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-5 py-2.5 mb-5 animate-pulse-urgent">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm sm:text-base font-semibold text-red-700">Informação Importante</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Última etapa para liberar seu empréstimo
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-2">
              <span className="font-semibold">{firstName}</span>, assista ao vídeo e veja como liberar o seu empréstimo de <span className="text-green-600 font-bold">R$ {formatCurrency(loanAmount)}</span>
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 mb-5 shadow-lg animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Vídeo Explicativo</h2>
              </div>
            </div>

            <div className="relative w-full rounded-xl overflow-hidden bg-gray-900 shadow-md">
              <vturb-smartplayer
                id="vid-6930f7cb8f0253bca6641105"
                style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '400px' }}
              />
            </div>

            {!isButtonEnabled && (
              <div className="mt-5 animate-slide-up">
                <div className="bg-purple-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-purple-900 font-semibold text-sm">Liberando seu empréstimo...</span>
                  </div>
                  <div className="bg-white rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 ease-linear"
                      style={{ width: `${((50 - countdown) / 50) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {isButtonEnabled && (
              <div ref={buttonRef} className="mt-5 animate-slide-up">
                <button
                  onClick={handleContinue}
                  className="w-full text-base sm:text-lg font-bold py-4 sm:py-5 px-6 rounded-xl transition-all duration-300 uppercase bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transform hover:-translate-y-1 animate-pulse-subtle-fast"
                >
                  Liberar Empréstimo Agora
                </button>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg animate-slide-up border-l-4 border-purple-600">
            <div className="mb-5">
              <span className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-4 shadow-md">
                IMPORTANTE
              </span>
              <div className="flex items-start gap-2.5 mb-4">
                <svg className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Por que solicitamos o Seguro Prestamista?</h3>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
              Essa proteção garante que seu empréstimo seja quitado mesmo em casos de:
            </p>

            <div className="flex flex-wrap gap-2.5 mb-5">
              <span className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Perda de renda
              </span>
              <span className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Acidente
              </span>
              <span className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 text-gray-700 text-sm font-semibold px-4 py-2 rounded-full shadow-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                </svg>
                Invalidez
              </span>
            </div>

            <div className="space-y-4">
              <h4 className="text-base sm:text-lg font-bold text-gray-900">Além disso:</h4>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  O valor do seu empréstimo é tratado como prioridade, garantindo depósito em <span className="font-semibold">5 minutos</span> após o pagamento
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  O valor pago pelo seguro é <span className="font-semibold">abatido da primeira parcela</span>
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  <span className="font-semibold">Não é necessário</span> apresentar bens como garantia
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                  Assista o vídeo explicativo acima
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
