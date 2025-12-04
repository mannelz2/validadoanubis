import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, Loader2, Info, Check, Shield } from 'lucide-react';
import Header from '../components/Header';
import BackRedirect from '../components/BackRedirect';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount: stateIndemnityAmount, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const indemnityAmount = stateIndemnityAmount || 7854.63;
  const [showAmount, setShowAmount] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationSteps, setVerificationSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!userData) {
      const searchParams = new URLSearchParams(location.search);
      navigate(`/?${searchParams.toString()}`);
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/resultado'
    });

    // Initialize verification steps
    const steps = [
      'Consultando Banco Central...',
      'Verificando Receita Federal...',
      'Consultando histórico financeiro...',
      'Analisando elegibilidade...',
      'Finalizando consulta...'
    ];
    setVerificationSteps(steps);

    const duration = 5000;
    const startTime = Date.now();
    let verificationStepIndex = 0;
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min((elapsed / duration) * 100, 100);
      setProgress(progressPercent);

      const newStepIndex = Math.floor((progressPercent / 100) * steps.length);
      if (newStepIndex > verificationStepIndex && newStepIndex < steps.length) {
        verificationStepIndex = newStepIndex;
        setCurrentStep(verificationStepIndex);
      }

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setCurrentStep(steps.length);
        setTimeout(() => {
          setShowAmount(true);
        }, 500);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [location.search, userData, navigate]);

  if (!userData) {
    return null;
  }

  const handleChatClick = () => {
    navigateWithParams(
      navigate,
      '/chat',
      location,
      {
        cpf: userData.cpf,
        indemnityAmount,
        userData
      }
    );
  };

  const firstName = userData.nome.split(' ')[0];

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <BackRedirect />
      <Header onMenuClick={() => setIsMenuOpen(true)} />
      <UserMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName={firstName}
      />

      <main className="flex-1 flex items-center justify-center px-4 py-8 pt-24 md:pt-32">
        <div className="max-w-md w-full animate-fade-in">
          {showAmount && (
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-purple-600 mb-8">
                Olá {firstName.toUpperCase()}
              </h1>
            </div>
          )}

          <div className="text-center">
            {showAmount ? (
              <>
                <div className="bg-white rounded-2xl shadow-md p-7 max-w-md mx-auto animate-slide-up text-left mb-8">
                  <div className="flex items-start gap-3 mb-5">
                    <Info className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <h2 className="text-base font-bold text-purple-600 mb-2 text-left">
                        O que acontece a seguir?
                      </h2>
                      <p className="text-sm text-purple-600 leading-relaxed text-left">
                        Você passará por uma <span className="font-semibold">validação de identidade</span> na próxima etapa.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 ml-9">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-purple-600 text-left">Perguntas de segurança</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-purple-600 text-left">Processo rápido</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-purple-600 text-left">Totalmente seguro</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleChatClick}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 hover:shadow-lg w-full max-w-md mx-auto text-lg"
                >
                  Validar Identidade
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative mb-6">
                  <svg className="w-16 h-16 md:w-20 md:h-20 animate-spin-smooth" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(130, 80, 200, 0.2)"
                      strokeWidth="4"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#7c3aed"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="251.2"
                      strokeDashoffset="125.6"
                      strokeLinecap="round"
                      className="animate-dash"
                    />
                  </svg>
                </div>

                <h3 className="text-2xl md:text-3xl font-bold mb-8 text-purple-600">Buscando valores</h3>

                {verificationSteps.length > 0 && (
                  <div className="mb-8 space-y-4 w-full max-w-sm">
                    {verificationSteps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-4 text-base transition-all duration-300 ${
                          index < currentStep
                            ? 'text-green-600'
                            : index === currentStep
                            ? 'text-purple-600 font-medium'
                            : 'text-gray-400'
                        }`}
                      >
                        {index < currentStep ? (
                          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : index === currentStep ? (
                          <svg className="animate-spin w-6 h-6 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="w-full bg-purple-200 rounded-full h-3 mb-3 overflow-hidden max-w-sm">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-base font-semibold text-purple-600 text-center">
                  {Math.round(progress)}% concluído
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
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
          animation: slide-up 0.6s ease-out;
        }

        @keyframes spin-smooth {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-smooth {
          animation: spin-smooth 2s linear infinite;
        }

        @keyframes dash {
          0% {
            stroke-dashoffset: 251.2;
          }
          50% {
            stroke-dashoffset: 62.8;
          }
          100% {
            stroke-dashoffset: 251.2;
          }
        }
        .animate-dash {
          animation: dash 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ResultPage