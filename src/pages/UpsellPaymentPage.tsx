import { useNavigate, useLocation } from 'react-router-dom';
import { QrCode, Copy, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import UserMenu from '../components/UserMenu';
import { createTransaction } from '../services/pixService';
import { getUserName } from '../utils/userUtils';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { navigateWithParams, getTrackingData } from '../utils/urlParams';
import { trackInitiateCheckout } from '../utils/facebookPixel';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

export default function UpsellPaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { amount, title, redirectPath, cpf: stateCpf, userData: stateUserData } = location.state || {};
  const cpf = stateCpf || funnelData.cpf;
  const userData = stateUserData || funnelData.userData;
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showPaymentButton, setShowPaymentButton] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const hasInitialized = useRef(false);
  const hasNavigated = useRef(false);

  console.log('UpsellPaymentPage - CPF received:', cpf);
  console.log('UpsellPaymentPage - Amount:', amount);

  if (!amount || !cpf) {
    console.log('Missing data - redirecting. Amount:', amount, 'CPF:', cpf);
    navigate('/');
    return null;
  }

  const { transaction: polledTransaction } = useTransactionPolling({
    transactionId: transactionData?.id || null,
    enabled: !!transactionData?.id && !paymentCompleted,
    interval: 5000,
    onStatusChange: (transaction) => {
      console.log('Payment status changed:', transaction.status);
      const isPaid = transaction.status === 'completed' || transaction.status === 'authorized' || transaction.status === 'approved';
      if (isPaid && !hasNavigated.current) {
        hasNavigated.current = true;
        setPaymentCompleted(true);
        console.log('Payment completed! Redirecting to:', redirectPath);
        setTimeout(() => {
          if (redirectPath) {
            navigateWithParams(navigate, redirectPath, location, { cpf, amount, userData });
          } else {
            navigate('/');
          }
        }, 2000);
      }
    },
  });

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    saveFunnelData({
      cpf: cpf,
      currentStep: '/pagamento-upsell'
    });
  }, [cpf]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowPaymentButton(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initializeTransaction = async () => {
      try {
        setLoading(true);
        setError(null);

        const trackingData = getTrackingData(location);
        console.log('Upsell - Tracking data extracted:', trackingData);
        console.log('Upsell - userData:', userData);

        const transaction = await createTransaction({
          cpf: cpf.replace(/\D/g, ''),
          amount: amount,
          pixKey: cpf.replace(/\D/g, ''),
          customerName: userData?.nome || 'Cliente',
          customerEmail: userData?.email || `${cpf}@cliente.com`,
          customerPhone: userData?.telefone || '11999999999',
          customerBirthdate: userData?.dataNascimento || '1990-01-01',
          customerAddress: userData?.endereco ? {
            zipcode: userData.endereco.cep,
            street: userData.endereco.logradouro,
            number: userData.endereco.numero,
            complement: userData.endereco.complemento,
            neighborhood: userData.endereco.bairro,
            city: userData.endereco.cidade,
            state: userData.endereco.estado,
          } : undefined,
          utmSource: trackingData.utmSource,
          utmMedium: trackingData.utmMedium,
          utmCampaign: trackingData.utmCampaign,
          utmTerm: trackingData.utmTerm,
          utmContent: trackingData.utmContent,
          src: trackingData.src,
          sck: trackingData.sck,
          productId: trackingData.productId,
          userAgent: trackingData.userAgent,
        }, { createReceipt: false });

        setTransactionData(transaction);
        setLoading(false);

        trackInitiateCheckout({
          value: amount,
          currency: 'BRL',
          content_type: 'upsell',
          content_name: title || 'Upsell',
          content_ids: [transaction.id],
          num_items: 1,
        });
      } catch (err: any) {
        console.error('Failed to create transaction:', err);
        setError(err.message || 'Falha ao criar transação. Tente novamente.');
        setLoading(false);
      }
    };

    initializeTransaction();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleCopyCode = () => {
    if (transactionData?.qr_code) {
      navigator.clipboard.writeText(transactionData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaymentComplete = async () => {
    if (!transactionData?.id) {
      setError('ID da transação não encontrado');
      return;
    }

    try {
      const { getTransactionStatus } = await import('../services/pixService');
      const transaction = await getTransactionStatus(transactionData.id);

      const isPaid = transaction.status === 'completed' || transaction.status === 'authorized' || transaction.status === 'approved';

      if (!isPaid) {
        setError('Pagamento ainda não foi confirmado. Por favor, realize o pagamento primeiro.');
        return;
      }

      setPaymentCompleted(true);
      hasNavigated.current = true;

      setTimeout(() => {
        if (redirectPath) {
          navigateWithParams(navigate, redirectPath, location, { cpf, amount });
        } else {
          navigate('/');
        }
      }, 1500);
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      setError('Erro ao verificar pagamento. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
        <Header showUserIcon={true} onMenuClick={handleMenuClick} />
        <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={getUserName()} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Gerando código de pagamento...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
        <Header showUserIcon={true} onMenuClick={handleMenuClick} />
        <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={getUserName()} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-red-900 mb-1">Erro ao gerar pagamento</h2>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 px-4 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Voltar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName="Usuário" />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 sm:mb-6 animate-fade-in-down">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              {title || 'Pagamento da Taxa'}
            </h1>
            <p className="text-sm text-gray-600">
              Escaneie o QR Code ou copie o código PIX
            </p>
          </div>

          <div className="space-y-4 mb-5 sm:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 sm:p-5 text-white shadow-md animate-slide-up">
              <div className="text-center">
                <p className="text-sm text-purple-100 mb-1">Valor a pagar</p>
                <p className="text-3xl font-bold">R$ {formatCurrency(amount)}</p>
                <p className="text-xs text-purple-100 mt-1">Nova Cobrança</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm animate-slide-up-delayed">
              <div className="flex flex-col items-center">
                {transactionData?.qr_code_image ? (
                  <div className="w-64 h-64 mb-4">
                    <img
                      src={transactionData.qr_code_image}
                      alt="QR Code"
                      className="w-full h-full rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-48 h-48 text-gray-400" />
                  </div>
                )}

                <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-gray-500 mb-2 text-center">Código PIX</p>
                  <p className="text-xs text-gray-900 break-all text-center font-mono leading-relaxed">
                    {transactionData?.qr_code || 'Carregando...'}
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  disabled={!transactionData?.qr_code}
                  className="w-full py-3 px-4 rounded-lg font-semibold text-sm bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Código copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copiar código PIX
                    </>
                  )}
                </button>
              </div>
            </div>

            {paymentCompleted ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-slide-up-summary">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900 mb-1">
                      Pagamento confirmado!
                    </p>
                    <p className="text-xs text-green-700">
                      Redirecionando para a próxima etapa...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 animate-slide-up-summary">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Aguardando pagamento
                    </p>
                    <p className="text-xs text-amber-700">
                      Verificando pagamento automaticamente a cada 5 segundos...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 animate-slide-up-button">
            <p className="text-xs text-gray-600 mb-2">Como pagar:</p>
            <ol className="space-y-2 text-xs text-gray-700">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">1.</span>
                <span>Abra o app do seu banco</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">2.</span>
                <span>Escolha pagar via PIX QR Code ou Pix Copia e Cola</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">3.</span>
                <span>Escaneie o código ou cole o código copiado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-purple-600">4.</span>
                <span>Confirme o pagamento</span>
              </li>
            </ol>
          </div>

          {showPaymentButton ? (
            <button
              onClick={handlePaymentComplete}
              className="w-full py-3 px-4 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Já fiz o pagamento
            </button>
          ) : (
            <div className="w-full py-3 px-4 rounded-lg font-semibold bg-gray-300 text-gray-600 cursor-not-allowed text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Aguarde {countdown}s para continuar</span>
              </div>
            </div>
          )}
        </div>
      </main>

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

        .animate-slide-up-summary {
          animation: slide-up 0.6s ease-out 0.6s backwards;
        }

        .animate-slide-up-button {
          animation: slide-up 0.6s ease-out 0.8s backwards;
        }
      `}</style>
    </div>
  );
}
