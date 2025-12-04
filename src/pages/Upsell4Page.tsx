import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { AlertTriangle, FileText, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { getUserName } from '../utils/userUtils';
import { navigateWithParams } from '../utils/urlParams';
import { trackPurchase } from '../utils/facebookPixel';

export default function Upsell4Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    trackPurchase({
      value: 18.90,
      currency: 'BRL',
      content_type: 'upsell',
      content_name: 'Upsell',
      num_items: 1,
    });

    saveFunnelData({
      currentStep: '/upsell-4'
    });
  }, []);

  const getPaymentDeadline = () => {
    const now = new Date();
    return now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handlePayment = () => {
    const { userData } = location.state || {};
    const cpf = userData?.cpf || sessionStorage.getItem('user_cpf') || localStorage.getItem('user_cpf');
    console.log('Upsell4 - CPF from storage:', cpf);

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
        amount: 17.20,
        title: 'Taxa de Emissão de Nota Fiscal',
        redirectPath: '/upsell-5',
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
          <div className="text-center mb-6 animate-fade-in-down">
            <div className="flex justify-center mb-4">
              <img
                src="/logo-nfs.png"
                alt="Nota Fiscal de Serviço"
                className="h-24 w-auto"
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              PAGAMENTO PENDENTE!
            </h1>
            <p className="text-base sm:text-lg text-gray-600 font-medium">
              Pagamento Necessário para Emissão de Nota Fiscal
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 text-center">
              Para garantir a conformidade fiscal e a segurança do seu empréstimo, é necessário o pagamento de uma taxa para a emissão da nota fiscal.
            </p>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed text-center">
              Esta taxa cobre os custos administrativos associados à emissão e entrega do valor.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-center gap-3 mb-5">
              <img
                src="/logo-nfs.png"
                alt="Nota Fiscal de Serviço"
                className="h-12 w-auto"
              />
            </div>

            <h2 className="text-lg font-bold text-gray-900 text-center mb-4">
              Informações de Pagamento
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Valor:</span>
                <span className="text-lg font-bold text-green-600">R$ 17,20</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Prazo para Pagamento:
                </span>
                <span className="text-sm font-bold text-red-600">até {getPaymentDeadline()}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Método de Pagamento:</span>
                <span className="text-sm font-bold text-gray-900">Pix</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6 shadow-lg animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              <p className="text-sm text-red-700 font-bold">IMPORTANTE</p>
            </div>
            <p className="text-xs sm:text-sm text-red-700 text-center leading-relaxed">
              O não pagamento da taxa para a emissão da nota fiscal resultará no{' '}
              <span className="font-bold">NÃO envio do valor</span> e o{' '}
              <span className="font-bold">CPF informado será negativado</span>.
            </p>
          </div>

          <button
            onClick={handlePayment}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            EFETUAR PAGAMENTO DA TAXA
          </button>
        </div>
      </main>

      <Footer />

      {showLoadingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl animate-scale-up">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                Processando solicitação…
              </h3>
              <p className="text-sm text-gray-600 text-center">
                Aguarde enquanto validamos sua taxa de emissão.
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
          animation: slide-up 0.4s ease-out backwards;
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

        @keyframes scale-up {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
