import { useState, useEffect, useRef, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import { FaBell, FaCheckDouble, FaRegCheckCircle } from 'react-icons/fa';
import { FiMessageSquare, FiCheckCircle, FiSend, FiUserPlus, FiStar, FiRefreshCw } from 'react-icons/fi';

const typeIcons = {
  tutor_assigned: <FiUserPlus className="size-3.5" />,
  tutor_accepted: <FiCheckCircle className="size-3.5" />,
  thesis_submitted: <FiSend className="size-3.5" />,
  resubmitted: <FiRefreshCw className="size-3.5" />,
  observation_added: <FiMessageSquare className="size-3.5" />,
  changes_requested: <FiSend className="size-3.5" />,
  tutor_approved: <FiCheckCircle className="size-3.5" />,
  evaluator_assigned: <FiUserPlus className="size-3.5" />,
  evaluation_submitted: <FiStar className="size-3.5" />,
  status_changed: <FiRefreshCw className="size-3.5" />,
};

const defaultIcon = <FaBell className="size-3.5" />;

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es-BO');
}

export default function NotificationBell() {
  const { notifications, unread_notifications_count } = usePage().props;
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      router.reload({ only: ['notifications', 'unread_notifications_count'], preserveState: true, preserveScroll: true });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = useCallback(async (e) => {
    e.stopPropagation();
    await fetch('/notificaciones/read-all', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content } });
    router.reload({ only: ['notifications', 'unread_notifications_count'], preserveState: true });
  }, []);

  const handleClick = useCallback(async (n) => {
    if (!n.is_read) {
      await fetch('/notificaciones/' + n.id + '/read', { method: 'POST', headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content } });
    }
    setOpen(false);
    if (n.data?.thesis_id) {
      router.visit('/tesis/' + n.data.thesis_id);
    }
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)}
        className="relative bg-bg-card border border-gray-200 dark:border-[#3a3a3a] w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md transition-shadow text-text-primary"
        aria-label="Notificaciones"
      >
        <FaBell className="text-sm sm:text-base" />
        {unread_notifications_count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-bold min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-1">
            {unread_notifications_count > 99 ? '99+' : unread_notifications_count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[380px] bg-white dark:bg-[#2a2a2a] rounded-[12px] shadow-lg border border-gray-200 dark:border-[#3a3a3a] overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#3a3a3a]">
            <span className="text-sm font-bold text-card-heading">Notificaciones</span>
            <div className="flex gap-2">
              {unread_notifications_count > 0 && (
                <button onClick={handleMarkAllRead}
                  className="text-[11px] text-primary hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1">
                  <FaCheckDouble className="size-3" />
                  Leer todas
                </button>
              )}
              <button onClick={() => { setOpen(false); router.visit('/notificaciones'); }}
                className="text-[11px] text-card-label hover:underline bg-transparent border-none cursor-pointer">
                Ver todas
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {(!notifications || notifications.length === 0) ? (
              <div className="px-4 py-8 text-center text-card-label text-sm">
                No tienes notificaciones.
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} onClick={() => handleClick(n)}
                  className={`px-4 py-3 border-b border-gray-50 dark:border-[#333] cursor-pointer hover:bg-gray-50 dark:hover:bg-[#333] transition-colors ${!n.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className={`mt-0.5 shrink-0 ${!n.is_read ? 'text-primary' : 'text-card-label'}`}>
                      {typeIcons[n.type] || defaultIcon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] leading-snug ${!n.is_read ? 'font-bold text-card-heading' : 'text-card-value'}`}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-[11px] text-card-label mt-0.5 line-clamp-2">{n.message}</p>
                      )}
                      <p className="text-[10px] text-card-label mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
