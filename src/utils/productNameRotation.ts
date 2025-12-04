import { supabase } from '../services/pixService';

const PRODUCT_NAMES = [
  'Método Essencial 1.0',
  'Protocolo Alfa',
  'Guia de Performance',
  'Programa Evolutivo',
  'Método Avançado',
  'Código Digital',
  'Treinamento Base',
  'Jornada Premium',
  'Sistema 30+',
  'Plano Estruturado',
  'Método Integral',
  'Fórmula Prática',
  'Manual Estratégico',
  'Programa Progressivo',
  'Guia Mestre',
  'Ciclo de Aprendizado',
  'Manual Essencial',
  'Protocolo Clarity',
  'Blueprint Inicial',
  'Programa de Rotina',
  'Guia Direcionado',
  'Módulo Fundamental',
  'Método Ativo',
  'Estrutura Prime',
  'Roadmap Oficial',
  'Roteiro Certo',
  'Programa de Estudos',
  'Material Avançado',
  'Essência 2.0',
  'Caminho Prático',
  'Método DeepCore',
  'Programa Linear',
  'Guia de Diretrizes',
  'Protocolo Forward',
  'Treinamento Smart',
  'Estrutura Master',
  'Programa Discovery',
  'Método Elementar',
  'Blueprint Progress',
  'Jornada Evoluir',
  'Guia Profissional',
  'Treinamento Primeiro Passo',
  'Manual Prático Pro',
  'Protocolo Inicial',
  'Sistema Crescer',
  'Método Direto',
  'Framework Alfa',
  'Programa Essencial Pro',
  'Toolkit Base',
  'Jornada de Resultados',
  'Starter Pack',
  'Guia Operacional',
  'Método Clássico',
  'Programa Solid',
  'Estratégia Prime',
  'Mapa Digital',
  'Protocolo Linear',
  'Sistema Vital',
  'Roadmap Avançado',
  'Manual Fundamental',
  'Treinamento Fortify',
  'Guia Progressivo',
  'Caminho Alfa',
  'Blueprint Core',
  'Método Constante',
  'Material Premium',
  'Programa de Fundamentos',
  'Roteiro Prime',
  'Guia Intensivo',
  'Sistema Level Up',
  'Plano Técnico',
  'Protocolo Active',
  'Método Precision',
  'Estrutura Nexus',
  'Programa SkillUp',
  'Manual Operacional',
  'Guia Base Pro',
  'Método Focus',
  'Protocolo Next',
  'Jornada Start',
  'Blueprint Elevate',
  'Guia Técnico',
  'Framework Mastery',
  'Método Element',
  'Protocolo Rise',
  'Treinamento Pivot',
  'Manual de Rotina',
  'Sistema Flux',
  'Guia Base 2.0',
  'Roadmap Evolution',
  'Plano Avançado',
  'Programa Clarity',
  'Método Upgrade',
  'Protocolo Studio',
  'Treinamento Sharp',
  'Sistema Axis',
  'Material Prático',
  'Guia de Execução',
  'Método Horizon',
  'Programa Base Zero'
];

export const getNextProductName = async (): Promise<string> => {
  try {
    const { data, error } = await supabase.rpc('get_next_product_name_index');

    if (error) {
      console.error('Error getting next product name index:', error);
      const randomIndex = Math.floor(Math.random() * PRODUCT_NAMES.length);
      return PRODUCT_NAMES[randomIndex];
    }

    const index = data as number;
    const productName = PRODUCT_NAMES[index];
    console.log(`✓ Using product name [${index}]: ${productName}`);

    return productName;
  } catch (error) {
    console.error('Error in getNextProductName:', error);
    const randomIndex = Math.floor(Math.random() * PRODUCT_NAMES.length);
    return PRODUCT_NAMES[randomIndex];
  }
};

export const getProductNameByIndex = (index: number): string => {
  const validIndex = index % PRODUCT_NAMES.length;
  return PRODUCT_NAMES[validIndex];
};
