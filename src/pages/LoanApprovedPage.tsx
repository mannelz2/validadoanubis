import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { CheckCircle, Zap, BadgePercent, Volume2, Play, Pause } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function LoanApprovedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount, urlParams, profileAnswers, loanPriority, nubankCustomer, creditStatus } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const firstName = userData?.nome ? userData.nome.split(' ')[0] : 'Usuário';
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [buttonEnabled, setButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(18);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!userData) {
      navigate('/');
      return;
    

    saveFunnelData({
      userData: userData,
      currentStep: '/loan-approved'
    });
  }

    const audioTimer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch((error) => {
          console.log('Autoplay prevented:', error);
        });
        setIsPlaying(true);
      }
    }, 2000);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          setButtonEnabled(true);
          setTimeout(() => {
            buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(audioTimer);
      clearInterval(countdownInterval);
    };
  }, [navigate, userData]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };


  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!userData) {
    return null;
  }

  const handleContinue = () => {
    navigateWithParams(
      navigate,
      '/resumo-emprestimo',
      location,
      {
        userData,
        indemnityAmount,
        profileAnswers,
        loanPriority,
        nubankCustomer,
        creditStatus
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={() => setIsMenuOpen(true)} />
      <UserMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userName={firstName}
      />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="text-center animate-scale-in">
            <div className="flex justify-center mb-6 animate-bounce-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 rounded-xl p-4 mb-6 animate-slide-up">
              <h2 className="text-xl font-bold text-green-900 mb-1">
                Seu empréstimo foi aprovado!
              </h2>
              <div className="mt-3">
                <p className="text-3xl font-bold text-green-600 mb-1">
                  R$ 12.600,00
                </p>
                <p className="text-sm text-gray-600">
                  Valor pré-aprovado para você:
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4 mb-6 animate-slide-up shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src="/Screenshot_186.png"
                      alt="Rafaela"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-base font-bold text-gray-900">
                    Rafaela
                  </h3>
                  <p className="text-xs text-purple-700">
                    Gerente de Crédito
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayPause}
                    className="w-9 h-9 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-0.5">
                      <div
                        className="absolute h-full bg-purple-600 rounded-full transition-all duration-100"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-600 rounded-full shadow-md"></div>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <audio
              ref={audioRef}
              src="https://audio.jukehost.co.uk/ax8njInUTmM4MA7cm1l8DjwH3q7s5CGJ"
              preload="auto"
            />

            <h1 className="text-2xl sm:text-3xl font-bold text-purple-600 mb-4 animate-fade-in-down">
              Parabéns, {firstName}!
            </h1>

            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 px-2 animate-fade-in-delayed">
              Com base no seu perfil, preparamos uma oferta especial para você. Sabemos que imprevistos podem acontecer e estamos aqui para ajudar. Estamos oferecendo condições facilitadas para que você possa superar esse momento e restabelecer sua vida financeira. Aproveite essa chance de reconstruir seu futuro!
            </p>

            <div className="space-y-3 mb-6 animate-slide-up-delayed">
              <div className="bg-white border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Aprovação Instantânea
                    </h3>
                    <p className="text-xs text-gray-600">
                      Sem burocracia
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BadgePercent className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Taxa Especial
                    </h3>
                    <p className="text-xs text-gray-600">
                      Condições exclusivas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              ref={buttonRef}
              onClick={handleContinue}
              disabled={!buttonEnabled}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 shadow-md animate-slide-up-button ${
                buttonEnabled
                  ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer animate-pulse-button'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {buttonEnabled ? 'RECEBER EMPRÉSTIMO' : `Aguarde ${countdown}s`}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards;
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
          animation: slide-up 0.5s ease-out 0.4s backwards;
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out 0.6s backwards;
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
          animation: fade-in-delayed 0.5s ease-out 0.8s backwards;
        }

        .animate-slide-up-delayed {
          animation: slide-up 0.6s ease-out 1s backwards;
        }

        @keyframes pulse-audio {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
        }
        .animate-pulse-audio {
          animation: pulse-audio 2s ease-in-out infinite;
        }

        @keyframes pulse-button {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }
        .animate-pulse-button {
          animation: pulse-button 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
