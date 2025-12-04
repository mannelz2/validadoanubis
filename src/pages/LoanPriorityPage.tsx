import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { Bell, User, TrendingUp, Zap, Shield, Percent, UserCheck, UserPlus, AlertTriangle, CheckCircle, CreditCard, Car, Home, ShoppingBag, Briefcase, MoreHorizontal, Loader2 } from 'lucide-react';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function LoanPriorityPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams, profileAnswers } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedMotivo, setSelectedMotivo] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/loan-priority'
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

  const priorityOptions = [
    {
      icon: TrendingUp,
      text: 'Limite de crédito alto',
      value: 'high_limit'
    },
    {
      icon: Zap,
      text: 'Crédito imediato',
      value: 'immediate'
    },
    {
      icon: Shield,
      text: 'Não consultar SPC/Serasa',
      value: 'no_check'
    },
    {
      icon: Percent,
      text: 'Juros baixos',
      value: 'low_interest'
    }
  ];

  const motivoOptions = [
    {
      icon: CreditCard,
      text: 'Pagar dívidas',
      value: 'pay_debts'
    },
    {
      icon: Car,
      text: 'Comprar veículo',
      value: 'buy_vehicle'
    },
    {
      icon: Home,
      text: 'Reformar a casa',
      value: 'home_renovation'
    },
    {
      icon: ShoppingBag,
      text: 'Compras em geral',
      value: 'general_shopping'
    },
    {
      icon: Briefcase,
      text: 'Investir em um negócio',
      value: 'invest_business'
    },
    {
      icon: CreditCard,
      text: 'Pagar cartão de crédito',
      value: 'pay_credit_card'
    },
    {
      icon: MoreHorizontal,
      text: 'Outro motivo',
      value: 'other'
    }
  ];

  const customerOptions = [
    {
      icon: UserCheck,
      text: 'Sim, já sou cliente',
      value: 'existing_customer'
    },
    {
      icon: UserPlus,
      text: 'Não, seria o primeiro',
      value: 'new_customer'
    }
  ];

  const statusOptions = [
    {
      icon: AlertTriangle,
      text: 'Sim, tenho restrições',
      value: 'restricted'
    },
    {
      icon: CheckCircle,
      text: 'Não, CPF limpo',
      value: 'clean'
    }
  ];

  const totalSteps = 6;

  const verificationSteps = [
    { label: 'Dados pessoais', delay: 0 },
    { label: 'Analisando Respostas', delay: 1500 },
    { label: 'Renda e informações financeiras', delay: 3500 },
    { label: 'Histórico de crédito', delay: 5500 },
    { label: 'Verificação de segurança', delay: 7500 }
  ];

  const [verificationStatus, setVerificationStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (currentStep === 4) {
      verificationSteps.forEach((step, index) => {
        setTimeout(() => {
          setVerificationStatus(prev => ({ ...prev, [index]: true }));
        }, step.delay);
      });

      setTimeout(() => {
        navigateWithParams(
          navigate,
          '/emprestimo-aprovado',
          location,
          {
            userData,
            indemnityAmount,
            profileAnswers,
            loanPriority: selectedPriority,
            loanMotivo: selectedMotivo,
            nubankCustomer: selectedCustomer,
            creditStatus: selectedStatus
          }
        );
      }, 9000);
    }
  }, [currentStep]);

  const handlePrioritySelect = (value: string) => {
    setSelectedPriority(value);
    setTimeout(() => {
      setCurrentStep(1);
    }, 300);
  };

  const handleMotivoSelect = (value: string) => {
    setSelectedMotivo(value);
    setTimeout(() => {
      setCurrentStep(2);
    }, 300);
  };

  const handleCustomerSelect = (value: string) => {
    setSelectedCustomer(value);
    setTimeout(() => {
      setCurrentStep(3);
    }, 300);
  };

  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value);
    setTimeout(() => {
      setCurrentStep(4);
    }, 300);
  };

  const getQuestionContent = () => {
    switch (currentStep) {
      case 0:
        return {
          title: 'O que é mais importante para você em um empréstimo?',
          options: priorityOptions,
          handler: handlePrioritySelect
        };
      case 1:
        return {
          title: 'Qual o motivo do empréstimo?',
          options: motivoOptions,
          handler: handleMotivoSelect
        };
      case 2:
        return {
          title: 'Você já fez empréstimo na Nubank?',
          options: customerOptions,
          handler: handleCustomerSelect
        };
      case 3:
        return {
          title: 'Você está negativado?',
          options: statusOptions,
          handler: handleStatusSelect,
          subtitle: 'Seja sincero, isso não impede sua aprovação'
        };
      default:
        return {
          title: 'O que é mais importante para você em um empréstimo?',
          options: priorityOptions,
          handler: handlePrioritySelect
        };
    }
  };

  const questionContent = getQuestionContent();

  return (
    <div className="min-h-screen bg-[#8A05BE] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/Nubank_logo_white.svg"
            alt="Nubank"
            className="h-7"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <Bell className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={handleMenuClick}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      {/* Hero Section */}
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-white text-2xl font-bold mb-1 leading-tight">
          Simulação de Crédito
        </h1>
        <p className="text-white/90 text-sm">
          Descubra seu limite em menos de 5 minutos
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-0">
        <div className="bg-[#F5F5F5] rounded-t-[32px] min-h-[calc(100vh-180px)] px-5 pt-8 pb-6">
          {/* Title Section */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Vamos começar!
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Responda algumas perguntas para verificar<br />seu crédito disponível
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center items-center gap-1.5 mb-10">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-2 bg-[#8A05BE]'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Question Section */}
          {currentStep < 4 ? (
            <div className="bg-white rounded-[24px] p-6 shadow-sm animate-slide-up" key={currentStep}>
              <h3 className="text-lg font-bold text-gray-900 mb-2 text-center leading-snug">
                {questionContent.title}
              </h3>
              {questionContent.subtitle && (
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {questionContent.subtitle}
                </p>
              )}
              {!questionContent.subtitle && <div className="mb-3"></div>}

              {/* Options */}
              <div className="space-y-3">
                {questionContent.options.map((option, index) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => questionContent.handler(option.value)}
                      className="w-full p-4 text-left rounded-2xl bg-[#F7F7F7] hover:bg-gray-200 transition-all duration-200 group flex items-center justify-between animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <span className="text-base text-gray-800 font-medium">
                        {option.text}
                      </span>
                      <Icon className="w-5 h-5 text-gray-500" />
                    </button>
                  );
                })}
              </div>

              {currentStep === 3 && (
                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-xl p-4 animate-fade-in-delayed">
                  <p className="text-xs text-blue-800 text-center leading-relaxed">
                    Independente da sua resposta, analisaremos sua solicitação e faremos o possível para aprovar seu empréstimo.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="animate-slide-up">
              <div className="bg-white rounded-[24px] p-8 shadow-lg mb-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 animate-pulse-soft">
                    <Shield className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Analisando suas informações
                  </h3>
                  <p className="text-gray-600 text-sm text-center">
                    Isso levará apenas alguns segundos
                  </p>
                </div>

                <div className="space-y-3">
                  {verificationSteps.map((step, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border border-gray-200 transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-gray-800 text-sm font-medium">
                          {step.label}
                        </span>
                        <div className="flex items-center justify-center w-6 h-6">
                          {verificationStatus[index] ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-check-appear">
                              <CheckCircle className="w-5 h-5 text-white" strokeWidth={3} />
                            </div>
                          ) : (
                            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      Seus dados estão seguros
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Todas as informações são criptografadas e protegidas de acordo com as normas do Banco Central.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="bg-[#F5F5F5]">
        <Footer />
      </div>

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
          animation: slide-up 0.4s ease-out;
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
          animation: fade-in 0.3s ease-out backwards;
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
          animation: fade-in-delayed 0.5s ease-out 0.3s backwards;
        }

        @keyframes check-appear {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-check-appear {
          animation: check-appear 0.4s ease-out;
        }

        @keyframes pulse-soft {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
