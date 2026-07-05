import { useState, useEffect } from 'react';
import { FiDownload } from 'react-icons/fi';
import BackButton from '../components/BackButton';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const statusLabels = {
  borrador: 'Borrador',
  en_revision: 'En Revisión',
  observado: 'Observado',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  publicado: 'Publicado',
};

const roleLabels = {
  admin: 'Administrador',
  vicedecano: 'Vicedecano',
  director: 'Director',
  tribunal: 'Tribunal',
  docente: 'Docente',
  estudiante: 'Estudiante',
};

const STATUS_PALETTE = {
  borrador: '#9ca3af',
  en_revision: '#eab308',
  observado: '#f97316',
  aprobado: '#22c55e',
  publicado: '#3b82f6',
  rechazado: '#ef4444',
};

const CHART_COLORS = ['#233f99', '#3a5bbf', '#6b8ccf', '#94aae0', '#b8c8ee', '#d4dff5', '#f97316', '#22c55e'];

function formatAmount(cents) {
  return (cents / 100).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function handleDownloadCsv(url, token) {
  fetch(url + '?export=csv', { headers: { Authorization: 'Bearer ' + token } })
    .then(r => {
      if (!r.ok) throw new Error('Error al descargar');
      return r.blob();
    })
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = url.split('/').pop() + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    })
    .catch(() => alert('Error al descargar CSV. Verifica tu sesión.'));
}

function ReportCard({ title, icon, loading, error, data, children, csvUrl, jwt_token }) {
  return (
    <div className="bg-card-bg rounded-[16px] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-card-heading text-base font-card-meta font-semibold flex items-center gap-2">
          {icon && <span className="text-lg mr-1">{icon}</span>}{title}
        </h3>
        {csvUrl && (
          <button
            onClick={() => handleDownloadCsv(csvUrl, jwt_token)}
            className="border border-gray-300 dark:border-[#555] bg-transparent text-card-value px-3 h-[32px] rounded-[8px] text-[11px] font-[600] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors font-card-meta inline-flex items-center gap-1.5"
          >
            <FiDownload className="size-3" />
            CSV
          </button>
        )}
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="animate-pulse space-y-3 w-full">
            <div className="h-4 bg-gray-300 dark:bg-[#444] rounded w-3/4 mx-auto" />
            <div className="h-4 bg-gray-300 dark:bg-[#444] rounded w-1/2 mx-auto" />
            <div className="h-32 bg-gray-300 dark:bg-[#444] rounded w-full" />
          </div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center py-12 text-red-500 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && data && children}
    </div>
  );
}

function ThesesByCareerCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/theses-by-career', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  return (
    <ReportCard title="Tesis por Carrera" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/theses-by-career" jwt_token={jwt_token}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="theses_count" fill="#233f99" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 border-t border-gray-200 dark:border-[#3a3a3a] pt-3">
        {data?.map((row, i) => (
          <div key={i} className="flex justify-between text-[13px] font-card-meta py-1">
            <span className="text-card-value">{row.name}</span>
            <span className="text-card-label font-semibold">{row.theses_count}</span>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function ThesesByStatusCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/theses-by-status', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  const chartData = data?.map(d => ({ ...d, label: statusLabels[d.status] || d.status }));

  return (
    <ReportCard title="Tesis por Estado" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/theses-by-status" jwt_token={jwt_token}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
            {chartData?.map((d) => (
              <Cell key={d.status} fill={STATUS_PALETTE[d.status] || '#9ca3af'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 border-t border-gray-200 dark:border-[#3a3a3a] pt-3">
        {data?.map((row, i) => (
          <div key={i} className="flex items-center justify-between text-[13px] font-card-meta py-1">
            <span className="flex items-center gap-2 text-card-value">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: STATUS_PALETTE[row.status] }} />
              {statusLabels[row.status] || row.status}
            </span>
            <span className="text-card-label font-semibold">{row.total}</span>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function ThesesByYearCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/theses-by-year', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  return (
    <ReportCard title="Tesis por Año" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/theses-by-year" jwt_token={jwt_token}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="total" fill="#3a5bbf" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 border-t border-gray-200 dark:border-[#3a3a3a] pt-3">
        {data?.map((row, i) => (
          <div key={i} className="flex justify-between text-[13px] font-card-meta py-1">
            <span className="text-card-value">{row.year}</span>
            <span className="text-card-label font-semibold">{row.total}</span>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function PaymentsCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/payments', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  return (
    <ReportCard title="Ingresos por Mes" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/payments" jwt_token={jwt_token}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <XAxis dataKey="period" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => (v / 100).toFixed(0)} />
          <Tooltip formatter={(v) => 'Bs ' + formatAmount(v)} />
          <Bar dataKey="total_amount" fill="#22c55e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 border-t border-gray-200 dark:border-[#3a3a3a] pt-3">
        {data?.map((row, i) => (
          <div key={i} className="flex justify-between text-[13px] font-card-meta py-1">
            <span className="text-card-value">{row.period}</span>
            <span className="text-card-label font-semibold">Bs {formatAmount(row.total_amount)} ({row.total_count})</span>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function ThesisVisitsCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/thesis-visits', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  return (
    <ReportCard title="Visitas por Tesis" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/thesis-visits" jwt_token={jwt_token}>
      <div className="divide-y divide-gray-200 dark:divide-[#3a3a3a]">
        {data?.map((row, i) => (
          <div key={row.thesis_id} className="flex items-center justify-between py-3 text-[13px] font-card-meta">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-card-label font-semibold w-6 text-right shrink-0">#{i + 1}</span>
              <span className="text-card-value truncate">{row.title}</span>
            </div>
            <span className="text-card-label font-semibold ml-4 shrink-0">{row.visits} visitas</span>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function ThesisOverviewCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/thesis-overview', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  const stats = data ? [
    { label: 'Total Tesis', value: data.total_theses },
    { label: 'Publicadas', value: data.published_theses },
    { label: 'Tasa Publicación', value: data.publication_rate },
    { label: 'Archivos', value: data.total_files },
    { label: 'Usuarios', value: data.total_users },
    { label: 'Docentes', value: data.total_docentes },
    { label: 'Estudiantes', value: data.total_estudiantes },
    { label: 'Evaluaciones', value: data.total_evaluations },
    { label: 'Visitas', value: data.total_visits },
  ] : [];

  return (
    <ReportCard title="Resumen General" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/thesis-overview" jwt_token={jwt_token}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-50 dark:bg-[#2a2a2a] rounded-[12px] p-4 text-center">
            <div className="text-[22px] sm:text-[26px] font-bold text-card-heading">{s.value}</div>
            <div className="text-[11px] text-card-label mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

function UsersByRoleCard({ jwt_token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/reports/users-by-role', { headers: { Authorization: 'Bearer ' + jwt_token } })
      .then(r => r.ok ? r.json() : Promise.reject('Error al cargar'))
      .then(json => { setData(json.data || json); setLoading(false) })
      .catch(e => { setError(e); setLoading(false) });
  }, []);

  const chartData = data?.map(d => ({ ...d, label: roleLabels[d.user_type] || d.user_type }));

  return (
    <ReportCard title="Usuarios por Rol" icon={null}
      loading={loading} error={error} data={data}
      csvUrl="/api/reports/users-by-role" jwt_token={jwt_token}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={chartData} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
            {chartData?.map((d, i) => (
              <Cell key={d.user_type} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 border-t border-gray-200 dark:border-[#3a3a3a] pt-3">
        {data?.map((row, i) => (
          <div key={i} className="flex justify-between text-[13px] font-card-meta py-1">
            <span className="text-card-value">{roleLabels[row.user_type] || row.user_type}</span>
            <span className="text-card-label font-semibold">{row.total}</span>
          </div>
        ))}
      </div>
    </ReportCard>
  );
}

export default function AdminReports({ jwt_token }) {
  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-6">
          <BackButton />
          <h1 className="m-0 text-card-heading text-[22px] sm:text-[26px] font-card-meta">
            Reportes y Estadísticas
          </h1>
          <p className="text-card-label text-sm mt-1">
            Indicadores académicos y financieros del sistema
          </p>
        </div>

        <div className="mb-6">
          <ThesisOverviewCard jwt_token={jwt_token} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThesesByCareerCard jwt_token={jwt_token} />
          <ThesesByStatusCard jwt_token={jwt_token} />
          <ThesesByYearCard jwt_token={jwt_token} />
          <PaymentsCard jwt_token={jwt_token} />
          <UsersByRoleCard jwt_token={jwt_token} />
        </div>
        <div className="mt-6">
          <ThesisVisitsCard jwt_token={jwt_token} />
        </div>
      </div>
    </div>
  );
}
