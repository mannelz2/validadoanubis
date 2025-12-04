import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveFunnelData, getFunnelData } from '../utils/funnelStorage';

interface FunnelPersistenceProps {
  currentStep: string;
  children: React.ReactNode;
  requiresUserData?: boolean;
}

export const FunnelPersistence: React.FC<FunnelPersistenceProps> = ({
  currentStep,
  children,
  requiresUserData = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const funnelData = getFunnelData();

    if (requiresUserData && !location.state?.userData && !funnelData.userData) {
      const searchParams = new URLSearchParams(location.search);
      navigate(`/?${searchParams.toString()}`);
      return;
    }

    saveFunnelData({ currentStep });
  }, [currentStep, requiresUserData, location, navigate]);

  return <>{children}</>;
};

export const useFunnelData = () => {
  const location = useLocation();
  const funnelData = getFunnelData();

  return {
    userData: location.state?.userData || funnelData.userData,
    loanAmount: location.state?.loanAmount || funnelData.loanAmount,
    installments: location.state?.installments || funnelData.installments,
    dueDate: location.state?.dueDate || funnelData.dueDate,
    hasNubankAccount: location.state?.hasNubankAccount ?? funnelData.hasNubankAccount,
    profileAnswers: location.state?.profileAnswers || funnelData.profileAnswers,
    indemnityAmount: location.state?.indemnityAmount || 7854.63,
  };
};
