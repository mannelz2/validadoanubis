import React from 'react';
import { ShieldCheck } from 'lucide-react';

const HeroSection: React.FC = () => {
  const scrollToConsulta = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('consulta');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-light-gray text-gray-900 pt-24 pb-12 px-4 md:px-12 relative z-20 rounded-b-3xl">
      <div className="max-w-7xl mx-auto">
        <div className="md:flex items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold mb-4 md:mb-6 leading-tight text-purple-600">
              Empréstimo para negativados em instantes
            </h1>
            <p className="text-sm md:text-lg text-gray-600 mb-6 md:mb-8 max-w-xl">
              Estamos comprometidos em facilitar o acesso ao crédito, mesmo para quem está com o nome negativado.
            </p>

            <div className="flex justify-center md:justify-start">
              <button
                onClick={scrollToConsulta}
                className="bg-purple-600 text-white font-semibold px-8 py-3 md:px-12 md:py-4 rounded-lg hover:bg-purple-700 transition-all duration-300 text-center text-sm md:text-base w-full max-w-xs md:w-64 shadow-none"
              >
                Consultar agora
              </button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center md:justify-end">
            <div className="relative">
              <video
                src="/high.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-[340px] md:w-[480px] transform rotate-3 transition-all duration-500 hover:rotate-0 hover:scale-105 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;