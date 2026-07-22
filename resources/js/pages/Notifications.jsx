import { router } from '@inertiajs/react';
import { FaBell, FaCheckDouble, FaArrowLeft } from 'react-icons/fa';
import { FiMessageSquare, FiCheckCircle, FiSend, FiUserPlus, FiStar, FiRefreshCw } from 'react-icons/fi';
import BackButton from '../components/BackButton';

const typeIcons = {
  tutor_assigned: <FiUserPlus />,
  tutor_accepted: <FiCheckCircle />,
  thesis_submitted: <FiSend />,
  resubmitted: <FiRefreshCw />,
  observation_added: <FiMessageSquare />,
  changes_requested: <FiSend />,
  tutor_approved: <FiCheckCircle />,
  evaluator_assigned: <FiUserPlus />,
  evaluation_submitted: <FiStar />,
  status_changed: <FiRefreshCw />,
};

const typeColors = {
  tutor_assigned: 'text-blue-500',
  tutor_accepted: 'text-green-500',
  thesis_submitted: 'text-purple-500',
  resubmitted: 'text-orange-500',
  observation_added: 'text-primary',
  changes_requested: 'text-orange-500',
  tutor_approved: 'text-green-500',
  evaluator_assigned: 'text-blue-500',
  evaluation_submitted: 'text-yellow-500',
  status_changed: 'text-gray-500',
};

export default function Notifications({ notifications }) {
  const handleMarkRead = async (id) => {
    const token = document.querySelector('meta[name=csrf-token]')?.content;
    await fetch('/notificaciones/' + id + '/read', { method: 'POST', headers: { 'X-CSRF-TOKEN': token } });
    router.reload({ only: ['notifications', 'unread_notifications_count'], preserveState: true });
  };

  const handleMarkAllRead = async () => {
    const token = document.querySelector('meta[name=csrf-token]')?.content;
    await fetch('/notificaciones/read-all', { method: 'POST', headers: { 'X-CSRF-TOKEN': token } });
    router.reload({ only: ['notifications', 'unread_notifications_count'], preserveState: true });
  };

  const goToThesis = (id) => {
    if (id) router.visit('/tesis/' + id);
  };

  const items = notifications?.data || [];

  return (
    <div className="min-h-screen bg-bg-page font-[Georgia,serif] flex flex-col">
      <div className="flex-1 max-w-[700px] mx-auto w-full px-4 sm:px-6 py-8">
        <BackButton />

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-card-heading text-[22px] sm:text-[26px] font-bold flex items-center gap-3">
            <FaBell className="text-primary" />
            Notificaciones
          </h1>
          {items.some((n) => !n.is_read) && (
            <button onClick={handleMarkAllRead}
              className="bg-primary text-text-on-primary border-none px-4 h-[38px] rounded-[10px] text-sm cursor-pointer hover:bg-primary-light transition-colors inline-flex items-center gap-2">
              <FaCheckDouble className="size-3.5" />
              Leer todas
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="bg-card-bg rounded-[20px] p-8 text-center">
            <FaBell className="mx-auto text-4xl text-card-label mb-4" />
            <p className="text-card-label text-sm">No tienes notificaciones.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => (
              <div key={n.id} onClick={() => { if (!n.is_read) handleMarkRead(n.id); goToThesis(n.data?.thesis_id); }}
                className={`bg-card-bg rounded-[16px] p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2e2e2e] transition-colors border ${!n.is_read ? 'border-l-4 border-l-primary border-gray-200 dark:border-[#3a3a3a]' : 'border-gray-100 dark:border-[#333]'}`}
              >
                <div className="flex gap-3">
                  <div className={`mt-0.5 text-lg ${typeColors[n.type] || 'text-card-label'}`}>
                    {typeIcons[n.type] || <FaBell />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.is_read ? 'font-bold text-card-heading' : 'text-card-value'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    {n.message && (
                      <p className="text-xs text-card-label mt-1">{n.message}</p>
                    )}
                    <p className="text-[10px] text-card-label mt-1.5">
                      {new Date(n.created_at).toLocaleString('es-BO')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
