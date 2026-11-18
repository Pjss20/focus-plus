import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, isToday, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useApi } from '../../hooks/useApi';
import { getCalendarEvents } from '../../services/calendar.service';
import Spinner from '../ui/Spinner';

const EVENT_COLORS = {
  habit: '#10B981', task: '#6366F1', exam: '#EF4444',
  assignment: '#8B5CF6', custom: '#F59E0B', focus: '#3B82F6',
};

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  const start = startOfWeek(startOfMonth(current), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(current), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const { data, loading } = useApi(
    () => getCalendarEvents(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd')),
    [format(start, 'yyyy-MM-dd')]
  );
  const events = data || [];

  const getEventsForDay = useCallback((day) =>
    events.filter(e => {
      try { return isSameDay(parseISO(e.start_datetime || e.date || e.exam_date || e.due_date), day); }
      catch { return false; }
    }), [events]);

  const selectedEvents = getEventsForDay(selected);

  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Calendario</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3.5 sm:p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {format(current, 'MMMM yyyy', { locale: es })}
            </h2>
            <div className="flex gap-1">
              <button onClick={() => setCurrent(subMonths(current, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setCurrent(new Date())} className="px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-500 transition-colors">Hoy</button>
              <button onClick={() => setCurrent(addMonths(current, 1))} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">{d}</div>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const dayEvents = getEventsForDay(day);
                const isSelected = isSameDay(day, selected);
                const isCurrentMonth = isSameMonth(day, current);
                const isTodayDay = isToday(day);
                return (
                  <button key={i} onClick={() => setSelected(day)}
                    className={`aspect-square flex flex-col items-center justify-start p-1 rounded-lg transition-all duration-150 ${isSelected ? 'bg-indigo-600 text-white' : isTodayDay ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : isCurrentMonth ? 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <span className="text-sm font-medium leading-none mb-1">{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {dayEvents.slice(0, 3).map((e, j) => (
                        <div key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? 'white' : EVENT_COLORS[e.event_type] || '#6B7280' }} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected day events */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 capitalize">
            {format(selected, "EEEE d 'de' MMMM", { locale: es })}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{selectedEvents.length} actividades</p>
          {selectedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin actividades para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: EVENT_COLORS[e.event_type] || '#6B7280' }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{e.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{e.event_type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
