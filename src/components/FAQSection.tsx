import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQSection: React.FC = () => {
  const [openItem, setOpenItem] = useState<number | null>(0);
  const titleAnimation = useScrollAnimation();
  const faqAnimation = useScrollAnimation();
  
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  
  const faqItems: FAQItem[] = [
    {
      question: "Posso fazer empréstimo estando negativado?",
      answer: "Sim! Oferecemos empréstimos especiais para pessoas com restrições no nome. Nosso processo de aprovação é rápido e 100% digital."
    },
    {
      question: "Como saber se tenho crédito disponível?",
      answer: "Basta inserir seu CPF no formulário de consulta acima. Nosso sistema verificará automaticamente se você tem crédito pré-aprovado."
    },
    {
      question: "Quanto tempo leva para receber o dinheiro?",
      answer: "Após a aprovação da solicitação, o valor será depositado na sua conta em até 5 minutos. Todo o processo é digital e não exige documentação adicional."
    },
    {
      question: "Preciso ser cliente para consultar ou solicitar?",
      answer: "Para consultar, não é necessário ser cliente. No entanto, para receber o empréstimo, é necessário ter uma conta ativa, que pode ser aberta gratuitamente caso não possua."
    },
    {
      question: "Existe algum prazo para solicitar o empréstimo?",
      answer: `Sim, a oferta fica disponível apenas hoje ${currentDate}. Após esse período, será necessária nova análise de crédito, por isso recomendamos fazer a consulta o quanto antes.`
    }
  ];
  
  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };
  
  return (
    <div className="py-16 md:py-28 px-4 md:px-12 bg-light-gray -mt-12 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div
          ref={titleAnimation.ref}
          className={`text-center mb-8 md:mb-16 animate-on-scroll ${titleAnimation.isVisible ? 'visible' : ''}`}
        >
          <h2 className="text-2xl md:text-4xl font-semibold text-gray-900 mb-3 md:mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre o processo de consulta e solicitação de empréstimos para negativados.
          </p>
        </div>

        <div
          ref={faqAnimation.ref}
          className={`space-y-4 animate-on-scroll ${faqAnimation.isVisible ? 'visible' : ''}`}
        >
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full flex justify-between items-center p-4 md:p-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleItem(index)}
              >
                <span className="font-semibold text-sm md:text-lg text-gray-800 pr-2">{item.question}</span>
                {openItem === index ? (
                  <ChevronUp className="h-5 w-5 text-purple-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              <div
                className={`bg-white px-4 md:px-6 overflow-hidden transition-all duration-300 ${
                  openItem === index ? 'py-4 md:py-6 max-h-96' : 'max-h-0 py-0'
                }`}
              >
                <p className="text-sm md:text-base text-gray-600">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection;