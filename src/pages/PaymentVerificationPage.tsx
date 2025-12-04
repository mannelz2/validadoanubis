import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import { useTransactionPolling } from '../hooks/useTransactionPolling';
import { navigateWithParams } from '../utils/urlParams';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function PaymentVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, pixKeyType, pixKey, urlParams, transactionId } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [receiptChecked, setReceiptChecked] = useState(false);
  const [isFirstPayment, setIsFirstPayment] = useState(false);

  const { transaction, loading, error } = useTransactionPolling({
    transactionId,
    enabled: !!transactionId,
    interval: 5000,
    onStatusChange: (updatedTransaction) => {
      if (updatedTransaction.status === 'completed') {
        console.log('Payment completed!');
      }
    },
  });

  useEffect(() => {
    if (transaction?.status === 'completed' && !receiptChecked) {
      checkForReceipt();
    }
  }, [transaction?.status, receiptChecked]);

  const checkForReceipt = async () => {
    try {
      setReceiptChecked(true);

      const { data: existingReceipts, error: checkError } = await supabase
        .from('payment_receipts')
        .select('*')
        .eq('cpf', userData?.cpf || transaction?.cpf)
        .eq('status', 'receipt_uploaded');

      if (checkError) {
        console.error('Error checking receipts:', checkError);
        proceedToNextPage();
        return;
      }

      if (!existingReceipts || existingReceipts.length === 0) {
        setIsFirstPayment(true);

        const { error: insertError } = await supabase
          .from('payment_receipts')
          .insert({
            transaction_id: transactionId,
            cpf: userData?.cpf || transaction?.cpf || '',
            customer_name: userData?.name || 'Cliente',
            amount: transaction?.amount || 0,
            status: 'pending_receipt',
          });

        if (insertError) {
          console.error('Error creating receipt record:', insertError);
        }

        setTimeout(() => {
          navigateWithParams(
            navigate,
            '/receipt-upload',
            location,
            {
              transactionId,
              cpf: userData?.cpf || transaction?.cpf,
              customerName: userData?.name || 'Cliente',
              amount: transaction?.amount || 0,
              userData,
              indemnityAmount,
              pixKeyType,
              pixKey
            }
          );
        }, 1500);
      } else {
        proceedToNextPage();
      }
    } catch (err) {
      console.error('Error in receipt check:', err);
      proceedToNextPage();
    }
  };

  const proceedToNextPage = () => {
    setTimeout(() => {
      navigateWithParams(
        navigate,
        '/account-verified',
        location,
        {
          userData,
          indemnityAmount,
          pixKeyType,
          pixKey,
          transactionId
        }
      );
    }, 2000);
  };

  if (!transactionId) {
    navigate('/');
    return null;
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const getStatusDisplay = () => {
    if (loading && !transaction) {
      return {
        icon: Clock,
        text: 'Verificando pagamento...',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
    }

    if (error) {
      return {
        icon: AlertCircle,
        text: 'Erro ao verificar pagamento',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }

    switch (transaction?.status) {
      case 'completed':
        return {
          icon: CheckCircle,
          text: 'Pagamento confirmado!',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'failed':
        return {
          icon: XCircle,
          text: 'Pagamento falhou',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'expired':
        return {
          icon: XCircle,
          text: 'Pagamento expirado',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
        };
      default:
        return {
          icon: Clock,
          text: 'Aguardando pagamento...',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-20 sm:pt-24 pb-16 sm:pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 sm:mb-6 animate-fade-in-down">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Verificação de Pagamento
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Aguarde enquanto verificamos seu pagamento
            </p>
          </div>

          <div className={`${statusDisplay.bgColor} border-2 ${statusDisplay.borderColor} rounded-lg p-5 sm:p-6 mb-5 sm:mb-6 shadow-md animate-slide-up`}>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <div className="flex items-center justify-center">
                <StatusIcon className={`w-12 h-12 ${statusDisplay.color}`} />
              </div>
              <div className="text-left">
                <p className={`${statusDisplay.color} text-lg font-semibold`}>
                  {statusDisplay.text}
                </p>
                {transaction && (
                  <p className="text-gray-600 text-xs mt-1">
                    ID: {transaction.id.slice(0, 8)}...
                  </p>
                )}
              </div>
            </div>

            {transaction?.status === 'pending' && (
              <div className="bg-white rounded-xl p-4">
                <p className="text-gray-600 text-xs mb-2">
                  Aguardando confirmação do pagamento de R$ {formatCurrency(transaction.amount)}
                </p>
                <p className="text-gray-500 text-xs">
                  Chave PIX: {transaction.random_pix_key}
                </p>
              </div>
            )}

            {transaction?.status === 'completed' && (
              <div className="bg-white rounded-xl p-4">
                <p className="text-green-700 text-sm font-semibold mb-2">
                  Pagamento de R$ {formatCurrency(transaction.amount)} confirmado!
                </p>
                <p className="text-gray-600 text-xs">
                  O valor líquido será transferido para sua chave PIX em até 24 horas.
                </p>
              </div>
            )}
          </div>

          {transaction?.status === 'pending' && (
            <div className="mb-5 sm:mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4 animate-slide-up-delayed">
              <div className="flex items-start gap-2 sm:gap-3">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-blue-800 font-semibold text-xs sm:text-sm mb-1">
                    Aguardando confirmação
                  </h3>
                  <p className="text-blue-700 text-xs leading-relaxed">
                    Estamos verificando seu pagamento a cada 5 segundos. Assim que o pagamento for confirmado, você será redirecionado automaticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {transaction?.status === 'completed' && (
            <div className="mb-5 sm:mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 animate-slide-up-delayed">
              <div className="flex items-start gap-2 sm:gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-green-800 font-semibold text-xs sm:text-sm mb-1">
                    Pagamento confirmado!
                  </h3>
                  <p className="text-green-700 text-xs leading-relaxed">
                    Redirecionando para a próxima etapa...
                  </p>
                </div>
              </div>
            </div>
          )}

          {(transaction?.status === 'failed' || transaction?.status === 'expired') && (
            <div className="space-y-2 sm:space-y-3 animate-slide-up-buttons">
              <button
                onClick={handleBack}
                className="w-full py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                Voltar
              </button>
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

        .animate-slide-up-buttons {
          animation: slide-up 0.6s ease-out 0.6s backwards;
        }
      `}</style>
    </div>
  );
}
