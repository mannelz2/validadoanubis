import { useEffect, useState } from 'react';
import { supabase } from '../services/pixService';
import { TrendingUp, DollarSign, Users, Target, AlertCircle, RefreshCw } from 'lucide-react';

interface CampaignMetrics {
  source: string;
  medium?: string;
  campaign?: string;
  transactions: number;
  completed: number;
  pending: number;
  failed: number;
  totalRevenue: number;
  conversionRate: number;
}

interface OverallMetrics {
  totalTransactions: number;
  totalRevenue: number;
  completedTransactions: number;
  pendingTransactions: number;
  overallConversionRate: number;
}

export default function CampaignAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics[]>([]);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics>({
    totalTransactions: 0,
    totalRevenue: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    overallConversionRate: 0,
  });
  const [groupBy, setGroupBy] = useState<'source' | 'campaign' | 'medium'>('source');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('transactions')
        .select('*');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!data || data.length === 0) {
        setCampaignMetrics([]);
        setOverallMetrics({
          totalTransactions: 0,
          totalRevenue: 0,
          completedTransactions: 0,
          pendingTransactions: 0,
          overallConversionRate: 0,
        });
        setLoading(false);
        return;
      }

      const metricsMap = new Map<string, CampaignMetrics>();

      data.forEach((transaction: any) => {
        let groupKey = '';
        let displaySource = '';
        let displayMedium: string | undefined;
        let displayCampaign: string | undefined;

        if (groupBy === 'source') {
          groupKey = transaction.utm_source || transaction.src || 'Direct';
          displaySource = groupKey;
        } else if (groupBy === 'medium') {
          groupKey = transaction.utm_medium || 'Unknown Medium';
          displaySource = transaction.utm_source || 'Unknown Source';
          displayMedium = groupKey;
        } else {
          groupKey = transaction.utm_campaign || 'No Campaign';
          displaySource = transaction.utm_source || 'Unknown Source';
          displayMedium = transaction.utm_medium;
          displayCampaign = groupKey;
        }

        if (!metricsMap.has(groupKey)) {
          metricsMap.set(groupKey, {
            source: displaySource,
            medium: displayMedium,
            campaign: displayCampaign,
            transactions: 0,
            completed: 0,
            pending: 0,
            failed: 0,
            totalRevenue: 0,
            conversionRate: 0,
          });
        }

        const metrics = metricsMap.get(groupKey)!;
        metrics.transactions++;

        if (transaction.status === 'completed' || transaction.status === 'authorized' || transaction.status === 'approved') {
          metrics.completed++;
          metrics.totalRevenue += parseFloat(transaction.amount) || 0;
        } else if (transaction.status === 'pending') {
          metrics.pending++;
        } else {
          metrics.failed++;
        }
      });

      metricsMap.forEach((metrics) => {
        metrics.conversionRate = metrics.transactions > 0
          ? (metrics.completed / metrics.transactions) * 100
          : 0;
      });

      const sortedMetrics = Array.from(metricsMap.values()).sort(
        (a, b) => b.totalRevenue - a.totalRevenue
      );

      setCampaignMetrics(sortedMetrics);

      const totalTransactions = data.length;
      const completedTransactions = data.filter(
        (t: any) => t.status === 'completed' || t.status === 'authorized' || t.status === 'approved'
      ).length;
      const pendingTransactions = data.filter((t: any) => t.status === 'pending').length;
      const totalRevenue = data
        .filter((t: any) => t.status === 'completed' || t.status === 'authorized' || t.status === 'approved')
        .reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

      setOverallMetrics({
        totalTransactions,
        totalRevenue,
        completedTransactions,
        pendingTransactions,
        overallConversionRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
      });

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching campaign metrics:', err);
      setError(err.message || 'Falha ao carregar métricas');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [groupBy]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 mb-1">Erro ao carregar métricas</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={fetchMetrics}
              className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analytics de Campanhas</h2>
        <button
          onClick={fetchMetrics}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Transações</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.totalTransactions}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(overallMetrics.totalRevenue)}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Conversões</p>
              <p className="text-2xl font-bold text-gray-900">{overallMetrics.completedTransactions}</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">
                {overallMetrics.overallConversionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Desempenho por Campanha</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupBy('source')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  groupBy === 'source'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Source
              </button>
              <button
                onClick={() => setGroupBy('medium')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  groupBy === 'medium'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Medium
              </button>
              <button
                onClick={() => setGroupBy('campaign')}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  groupBy === 'campaign'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Por Campaign
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {groupBy === 'source' ? 'Source' : groupBy === 'medium' ? 'Medium' : 'Campaign'}
                </th>
                {groupBy !== 'source' && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Source
                  </th>
                )}
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Transações
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Completadas
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pendentes
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Taxa Conv.
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Receita
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campaignMetrics.length === 0 ? (
                <tr>
                  <td colSpan={groupBy !== 'source' ? 7 : 6} className="px-4 py-8 text-center text-gray-500">
                    Nenhuma transação encontrada
                  </td>
                </tr>
              ) : (
                campaignMetrics.map((metrics, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {groupBy === 'source' ? metrics.source : groupBy === 'medium' ? metrics.medium : metrics.campaign}
                    </td>
                    {groupBy !== 'source' && (
                      <td className="px-4 py-3 text-sm text-gray-600">{metrics.source}</td>
                    )}
                    <td className="px-4 py-3 text-sm text-center text-gray-900">{metrics.transactions}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {metrics.completed}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {metrics.pending}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`font-medium ${
                        metrics.conversionRate >= 50
                          ? 'text-green-600'
                          : metrics.conversionRate >= 25
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {metrics.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(metrics.totalRevenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
