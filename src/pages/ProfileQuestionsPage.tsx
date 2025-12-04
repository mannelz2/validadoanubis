import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { User, Calendar, Briefcase, GraduationCap } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function ProfileQuestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    }

    saveFunnelData({
      userData: userData,
      currentStep: '/perguntas-perfil'
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

  const questions = [
    {
      id: 0,
      icon: User,
      title: 'Qual é sua renda mensal aproximada?',
      options: [
        'Até R$ 1.500',
        'R$ 1.500 - R$ 3.000',
        'R$ 3.000 - R$ 5.000',
        'R$ 5.000 - R$ 10.000',
        'Acima de R$ 10.000'
      ]
    },
    {
      id: 1,
      icon: Calendar,
      title: 'Em que dia do mês você recebe?',
      options: [
        'Dia 1-5',
        'Dia 6-10',
        'Dia 11-15',
        'Dia 16-20',
        'Dia 21-25',
        'Dia 26-31'
      ]
    },
    {
      id: 2,
      icon: Briefcase,
      title: 'Qual é sua ocupação?',
      options: [
        'Empregado CLT',
        'Autônomo',
        'Empresário',
        'Funcionário Público',
        'Aposentado/Pensionista',
        'Desempregado'
      ]
    },
    {
      id: 3,
      icon: GraduationCap,
      title: 'Qual é sua escolaridade?',
      options: [
        'Fundamental',
        'Médio',
        'Superior Incompleto',
        'Superior Completo',
        'Pós-graduação'
      ]
    }
  ];

  const currentQuestionData = questions[currentQuestion];
  const Icon = currentQuestionData.icon;

  const handleOptionSelect = (option: string) => {
    const newAnswers = { ...answers, [currentQuestion]: option };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        navigateWithParams(
          navigate,
          '/autorizacao-credito',
          location,
          {
            userData,
            indemnityAmount,
            profileAnswers: newAnswers
          }
        );
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center mb-5 animate-fade-in-down">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {currentQuestionData.title}
            </h1>
            <p className="text-xs text-gray-600">
              Pergunta {currentQuestion + 1} de {questions.length}
            </p>
          </div>

          <div className="flex justify-center items-center gap-2 mb-5">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentQuestion
                    ? 'w-8 bg-purple-600'
                    : index < currentQuestion
                    ? 'w-2 bg-purple-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="space-y-3 animate-slide-up">
            {currentQuestionData.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                className="w-full p-4 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group shadow-sm"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="text-sm sm:text-base text-gray-900 group-hover:text-purple-600 font-medium block">
                  {option}
                </span>
              </button>
            ))}
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
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out 0.2s backwards;
        }
      `}</style>
    </div>
  );
}
