import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Wallet, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { getUserName } from '../utils/userUtils';
import { trackPurchase } from '../utils/facebookPixel';
import { clearFunnelData } from '../utils/funnelStorage';

export default function FinalPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    trackPurchase({
      value: 17.30,
      currency: 'BRL',
      content_type: 'upsell',
      content_name: 'Upsell',
      num_items: 1,
    });
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    sessionStorage.clear();
    clearFunnelData();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={getUserName()} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 animate-scale-in">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse-scale">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 animate-fade-in">
                Solicitação concluída com sucesso!
              </h1>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
                Se a sua solicitação de crédito for aprovada, o valor será liberado em até 24 horas na sua conta cadastrada.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-5 mb-6 space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Status da análise</p>
                  <p className="text-sm font-semibold text-gray-900">Concluída</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Prazo de liberação</p>
                  <p className="text-sm font-semibold text-gray-900">Até 24 horas após aprovação</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wallet className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Forma de recebimento</p>
                  <p className="text-sm font-semibold text-gray-900">Conta ou chave cadastrada</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                  Você receberá uma notificação assim que o processo for finalizado. Fique atento ao seu e-mail e, se necessário, ao aplicativo para acompanhar o status da sua solicitação.
                </p>
              </div>
            </div>

            <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={handleBackToHome}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-base hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Voltar ao início
              </button>

              <button
                onClick={handleLogout}
                className="w-full bg-white text-purple-600 py-4 px-6 rounded-xl font-semibold text-base border-2 border-purple-600 hover:bg-purple-50 transition-all duration-200"
              >
                Sair
              </button>
            </div>
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
          animation: slide-up 0.5s ease-out backwards;
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
      `}</style>
    </div>
  );
}
