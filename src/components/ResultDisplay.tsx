import React from 'react';
import { Check, X, ShieldAlert, AlertCircle } from 'lucide-react';

interface ResultDisplayProps {
  result: {
    hasIndemnity: boolean;
    amount?: number;
    message: string;
  } | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div 
      className={`mt-8 rounded-xl shadow-lg p-6 md:p-8 max-w-md mx-auto transition-all duration-500 animate-fade-in
        ${result.hasIndemnity ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gradient-to-br from-red-50 to-red-100'}`}
    >
      <div className="flex items-start">
        <div 
          className={`rounded-full p-3 mr-4 
            ${result.hasIndemnity ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
        >
          {result.hasIndemnity ? (
            <Check className="h-8 w-8" />
          ) : (
            <X className="h-8 w-8" />
          )}
        </div>
        
        <div>
          <h3 className={`text-xl font-semibold mb-2
            ${result.hasIndemnity ? 'text-green-800' : 'text-red-800'}`}>
            {result.hasIndemnity ? 'Empréstimo Disponível!' : 'Nenhum Empréstimo Encontrado'}
          </h3>
          
          <p className="text-gray-600 mb-4">{result.message}</p>
          
          {result.hasIndemnity && result.amount && (
            <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
              <p className="text-gray-700 font-medium">Valor disponível:</p>
              <p className="text-2xl font-semibold text-purple-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(result.amount)}
              </p>
            </div>
          )}
          
          {result.hasIndemnity ? (
            <button className="w-full bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:bg-purple-700 transform hover:-translate-y-1 hover:shadow-lg mt-2">
              Solicitar Empréstimo
            </button>
          ) : (
            <div className="flex items-center mt-4 bg-white p-4 rounded-lg shadow-sm">
              <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-sm text-gray-600">
                Se você acredita que deveria ter direito a um empréstimo, entre em contato com nossa central de atendimento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;