import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { navigateWithParams } from '../utils/urlParams';

type PixKeyType = 'cpf' | 'email' | 'phone' | 'random';

export default function DataForReceivingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount: stateIndemnityAmount = 5960.50, urlParams, pixKeyType: initialPixKeyType, pixKey: initialPixKey } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const indemnityAmount = stateIndemnityAmount || 7854.63;
  const [pixKey, setPixKey] = useState(initialPixKey || '');
  const [detectedType, setDetectedType] = useState<PixKeyType | null>(initialPixKeyType || null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [manualType, setManualType] = useState<'cpf' | 'phone' | null>(null);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/dados-para-recebimento'
    });
  }, [userData, navigate]);

  if (!userData) {
    return null;
  }

  const firstName = userData.nome.split(' ')[0];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const detectPixKeyType = (value: string): PixKeyType | null | 'ambiguous' => {
    const cleanValue = value.trim();

    if (!cleanValue) return null;

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanValue)) {
      return 'email';
    }

    if (cleanValue.length >= 32) {
      return 'random';
    }

    const numbers = cleanValue.replace(/\D/g, '');

    if (/^[0-9.\-() ]+$/.test(cleanValue) && numbers.length >= 10) {
      if (numbers.length === 10 || numbers.length === 11) {
        return 'ambiguous';
      }
    }

    return null;
  };

  useEffect(() => {
    const type = detectPixKeyType(pixKey);

    if (type === 'ambiguous') {
      setShowTypeSelector(true);
      setDetectedType(null);
    } else {
      setShowTypeSelector(false);
      setManualType(null);
      setDetectedType(type as PixKeyType | null);
    }
  }, [pixKey]);

  useEffect(() => {
    if (manualType && showTypeSelector) {
      setDetectedType(manualType);
    }
  }, [manualType, showTypeSelector]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePixKeyChange = (value: string) => {
    setPixKey(value);
  };

  const getKeyTypeLabel = () => {
    switch (detectedType) {
      case 'cpf':
        return 'CPF detectado';
      case 'email':
        return 'E-mail detectado';
      case 'phone':
        return 'Telefone detectado';
      case 'random':
        return 'Chave aleatória detectada';
      default:
        return '';
    }
  };

  const handleContinue = () => {
    if (!detectedType || !pixKey.trim()) return;

    navigateWithParams(
      navigate,
      '/confirmar-pix',
      location,
      {
        userData,
        indemnityAmount,
        pixKeyType: detectedType,
        pixKey: pixKey
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 sm:mb-6 animate-fade-in-down">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Dados para Recebimento
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {firstName}, informe sua chave PIX para receber o valor
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-5 sm:p-6 mb-5 sm:mb-6 shadow-md text-center animate-slide-up">
            <p className="text-purple-100 text-xs sm:text-sm font-medium mb-2">
              Valor disponível para saque
            </p>
            <p className="text-white text-3xl sm:text-4xl font-semibold mb-2 sm:mb-3">
              R$ {formatCurrency(indemnityAmount)}
            </p>
            <p className="text-purple-100 text-xs sm:text-sm">
              Transferência via PIX em até 10 minutos
            </p>
          </div>

          <div className="mb-5 sm:mb-6 animate-slide-up-delayed">
            <label className="block text-gray-900 font-semibold mb-2 sm:mb-3 text-sm">
              Digite sua chave PIX: CPF, e-mail, telefone ou aleatória
            </label>
            <input
              type="text"
              value={pixKey}
              onChange={(e) => handlePixKeyChange(e.target.value)}
              placeholder="Digite sua chave PIX"
              className="w-full px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition-all duration-200 text-sm sm:text-base"
              autoFocus
            />
            {detectedType && !showTypeSelector && (
              <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-green-600 animate-fade-in">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{getKeyTypeLabel()}</span>
              </div>
            )}

            {showTypeSelector && (
              <div className="mt-3 bg-white border-2 border-purple-200 rounded-xl p-4 animate-fade-in">
                <p className="text-gray-900 font-semibold text-xs sm:text-sm mb-3">
                  Sua chave é CPF ou número de telefone?
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="keyType"
                      value="cpf"
                      checked={manualType === 'cpf'}
                      onChange={(e) => setManualType(e.target.value as 'cpf')}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">CPF</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer transition-all">
                    <input
                      type="radio"
                      name="keyType"
                      value="phone"
                      checked={manualType === 'phone'}
                      onChange={(e) => setManualType(e.target.value as 'phone')}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Número de Telefone</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={!detectedType || !pixKey.trim()}
            className={`w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-md animate-slide-up-button ${
              detectedType && pixKey.trim()
                ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuar
          </button>

          <div className="mt-5 sm:mt-6 bg-teal-50 border-2 border-teal-400 rounded-xl p-4 animate-slide-up-info">
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
          animation: slide-up 0.6s ease-out 0.3s backwards;
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

        .animate-slide-up-button {
          animation: slide-up 0.5s ease-out 0.4s backwards;
        }

        .animate-slide-up-info {
          animation: slide-up 0.5s ease-out 0.5s backwards;
        }
      `}</style>
    </div>
  );
}
