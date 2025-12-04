import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Settings, CreditCard } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import UserLogsViewer from '../components/UserLogsViewer';
import ReceiptsViewer from '../components/ReceiptsViewer';
import CampaignAnalytics from '../components/CampaignAnalytics';
import UtmifySync from '../components/UtmifySync';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface ProviderSettings {
  id?: string;
  provider: 'genesys' | 'mangofy' | 'aureo' | 'bestfy' | 'babylon';
  api_url: string;
  api_key: string;
  store_code?: string;
  public_key?: string;
  secret_key?: string;
  company_id?: string;
  is_active: boolean;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeProvider, setActiveProvider] = useState<'genesys' | 'mangofy' | 'aureo' | 'bestfy' | 'babylon'>('genesys');
  const [providers, setProviders] = useState<Record<string, ProviderSettings>>({
    genesys: {
      provider: 'genesys',
      api_url: 'https://api.genesys.finance',
      api_key: 'sk_8327774662b1097b3d37f03212efce3a0de5ea05c2b57c3711c29df02fff3093e60485366021992bd34ef8b9f216f7a2d7aa45a265a27c633fafadf10784e154',
      is_active: true,
    },
    mangofy: {
      provider: 'mangofy',
      api_url: 'https://checkout.mangofy.com.br',
      api_key: '',
      store_code: '',
      is_active: false,
    },
    aureo: {
      provider: 'aureo',
      api_url: 'https://api.aureolink.com.br',
      api_key: '',
      public_key: 'pk_dIaiBPTqwTgJ5qHgcWzVlR5tWHbqZnlaNdZQQQfvD6ZsTAV4',
      secret_key: 'sk_XDmA6-QzA8YbdMBSKKfXoLmeVC9_u2N3gGMl-9nRN5kfxdwM',
      is_active: false,
    },
    bestfy: {
      provider: 'bestfy',
      api_url: 'https://api.bestfybr.com.br',
      api_key: '',
      public_key: '',
      secret_key: '',
      is_active: false,
    },
    babylon: {
      provider: 'babylon',
      api_url: 'https://api.bancobabylon.com/functions/v1',
      api_key: '',
      secret_key: '',
      company_id: '',
      is_active: false,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pix_provider_settings')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const settingsMap: Record<string, ProviderSettings> = {};
        let active: 'genesys' | 'mangofy' | 'aureo' | 'bestfy' | 'babylon' = 'genesys';

        data.forEach((setting: any) => {
          settingsMap[setting.provider] = setting;
          if (setting.is_active) {
            active = setting.provider;
          }
        });

        setProviders((prev) => ({
          genesys: settingsMap.genesys || prev.genesys,
          mangofy: settingsMap.mangofy || prev.mangofy,
          aureo: settingsMap.aureo || prev.aureo,
          bestfy: settingsMap.bestfy || prev.bestfy,
          babylon: settingsMap.babylon || prev.babylon,
        }));
        setActiveProvider(active);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    provider: 'genesys' | 'mangofy' | 'aureo' | 'bestfy' | 'babylon',
    field: keyof ProviderSettings,
    value: string
  ) => {
    setProviders((prev) => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const genesysSettings = providers.genesys;
      const mangofySettings = providers.mangofy;
      const aureoSettings = providers.aureo;
      const bestfySettings = providers.bestfy;
      const babylonSettings = providers.babylon;

      if (activeProvider === 'genesys') {
        if (!genesysSettings.api_url || !genesysSettings.api_key) {
          throw new Error('Preencha todos os campos da Genesys');
        }
      } else if (activeProvider === 'mangofy') {
        if (!mangofySettings.api_url || !mangofySettings.api_key || !mangofySettings.store_code) {
          throw new Error('Preencha todos os campos da Mangofy');
        }
      } else if (activeProvider === 'aureo') {
        if (!aureoSettings.api_url || !aureoSettings.public_key || !aureoSettings.secret_key) {
          throw new Error('Preencha todos os campos da Aureo');
        }
      } else if (activeProvider === 'bestfy') {
        if (!bestfySettings.api_url || !bestfySettings.public_key || !bestfySettings.secret_key) {
          throw new Error('Preencha todos os campos da Bestfy');
        }
      } else if (activeProvider === 'babylon') {
        if (!babylonSettings.api_url || !babylonSettings.secret_key || !babylonSettings.company_id) {
          throw new Error('Preencha todos os campos da Babylon');
        }
      }

      // First, deactivate all providers to ensure only one is active
      await supabase
        .from('pix_provider_settings')
        .update({ is_active: false })
        .neq('provider', '');

      const updates = [
        {
          ...genesysSettings,
          is_active: activeProvider === 'genesys',
        },
        {
          ...mangofySettings,
          is_active: activeProvider === 'mangofy',
        },
        {
          ...aureoSettings,
          is_active: activeProvider === 'aureo',
        },
        {
          ...bestfySettings,
          is_active: activeProvider === 'bestfy',
        },
        {
          ...babylonSettings,
          is_active: activeProvider === 'babylon',
        },
      ];

      for (const update of updates) {
        if (update.id) {
          const { error } = await supabase
            .from('pix_provider_settings')
            .update({
              api_url: update.api_url,
              api_key: update.api_key,
              store_code: update.store_code || null,
              public_key: update.public_key || null,
              secret_key: update.secret_key || null,
              company_id: update.company_id || null,
              is_active: update.is_active,
              updated_at: new Date().toISOString(),
            })
            .eq('id', update.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('pix_provider_settings')
            .insert({
              provider: update.provider,
              api_url: update.api_url,
              api_key: update.api_key,
              store_code: update.store_code || null,
              public_key: update.public_key || null,
              secret_key: update.secret_key || null,
              company_id: update.company_id || null,
              is_active: update.is_active,
            });

          if (error) throw error;
        }
      }

      console.log(`Gateway ativo alterado para: ${activeProvider}`);
      setSuccess(`Configurações salvas! Gateway ativo: ${activeProvider.toUpperCase()}`);
      await loadSettings();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#8A05BE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-gray-600 hover:text-[#8A05BE] mb-6 sm:mb-8 transition-all duration-300 font-medium touch-manipulation"
        >
          <div className="p-2 rounded-lg bg-white shadow-sm group-hover:shadow-md group-hover:bg-[#8A05BE]/10 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span>Voltar ao início</span>
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-[#8A05BE] to-[#a020f0] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Configurações do Sistema
                </h1>
                <p className="text-white/90 mt-1">Gerencie provedores de pagamento e comprovantes</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-[#8A05BE]/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-[#8A05BE]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Provedores de Pagamento PIX
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Configure qual gateway será utilizado no sistema
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-red-900 mb-0.5">Erro</p>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-50/50 border-l-4 border-green-500 rounded-lg flex items-start gap-3 animate-in slide-in-from-top duration-300">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-green-900 mb-0.5">Sucesso</p>
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-5 bg-[#8A05BE] rounded-full"></div>
              Provedor Ativo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <button
                onClick={() => setActiveProvider('genesys')}
                className={`group relative py-4 px-5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 touch-manipulation overflow-hidden ${
                  activeProvider === 'genesys'
                    ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/10 to-[#8A05BE]/5 text-[#8A05BE] shadow-lg shadow-[#8A05BE]/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#8A05BE]/50 hover:shadow-md'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-base">Genesys</span>
                  {activeProvider === 'genesys' && (
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  )}
                </div>
                {activeProvider === 'genesys' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8A05BE]/5 to-transparent"></div>
                )}
              </button>
              <button
                onClick={() => setActiveProvider('mangofy')}
                className={`group relative py-4 px-5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 touch-manipulation overflow-hidden ${
                  activeProvider === 'mangofy'
                    ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/10 to-[#8A05BE]/5 text-[#8A05BE] shadow-lg shadow-[#8A05BE]/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#8A05BE]/50 hover:shadow-md'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-base">Mangofy</span>
                  {activeProvider === 'mangofy' && (
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  )}
                </div>
                {activeProvider === 'mangofy' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8A05BE]/5 to-transparent"></div>
                )}
              </button>
              <button
                onClick={() => setActiveProvider('aureo')}
                className={`group relative py-4 px-5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 touch-manipulation overflow-hidden ${
                  activeProvider === 'aureo'
                    ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/10 to-[#8A05BE]/5 text-[#8A05BE] shadow-lg shadow-[#8A05BE]/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#8A05BE]/50 hover:shadow-md'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-base">Aureo</span>
                  {activeProvider === 'aureo' && (
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  )}
                </div>
                {activeProvider === 'aureo' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8A05BE]/5 to-transparent"></div>
                )}
              </button>
              <button
                onClick={() => setActiveProvider('bestfy')}
                className={`group relative py-4 px-5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 touch-manipulation overflow-hidden ${
                  activeProvider === 'bestfy'
                    ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/10 to-[#8A05BE]/5 text-[#8A05BE] shadow-lg shadow-[#8A05BE]/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#8A05BE]/50 hover:shadow-md'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-base">Bestfy</span>
                  {activeProvider === 'bestfy' && (
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  )}
                </div>
                {activeProvider === 'bestfy' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8A05BE]/5 to-transparent"></div>
                )}
              </button>
              <button
                onClick={() => setActiveProvider('babylon')}
                className={`group relative py-4 px-5 rounded-xl border-2 font-semibold text-sm transition-all duration-300 touch-manipulation overflow-hidden ${
                  activeProvider === 'babylon'
                    ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/10 to-[#8A05BE]/5 text-[#8A05BE] shadow-lg shadow-[#8A05BE]/20'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-[#8A05BE]/50 hover:shadow-md'
                }`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-base">Babylon</span>
                  {activeProvider === 'babylon' && (
                    <span className="flex items-center gap-1.5 text-xs font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Ativo
                    </span>
                  )}
                </div>
                {activeProvider === 'babylon' && (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8A05BE]/5 to-transparent"></div>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeProvider === 'genesys'
                  ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/5 to-transparent shadow-lg'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className={`w-1 h-6 rounded-full ${
                    activeProvider === 'genesys' ? 'bg-[#8A05BE]' : 'bg-gray-300'
                  }`}></div>
                  Configuração Genesys
                </h2>
                {activeProvider === 'genesys' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    PROVEDOR ATIVO
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da API
                  </label>
                  <input
                    type="text"
                    value={providers.genesys.api_url}
                    onChange={(e) =>
                      handleInputChange('genesys', 'api_url', e.target.value)
                    }
                    placeholder="https://api.genesys.com"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    API Secret
                  </label>
                  <input
                    type="password"
                    value={providers.genesys.api_key}
                    onChange={(e) =>
                      handleInputChange('genesys', 'api_key', e.target.value)
                    }
                    placeholder="Sua API Secret da Genesys"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeProvider === 'mangofy'
                  ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/5 to-transparent shadow-lg'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className={`w-1 h-6 rounded-full ${
                    activeProvider === 'mangofy' ? 'bg-[#8A05BE]' : 'bg-gray-300'
                  }`}></div>
                  Configuração Mangofy
                </h2>
                {activeProvider === 'mangofy' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    PROVEDOR ATIVO
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da API
                  </label>
                  <input
                    type="text"
                    value={providers.mangofy.api_url}
                    onChange={(e) =>
                      handleInputChange('mangofy', 'api_url', e.target.value)
                    }
                    placeholder="https://checkout.mangofy.com.br"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    API Key (Authorization)
                  </label>
                  <input
                    type="password"
                    value={providers.mangofy.api_key}
                    onChange={(e) =>
                      handleInputChange('mangofy', 'api_key', e.target.value)
                    }
                    placeholder="Sua API Key da Mangofy"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Store Code
                  </label>
                  <input
                    type="text"
                    value={providers.mangofy.store_code || ''}
                    onChange={(e) =>
                      handleInputChange('mangofy', 'store_code', e.target.value)
                    }
                    placeholder="Código da sua loja na Mangofy"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeProvider === 'aureo'
                  ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/5 to-transparent shadow-lg'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className={`w-1 h-6 rounded-full ${
                    activeProvider === 'aureo' ? 'bg-[#8A05BE]' : 'bg-gray-300'
                  }`}></div>
                  Configuração Aureo
                </h2>
                {activeProvider === 'aureo' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    PROVEDOR ATIVO
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da API
                  </label>
                  <input
                    type="text"
                    value={providers.aureo.api_url}
                    onChange={(e) =>
                      handleInputChange('aureo', 'api_url', e.target.value)
                    }
                    placeholder="https://api.aureolink.com.br"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chave Pública (Public Key)
                  </label>
                  <input
                    type="text"
                    value={providers.aureo.public_key || ''}
                    onChange={(e) =>
                      handleInputChange('aureo', 'public_key', e.target.value)
                    }
                    placeholder="Sua chave pública da Aureo"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chave Secreta (Secret Key)
                  </label>
                  <input
                    type="password"
                    value={providers.aureo.secret_key || ''}
                    onChange={(e) =>
                      handleInputChange('aureo', 'secret_key', e.target.value)
                    }
                    placeholder="Sua chave secreta da Aureo"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeProvider === 'bestfy'
                  ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/5 to-transparent shadow-lg'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className={`w-1 h-6 rounded-full ${
                    activeProvider === 'bestfy' ? 'bg-[#8A05BE]' : 'bg-gray-300'
                  }`}></div>
                  Configuração Bestfy
                </h2>
                {activeProvider === 'bestfy' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    PROVEDOR ATIVO
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da API
                  </label>
                  <input
                    type="text"
                    value={providers.bestfy.api_url}
                    onChange={(e) =>
                      handleInputChange('bestfy', 'api_url', e.target.value)
                    }
                    placeholder="https://api.bestfybr.com.br"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chave Pública (Public Key)
                  </label>
                  <input
                    type="text"
                    value={providers.bestfy.public_key || ''}
                    onChange={(e) =>
                      handleInputChange('bestfy', 'public_key', e.target.value)
                    }
                    placeholder="pk_live_v2..."
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Chave Secreta (Secret Key)
                  </label>
                  <input
                    type="password"
                    value={providers.bestfy.secret_key || ''}
                    onChange={(e) =>
                      handleInputChange('bestfy', 'secret_key', e.target.value)
                    }
                    placeholder="sk_live_v2..."
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
              </div>
            </div>

            <div
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                activeProvider === 'babylon'
                  ? 'border-[#8A05BE] bg-gradient-to-br from-[#8A05BE]/5 to-transparent shadow-lg'
                  : 'border-gray-200 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className={`w-1 h-6 rounded-full ${
                    activeProvider === 'babylon' ? 'bg-[#8A05BE]' : 'bg-gray-300'
                  }`}></div>
                  Configuração Babylon
                </h2>
                {activeProvider === 'babylon' && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    PROVEDOR ATIVO
                  </span>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL da API
                  </label>
                  <input
                    type="text"
                    value={providers.babylon.api_url}
                    onChange={(e) =>
                      handleInputChange('babylon', 'api_url', e.target.value)
                    }
                    placeholder="https://api.bancobabylon.com/functions/v1"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secret Key (Chave Secreta)
                  </label>
                  <input
                    type="password"
                    value={providers.babylon.secret_key || ''}
                    onChange={(e) =>
                      handleInputChange('babylon', 'secret_key', e.target.value)
                    }
                    placeholder="Sua chave secreta da Babylon"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company ID (ID da Empresa)
                  </label>
                  <input
                    type="text"
                    value={providers.babylon.company_id || ''}
                    onChange={(e) =>
                      handleInputChange('babylon', 'company_id', e.target.value)
                    }
                    placeholder="ID da sua empresa na Babylon"
                    className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200 touch-manipulation"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="group relative w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-[#8A05BE] to-[#a020f0] text-white px-8 py-3.5 text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#8A05BE]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none touch-manipulation overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#a020f0] to-[#8A05BE] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Save className={`w-5 h-5 relative z-10 ${saving ? 'animate-spin' : ''}`} />
              <span className="relative z-10">
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6 p-6">
        <UtmifySync />
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6 p-6">
        <CampaignAnalytics />
      </div>

      <ReceiptsViewer />

      <UserLogsViewer />
      </div>
    </div>
  );
}
