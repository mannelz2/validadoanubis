import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RefreshCw, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface UserLog {
  id: string;
  session_id: string;
  user_agent: string;
  ip_address: string;
  fingerprint: any;
  page_url: string;
  event_type: string;
  metadata: any;
  created_at: string;
}

export default function UserLogsViewer() {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    loadLogs();
  }, [limit]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_logs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const sessionMap = new Map<string, UserLog>();
      (data || []).forEach((log: UserLog) => {
        if (log.session_id && !sessionMap.has(log.session_id)) {
          sessionMap.set(log.session_id, log);
        }
      });

      const uniqueLogs = Array.from(sessionMap.values())
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);

      setLogs(uniqueLogs);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.page_url?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEvent = eventFilter === 'all' || log.event_type === eventFilter;

    return matchesSearch && matchesEvent;
  });

  const uniqueEventTypes = Array.from(new Set(logs.map((log) => log.event_type)));

  const toggleExpand = (id: string) => {
    setExpandedLog(expandedLog === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getBrowserInfo = (userAgent: string) => {
    if (!userAgent) return 'Desconhecido';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Outro';
  };

  const getDeviceInfo = (userAgent: string) => {
    if (!userAgent) return 'Desconhecido';
    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Logs de Usuários</h2>
          <p className="text-gray-600 text-sm mt-1">
            Monitoramento de acessos (1 log por sessão única)
          </p>
        </div>
        <button
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por Session ID, IP ou URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A05BE] focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A05BE] focus:border-transparent appearance-none bg-white"
          >
            <option value="all">Todos os eventos</option>
            {uniqueEventTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8A05BE] focus:border-transparent"
        >
          <option value={50}>50 sessões</option>
          <option value={100}>100 sessões</option>
          <option value={200}>200 sessões</option>
          <option value={500}>500 sessões</option>
        </select>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Mostrando {filteredLogs.length} de {logs.length} sessões únicas
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[#8A05BE] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Carregando logs...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Nenhum log encontrado</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="border border-gray-200 rounded-lg hover:border-[#8A05BE] transition-colors"
            >
              <div
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => toggleExpand(log.id)}
              >
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <span className="text-xs text-gray-500 block">Data/Hora</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Evento</span>
                    <span className="text-sm font-medium text-[#8A05BE]">{log.event_type}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">IP</span>
                    <span className="text-sm font-mono text-gray-900">
                      {log.ip_address || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Dispositivo</span>
                    <span className="text-sm text-gray-900">
                      {getDeviceInfo(log.user_agent)} - {getBrowserInfo(log.user_agent)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Session ID</span>
                    <span className="text-sm font-mono text-gray-900 truncate block">
                      {log.session_id ? log.session_id.substring(0, 12) + '...' : 'N/A'}
                    </span>
                  </div>
                </div>
                {expandedLog === log.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {expandedLog === log.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">URL da Página</h4>
                      <p className="text-sm text-gray-900 font-mono break-all">
                        {log.page_url || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">User Agent</h4>
                      <p className="text-sm text-gray-900 font-mono break-all">
                        {log.user_agent || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {log.fingerprint && (
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">
                        Fingerprint (Fycloak)
                      </h4>
                      <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.fingerprint, null, 2)}
                      </pre>
                    </div>
                  )}

                  {log.metadata && (
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Metadata</h4>
                      <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
