import React from 'react';
import { Search, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const InfoSection: React.FC = () => {
  const titleAnimation = useScrollAnimation();
  const card1Animation = useScrollAnimation();
  const card2Animation = useScrollAnimation();
  const card3Animation = useScrollAnimation();
  const card4Animation = useScrollAnimation();

  return (
    <div className="py-12 md:py-20 px-4 md:px-12 rounded-t-[50px] -mt-12 relative z-10" style={{ backgroundColor: '#f4f4f4' }}>
      <div className="max-w-7xl mx-auto">
        <div
          ref={titleAnimation.ref}
          className={`text-center mb-8 md:mb-16 animate-on-scroll ${titleAnimation.isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-3 md:mb-4">
            Como funciona o empréstimo para negativados
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            O Nubаnk simplificou o processo para você verificar e solicitar empréstimos
            mesmo com restrições no nome. Confira abaixo:
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <div
            ref={card1Animation.ref}
            className={`bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-on-scroll ${card1Animation.isVisible ? 'visible' : ''}`}
            style={{ animationDelay: '0.1s' }}
          >
            <div className="bg-purple-100 rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-4 md:mb-6">
              <Search className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
            </div>
            <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Consulta</h3>
            <p className="text-xs md:text-base text-gray-600">
              Informe seu СРF no formulário para verificarmos se você possui empréstimos disponíveis.
            </p>
          </div>

          <div
            ref={card2Animation.ref}
            className={`bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-on-scroll ${card2Animation.isVisible ? 'visible' : ''}`}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="bg-purple-100 rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-4 md:mb-6">
              <ShieldCheck className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
            </div>
            <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Verificação</h3>
            <p className="text-xs md:text-base text-gray-600">
              Nosso sistema verifica em tempo real os empréstimos disponíveis para seu perfil.
            </p>
          </div>

          <div
            ref={card3Animation.ref}
            className={`bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-on-scroll ${card3Animation.isVisible ? 'visible' : ''}`}
            style={{ animationDelay: '0.3s' }}
          >
            <div className="bg-purple-100 rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-4 md:mb-6">
              <CreditCard className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
            </div>
            <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Solicitação</h3>
            <p className="text-xs md:text-base text-gray-600">
              Se aprovado, você pode solicitar o empréstimo diretamente pela plataforma.
            </p>
          </div>

          <div
            ref={card4Animation.ref}
            className={`bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 animate-on-scroll ${card4Animation.isVisible ? 'visible' : ''}`}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="bg-purple-100 rounded-lg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center mb-4 md:mb-6">
              <Clock className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
            </div>
            <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-2 md:mb-3">Recebimento</h3>
            <p className="text-xs md:text-base text-gray-600">
              Após aprovação, o valor será depositado na sua conta Nubаnk em até 5 dias úteis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoSection;