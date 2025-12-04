import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { User, Mail, Phone, CheckCircle, ShieldCheck, Edit2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function TransferConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, loanAmount, selectedInstallments, installmentValue, urlParams, profileAnswers, loanPriority, nubankCustomer, creditStatus } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [protocol] = useState(() => {
    return Math.random().toString(36).substring(2, 15).toUpperCase();
  });
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | ''>('');
  const [validationError, setValidationError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLinkingPopup, setShowLinkingPopup] = useState(false);
  const [linkingSuccess, setLinkingSuccess] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/transfer-confirmation'
    });
  }
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

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getPixKeyPlaceholder = () => {
    switch (pixKeyType) {
      case 'cpf':
        return '000.000.000-00';
      case 'email':
        return 'seuemail@exemplo.com';
      case 'phone':
        return '21987654321';
      default:
        return '';
    }
  };

  const getPixKeyLabel = () => {
    switch (pixKeyType) {
      case 'cpf':
        return 'Digite sua chave PIX (CPF):';
      case 'email':
        return 'Digite sua chave PIX (E-mail):';
      case 'phone':
        return 'Digite sua chave PIX (Telefone com DDD):';
      default:
        return '';
    }
  };

  const validatePixKey = (value: string, type: string): boolean => {
    setValidationError('');

    if (!value.trim()) {
      return false;
    }

    switch (type) {
      case 'cpf': {
        const cleanCpf = value.replace(/\D/g, '');
        if (cleanCpf.length !== 11) {
          setValidationError('CPF deve conter exatamente 11 dígitos');
          return false;
        }
        if (!/^\d+$/.test(cleanCpf)) {
          setValidationError('CPF deve conter apenas números');
          return false;
        }
        return true;
      }

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          setValidationError('E-mail inválido');
          return false;
        }
        if (value.includes(' ')) {
          setValidationError('E-mail não pode conter espaços');
          return false;
        }
        return true;
      }

      case 'phone': {
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length !== 11) {
          setValidationError('Telefone deve conter exatamente 11 dígitos (DDD + 9 dígitos)');
          return false;
        }
        if (!/^\d+$/.test(cleanPhone)) {
          setValidationError('Telefone deve conter apenas números');
          return false;
        }
        return true;
      }

      default:
        return false;
    }
  };

  const formatCpf = (value: string) => {
    const cleanCpf = value.replace(/\D/g, '');
    if (cleanCpf.length <= 3) return cleanCpf;
    if (cleanCpf.length <= 6) return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3)}`;
    if (cleanCpf.length <= 9) return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6)}`;
    return `${cleanCpf.slice(0, 3)}.${cleanCpf.slice(3, 6)}.${cleanCpf.slice(6, 9)}-${cleanCpf.slice(9, 11)}`;
  };

  const handlePixKeyChange = (value: string) => {
    setValidationError('');

    switch (pixKeyType) {
      case 'cpf':
        const cleanCpf = value.replace(/\D/g, '');
        if (cleanCpf.length <= 11) {
          setPixKey(formatCpf(cleanCpf));
        }
        break;

      case 'email':
        if (!value.includes(' ')) {
          setPixKey(value);
        }
        break;

      case 'phone':
        const cleanPhone = value.replace(/\D/g, '');
        if (cleanPhone.length <= 11) {
          setPixKey(cleanPhone);
        }
        break;

      default:
        setPixKey(value);
    }
  };

  const handleAuthorize = () => {
    if (!pixKey.trim() || !pixKeyType) return;

    if (!validatePixKey(pixKey, pixKeyType)) {
      return;
    }

    setIsTransitioning(true);
    setTimeout(() => {
      setShowConfirmation(true);
      setIsTransitioning(false);
    }, 400);
  };

  const handleConfirmPix = () => {
    setShowLinkingPopup(true);

    setTimeout(() => {
      setLinkingSuccess(true);
    }, 2000);

    setTimeout(() => {
      navigateWithParams(
        navigate,
        '/selecionar-vencimento',
        location,
        {
          userData,
          loanAmount,
          selectedInstallments,
          installmentValue,
          protocol,
          profileAnswers,
          loanPriority,
          nubankCustomer,
          creditStatus,
          pixKey: pixKey.trim(),
          pixKeyType
        }
      );
    }, 4000);
  };

  const handleEditKey = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setShowConfirmation(false);
      setPixKey('');
      setPixKeyType('');
      setValidationError('');
      setIsTransitioning(false);
    }, 400);
  };

  const getPixKeyTypeLabel = () => {
    switch (pixKeyType) {
      case 'cpf':
        return 'CPF';
      case 'email':
        return 'E-mail';
      case 'phone':
        return 'Telefone';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          {showConfirmation ? (
            <div className={isTransitioning ? 'animate-fade-out' : 'animate-fade-in-screen'}>
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Confirme sua Chave PIX
              </h1>
              <p className="text-sm text-gray-600 text-center mb-6">
                Verifique se os dados estão corretos antes de prosseguir
              </p>

              <div className="bg-purple-600 rounded-2xl p-6 mb-4 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    {pixKeyType === 'cpf' && <User className="w-6 h-6 text-white" />}
                    {pixKeyType === 'email' && <Mail className="w-6 h-6 text-white" />}
                    {pixKeyType === 'phone' && <Phone className="w-6 h-6 text-white" />}
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">
                      Chave PIX - {getPixKeyTypeLabel()}
                    </h2>
                    <p className="text-purple-100 text-sm">
                      Confirme os dados abaixo
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Sua chave PIX:</p>
                  <p className="text-xl font-bold text-purple-600 break-all">
                    {pixKey}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 mb-4 shadow-md space-y-5">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Nome Completo</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-base font-semibold text-gray-900">
                      {userData.nome}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Data de Nascimento</p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-base font-semibold text-gray-900">
                      {userData.dataNascimento}
                    </p>
                  </div>
                </div>

                {userData.mae && userData.mae !== 'Não informado' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Nome da Mãe</p>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-base font-semibold text-gray-900">
                        {userData.mae}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleConfirmPix}
                className="w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-md mb-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-5 h-5" />
                Confirmar
              </button>

              <button
                onClick={handleEditKey}
                className="w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-md flex items-center justify-center gap-2 bg-gray-500 hover:bg-gray-600 text-white"
              >
                <Edit2 className="w-5 h-5" />
                Editar Chave
              </button>
            </div>
          ) : (
            <div className={isTransitioning ? 'animate-fade-out' : 'animate-fade-in-screen'}>
          <div className="bg-white rounded-xl shadow-md p-5 mb-6">
            <h1 className="text-xl font-semibold text-gray-800 text-center mb-5 flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-gray-900 flex-shrink-0" />
              <span className="whitespace-nowrap">Confirmação de Transferência</span>
            </h1>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Transferindo</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {formatCurrency(loanAmount)}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Tipo</p>
                <p className="text-base font-semibold text-gray-900">Pix</p>
              </div>

              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-600">Protocolo</p>
                <p className="text-sm font-semibold text-gray-900 break-all text-right max-w-[60%]">
                  {protocol}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            <h2 className="text-base font-normal text-gray-900 mb-4">
              Selecione o tipo da sua chave PIX:
            </h2>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => {
                  setPixKeyType('cpf');
                  if (userData?.cpf) {
                    const formattedCPF = userData.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                    setPixKey(formattedCPF);
                  } else {
                    setPixKey('');
                  }
                  setValidationError('');
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  pixKeyType === 'cpf'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  pixKeyType === 'cpf' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <User className={`w-5 h-5 ${pixKeyType === 'cpf' ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>
                <span className="text-base font-normal text-gray-900">CPF</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPixKeyType('email');
                  setPixKey('');
                  setValidationError('');
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  pixKeyType === 'email'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  pixKeyType === 'email' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Mail className={`w-5 h-5 ${pixKeyType === 'email' ? 'text-blue-600' : 'text-gray-600'}`} />
                </div>
                <span className="text-base font-normal text-gray-900">E-mail</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPixKeyType('phone');
                  setPixKey('');
                  setValidationError('');
                }}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  pixKeyType === 'phone'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  pixKeyType === 'phone' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <Phone className={`w-5 h-5 ${pixKeyType === 'phone' ? 'text-purple-600' : 'text-gray-600'}`} />
                </div>
                <span className="text-base font-normal text-gray-900">Telefone</span>
              </button>
            </div>

            {pixKeyType && (
              <div className="animate-fade-in-delayed">
                <label className="block text-sm font-normal text-gray-900 mb-3">
                  {getPixKeyLabel()}
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  placeholder={getPixKeyPlaceholder()}
                  disabled={pixKeyType === 'cpf'}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-base ${
                    validationError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  } ${pixKeyType === 'cpf' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
                {validationError && (
                  <p className="mt-2 text-sm text-red-600">
                    {validationError}
                  </p>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleAuthorize}
            disabled={!pixKey.trim() || !pixKeyType}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
              pixKey.trim() && pixKeyType
                ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Confirmar PIX
          </button>

          {pixKeyType && (
            <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-teal-900 mb-1">
                    Importante
                  </h3>
                  <p className="text-xs text-teal-800 leading-relaxed">
                    Verifique cuidadosamente sua chave PIX antes de confirmar. O valor será transferido diretamente para a conta vinculada a esta chave.
                  </p>
                </div>
              </div>
            </div>
          )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showLinkingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl animate-scale-in">
            {!linkingSuccess ? (
              <div className="text-center">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Vinculando Chave PIX
                </h2>
                <p className="text-sm text-gray-600">
                  Aguarde enquanto processamos sua chave PIX...
                </p>
              </div>
            ) : (
              <div className="text-center animate-fade-in">
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-scale-in">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Chave PIX Vinculada com Sucesso!
                </h2>
                <p className="text-sm text-gray-600">
                  Redirecionando para a próxima etapa...
                </p>
              </div>
            )}
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

        @keyframes fade-in-delayed {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.5s ease-out 0.6s backwards;
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

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-20px);
          }
        }
        .animate-fade-out {
          animation: fade-out 0.4s ease-out forwards;
        }

        @keyframes fade-in-screen {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-screen {
          animation: fade-in-screen 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
