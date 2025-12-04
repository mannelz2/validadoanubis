import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { XCircle, AlertTriangle, Clock, FileText } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { getUserName } from '../utils/userUtils';
import { navigateWithParams } from '../utils/urlParams';
import { trackPurchase } from '../utils/facebookPixel';

export default function Upsell5Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    trackPurchase({
      value: 17.20,
      currency: 'BRL',
      content_type: 'upsell',
      content_name: 'Upsell',
      num_items: 1,
    });

    saveFunnelData({
      currentStep: '/upsell-5'
    });
  }, []);

  const loadingSteps = [
    'Consultando pagamento…',
    'Buscando comprovante…',
    'Verificando status…'
  ];

  const handleRetryPayment = () => {
    const { userData } = location.state || {};
    const cpf = userData?.cpf || sessionStorage.getItem('user_cpf') || localStorage.getItem('user_cpf');
    console.log('Upsell5 - CPF from storage:', cpf);

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
        amount: 17.30,
        title: 'Regularização de Taxa de Emissão',
        redirectPath: '/final',
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
          {/* Bloco de Erro Principal */}
          <div className="text-center mb-6 animate-fade-in-down">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse-scale">
                <XCircle className="w-12 h-12 text-red-600 animate-shake" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 animate-fade-in">
              Pagamento Não Processado!
            </h1>
            <p className="text-base sm:text-lg text-gray-700 font-medium mb-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Ocorreu um erro ao tentar validar o pagamento da taxa obrigatória.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Durante o processo de emissão da Nota Fiscal, o sistema não conseguiu confirmar o pagamento da tarifa necessária para concluir a operação. Sem essa confirmação, a emissão não pode ser finalizada.
            </p>
          </div>

          {/* Seção de Detalhes do Erro */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-slide-up hover:shadow-2xl transition-all duration-300" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 animate-bounce-soft">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  Motivo identificado pelo sistema:
                </h2>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2 animate-fade-in-left" style={{ animationDelay: '0.3s' }}>
                    <span className="text-red-600 font-bold">•</span>
                    <span>Falha na autenticação do pagamento</span>
                  </li>
                  <li className="flex items-start gap-2 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
                    <span className="text-red-600 font-bold">•</span>
                    <span>Comprovante não encontrado</span>
                  </li>
                  <li className="flex items-start gap-2 animate-fade-in-left" style={{ animationDelay: '0.5s' }}>
                    <span className="text-red-600 font-bold">•</span>
                    <span>Transação não confirmada pelo emissor</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <p className="text-sm text-blue-900 font-medium">
                <span className="font-bold">Para resolver:</span> Finalize o pagamento da taxa de emissão para liberar a operação.
              </p>
            </div>
          </div>

          {/* Bloco Informações da Taxa */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-slide-up hover:shadow-2xl transition-all duration-300" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-3 mb-5 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <img
                src="/logo-nfs.png"
                alt="Nota Fiscal de Serviço"
                className="h-12 w-auto"
              />
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center animate-pulse-soft">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Informações da Taxa
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 animate-fade-in-left" style={{ animationDelay: '0.4s' }}>
                <span className="text-sm text-gray-600 font-medium">Valor da taxa:</span>
                <span className="text-base font-bold text-green-600 animate-pulse-value">R$ 17,30</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 animate-fade-in-left" style={{ animationDelay: '0.5s' }}>
                <span className="text-sm text-gray-600 font-medium">Forma de pagamento:</span>
                <span className="text-base font-bold text-gray-900">PIX</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 animate-fade-in-left" style={{ animationDelay: '0.6s' }}>
                <span className="text-sm text-gray-600 font-medium">Status atual:</span>
                <span className="text-base font-bold text-red-600 animate-blink">Não confirmado</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 animate-fade-in-left" style={{ animationDelay: '0.7s' }}>
                <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin-slow" />
                  Prazo para regularização:
                </span>
                <span className="text-base font-bold text-gray-900">Imediato</span>
              </div>
            </div>
          </div>

          {/* Mensagem de Consequência */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 rounded-xl p-4 mb-6 animate-slide-up hover:border-gray-300 transition-all duration-300" style={{ animationDelay: '0.3s' }}>
            <p className="text-sm text-gray-700 text-center leading-relaxed animate-fade-in" style={{ animationDelay: '0.8s' }}>
              Enquanto o pagamento não for confirmado, a emissão da Nota Fiscal permanecerá pendente.
            </p>
          </div>

          {/* Botão Principal */}
          <button
            onClick={handleRetryPayment}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-base hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            FAZER PAGAMENTO NOVAMENTE
          </button>
        </div>
      </main>

      <Footer />

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scale-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
            <p className="text-center text-gray-900 font-semibold text-lg mb-2">
              {loadingSteps[loadingStep]}
            </p>
            <p className="text-center text-gray-600 text-sm">
              Aguarde um momento
            </p>
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
          animation: fade-in-down 0.5s ease-out;
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
          animation: fade-in 0.6s ease-out backwards;
        }

        @keyframes fade-in-left {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-left {
          animation: fade-in-left 0.5s ease-out backwards;
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
          animation: slide-up 0.4s ease-out backwards;
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
          animation: scale-in 0.3s ease-out;
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
          animation: pulse-scale 2s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        @keyframes bounce-soft {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-bounce-soft {
          animation: bounce-soft 2s ease-in-out infinite;
        }

        @keyframes pulse-soft {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.98);
          }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }

        @keyframes pulse-value {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-value {
          animation: pulse-value 1.5s ease-in-out infinite;
        }

        @keyframes blink {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-blink {
          animation: blink 2s ease-in-out infinite;
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
