interface FunnelData {
  cpf?: string;
  userData?: any;
  loanAmount?: number;
  installments?: number;
  dueDate?: number;
  hasNubankAccount?: boolean;
  profileAnswers?: Record<string, string>;
  currentStep?: string;
  urlParams?: any;
}

const FUNNEL_STORAGE_KEY = 'funnelData';

export const saveFunnelData = (data: Partial<FunnelData>) => {
};

export const getFunnelData = (): FunnelData => {
  return {};
};

export const clearFunnelData = () => {
};

export const getUserName = (): string => {
  return 'Usuário';
};

export const getUserData = () => {
  return null;
};
