import { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle, TrendingUp, XCircle } from 'lucide-react';

interface SyncResult {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  dry_run: boolean;
  details: Array<{
    transaction_id: string;
    status: string;
    reason?: string;
    error?: string;
  }>;
}

export default function UtmifySync() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending,approved');
  const [limit, setLimit] = useState(100);
  const [dryRun, setDryRun] = useState(false);
  const [retryFailed, setRetryFailed] = useState(false);

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError('');
      setResult(null);

      const params = new URLSearchParams({
        status: statusFilter,
        limit: limit.toString(),
        dry_run: dryRun.toString(),
        retry_failed: retryFailed.toString(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-utmify?${params}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro na sincronização: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao sincronizar com UTMify');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-[#8A05BE]/10 rounded-lg">
          <TrendingUp className="w-6 h-6 text-[#8A05BE]" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            Sincronização UTMify
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">
            Envie transações para a plataforma UTMify
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-red-50/50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-900 mb-0.5">Erro</p>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Status das Transações
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200"
          >
            <option value="pending,approved">Pendentes e Aprovadas</option>
            <option value="pending">Apenas Pendentes</option>
            <option value="approved">Apenas Aprovadas</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Limite de Transações
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#8A05BE] focus:border-[#8A05BE] transition-all duration-200"
          >
            <option value={10}>10 transações</option>
            <option value={50}>50 transações</option>
            <option value={100}>100 transações</option>
            <option value={500}>500 transações</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={dryRun}
            onChange={(e) => setDryRun(e.target.checked)}
            className="w-5 h-5 text-[#8A05BE] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#8A05BE] focus:ring-offset-2 transition-all"
          />
          <div>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-[#8A05BE] transition-colors">
              Modo de Teste (Dry Run)
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Simula o envio sem realmente enviar para UTMify
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={retryFailed}
            onChange={(e) => setRetryFailed(e.target.checked)}
            className="w-5 h-5 text-[#8A05BE] border-2 border-gray-300 rounded focus:ring-2 focus:ring-[#8A05BE] focus:ring-offset-2 transition-all"
          />
          <div>
            <span className="text-sm font-semibold text-gray-900 group-hover:text-[#8A05BE] transition-colors">
              Retentar Falhas
            </span>
            <p className="text-xs text-gray-600 mt-0.5">
              Tenta enviar novamente transações que falharam anteriormente
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#8A05BE] to-[#a020f0] text-white px-6 py-4 text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-[#8A05BE]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#a020f0] to-[#8A05BE] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <RefreshCw className={`w-5 h-5 relative z-10 ${syncing ? 'animate-spin' : ''}`} />
        <span className="relative z-10">
          {syncing ? 'Sincronizando...' : 'Sincronizar com UTMify'}
        </span>
      </button>

      {result && (
        <div className="space-y-4 mt-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            Resultado da Sincronização
            {result.dry_run && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                TESTE
              </span>
            )}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{result.total}</div>
              <div className="text-xs text-gray-600 font-medium mt-1">Total</div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
              <div className="text-2xl font-bold text-green-600">{result.success}</div>
              <div className="text-xs text-green-700 font-medium mt-1">Sucesso</div>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <div className="text-2xl font-bold text-red-600">{result.failed}</div>
              <div className="text-xs text-red-700 font-medium mt-1">Falhas</div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <div className="text-2xl font-bold text-gray-600">{result.skipped}</div>
              <div className="text-xs text-gray-700 font-medium mt-1">Ignorados</div>
            </div>
          </div>

          {result.details && result.details.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Detalhes</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {result.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border-2 text-xs ${
                      detail.status === 'success' || detail.status === 'dry_run'
                        ? 'bg-green-50 border-green-200'
                        : detail.status === 'failed'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {detail.status === 'success' || detail.status === 'dry_run' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : detail.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          ID: {detail.transaction_id}
                        </div>
                        {detail.reason && (
                          <div className="text-gray-600 mt-1">{detail.reason}</div>
                        )}
                        {detail.error && (
                          <div className="text-red-600 mt-1">{detail.error}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
