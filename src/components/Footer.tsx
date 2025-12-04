import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-6 px-8 md:px-16 lg:px-24 mt-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex flex-col items-start">
            <div className="mb-3">
              <img
                src="/Nubank_logo_2021.svg"
                alt="Nubank Logo"
                className="h-6 md:h-7 brightness-0 invert"
              />
            </div>
            <div className="text-left">
              <p className="text-gray-400 text-xs leading-snug">
                © 2025 Nu Pagamentos S.A - Instituição de
              </p>
              <p className="text-gray-400 text-xs leading-snug">
                Pagamento. 18.236.120/0001-58. Rua Capote
              </p>
              <p className="text-gray-400 text-xs leading-snug">
                Valente, 39 - São Paulo, SP - 05409-000
              </p>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
