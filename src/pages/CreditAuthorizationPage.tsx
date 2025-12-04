import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { Shield, FileText, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function CreditAuthorizationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams, profileAnswers } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [agreed, setAgreed] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/autorizacao-credito'
    });
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

  const handleContinue = () => {
    if (!agreed) return;

    navigateWithParams(
      navigate,
      '/prioridade-emprestimo',
      location,
      {
        userData,
        indemnityAmount,
        profileAnswers
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <div className="text-center mb-6 sm:mb-8 animate-fade-in-down">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Autorização de Análise de Crédito
            </h1>
            <p className="text-sm text-gray-600">
              Leia atentamente antes de prosseguir
            </p>
          </div>

          <div className="bg-white border-2 border-purple-200 rounded-xl p-5 sm:p-6 mb-6 shadow-sm animate-slide-up">
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  Importante
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  O crédito está sujeito a análise. Os dados fornecidos por você a seguir serão utilizados para aquisição do empréstimo.
                </p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-purple-900 mb-2">
                Autorização de Consulta
              </h3>
              <p className="text-sm text-purple-800 leading-relaxed">
                Autorizo a consulta ao <strong>SCR - Sistema de Crédito do Banco Central</strong> e aos cadastros e órgãos de proteção ao crédito para análise da minha solicitação de empréstimo.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  Esta consulta não afeta negativamente seu score de crédito e é necessária para avaliar sua elegibilidade para o empréstimo.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-2 animate-slide-up-delayed">
            <p className="text-xs text-red-600 mb-3 font-medium">
              * Marque a caixa abaixo para continuar
            </p>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  />
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  Li e concordo com os termos acima. Autorizo a consulta aos meus dados cadastrais e histórico de crédito para análise da solicitação.
                </span>
              </label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={!agreed}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-md animate-slide-up-button ${
              agreed
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Concordar e Continuar
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
          animation: slide-up 0.6s ease-out 0.4s backwards;
        }

        .animate-slide-up-button {
          animation: slide-up 0.6s ease-out 0.6s backwards;
        }
      `}</style>
    </div>
  );
}
