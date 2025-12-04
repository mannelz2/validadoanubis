import { getFunnelData } from './funnelStorage';

export const getUserName = (): string => {
  const funnelData = getFunnelData();
  if (funnelData.userData?.nome) {
    return funnelData.userData.nome.split(' ')[0];
  }

  const userDataStr = sessionStorage.getItem('userData');
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      return userData.nome?.split(' ')[0] || 'Usuário';
    } catch {
      return 'Usuário';
    }
  }
  return 'Usuário';
};

export const getUserData = () => {
  const funnelData = getFunnelData();
  if (funnelData.userData) {
    return funnelData.userData;
  }

  const userDataStr = sessionStorage.getItem('userData');
  if (userDataStr) {
    try {
      return JSON.parse(userDataStr);
    } catch {
      return null;
    }
  }
  return null;
};
