import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { User, Mail, Phone, Key } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithParams } from '../utils/urlParams';

type PixKeyType = 'cpf' | 'email' | 'phone' | 'random';

export default function PixConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount = 5960.50, pixKeyType, pixKey, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;

  if (!userData || !pixKeyType || !pixKey) {
    navigate('/');
    return null;
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getPixTypeLabel = () => {
    switch (pixKeyType) {
      case 'cpf':
        return 'CPF';
      case 'email':
        return 'E-mail';
      case 'phone':
        return 'Telefone';
      case 'random':
        return 'Chave Aleatória';
      default:
        return '';
    }
  };

  const getPixIcon = () => {
    switch (pixKeyType) {
      case 'cpf':
        return User;
      case 'email':
        return Mail;
      case 'phone':
        return Phone;
      case 'random':
        return Key;
      default:
        return User;
    }
  };

  const handleConfirm = () => {
    navigateWithParams(
      navigate,
      '/detalhamento-taxas',
      location,
      {
        userData,
        indemnityAmount,
        pixKeyType,
        pixKey
      }
    );
  };

  const handleBack = () => {
    navigateWithParams(
      navigate,
      '/dados-para-recebimento',
      location,
      {
        userData,
        indemnityAmount,
        pixKeyType,
        pixKey
      }
    );
  };

  const Icon = getPixIcon();

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 sm:mb-6 animate-fade-in-down">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Confirme sua Chave PIX
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Verifique se os dados estão corretos antes de prosseguir
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-5 sm:p-6 mb-5 sm:mb-6 shadow-md animate-slide-up">
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-purple-100 text-xs font-medium">
                  Chave PIX - {getPixTypeLabel()}
                </p>
                <p className="text-white text-sm font-semibold">
                  Confirme os dados abaixo
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <p className="text-gray-600 text-xs mb-2">
                Sua chave PIX:
              </p>
              <p className="text-purple-600 text-sm sm:text-base font-semibold break-all">
                {pixKey}
              </p>
            </div>
          </div>

          <div className="mb-5 sm:mb-6 bg-teal-50 border-2 border-teal-400 rounded-xl p-4 animate-slide-up-delayed">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-teal-800 font-semibold text-xs sm:text-sm mb-1">
                  Importante
                </h3>
                <p className="text-teal-700 text-xs leading-relaxed">
                  Verifique cuidadosamente sua chave PIX antes de confirmar. O valor será transferido diretamente para a conta vinculada a esta chave.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 sm:space-y-3 animate-slide-up-buttons">
            <button
              onClick={handleConfirm}
              className="w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-md bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
            >
              Confirmar Chave PIX
            </button>

            <button
              onClick={handleBack}
              className="w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              Voltar e Corrigir
            </button>
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
          animation: slide-up 0.6s ease-out 0.4s backwards;
        }

        .animate-slide-up-buttons {
          animation: slide-up 0.6s ease-out 0.6s backwards;
        }

      `}</style>
    </div>
  );
}
