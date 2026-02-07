import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, WorkRecord } from '../lib/supabase';

interface Holiday {
  date: string;
  name: string;
  on_shift_multiplier: number;
  off_shift_multiplier: number;
}

interface CalendarProps {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
}

export function Calendar({ year, month, onMonthChange }: CalendarProps) {
  const [workRecords, setWorkRecords] = useState<Map<string, WorkRecord>>(new Map());
  const [holidays, setHolidays] = useState<Map<string, Holiday>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkRecords();
    loadHolidays();
  }, [year, month]);

  const loadWorkRecords = async () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    const { data, error } = await supabase
      .from('work_records')
      .select('*')
      .gte('date', firstDay.toISOString().split('T')[0])
      .lte('date', lastDay.toISOString().split('T')[0]);

    if (error) {
      console.error('Error loading work records:', error);
    } else if (data) {
      const recordsMap = new Map<string, WorkRecord>();
      data.forEach((record) => {
        const key = `${record.date}-${record.period}`;
        recordsMap.set(key, record as WorkRecord);
      });
      setWorkRecords(recordsMap);
    }
  };

  const loadHolidays = async () => {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .eq('date::year', year);

    if (error) {
      console.error('Error loading holidays:', error);
    } else if (data) {
      const holidaysMap = new Map<string, Holiday>();
      data.forEach((holiday) => {
        holidaysMap.set(holiday.date, holiday as Holiday);
      });
      setHolidays(holidaysMap);
    }
    setLoading(false);
  };

  const toggleWorkStatus = async (date: string, period: 'AM' | 'PM') => {
    const key = `${date}-${period}`;
    const existingRecord = workRecords.get(key);

    if (existingRecord) {
      const newStatus = !existingRecord.is_working;
      const { error } = await supabase
        .from('work_records')
        .update({ is_working: newStatus, updated_at: new Date().toISOString() })
        .eq('id', existingRecord.id);

      if (!error) {
        const updatedRecord = { ...existingRecord, is_working: newStatus };
        const newMap = new Map(workRecords);
        newMap.set(key, updatedRecord);
        setWorkRecords(newMap);
      }
    } else {
      const { data, error } = await supabase
        .from('work_records')
        .insert({ date, period, is_working: true })
        .select()
        .single();

      if (!error && data) {
        const newMap = new Map(workRecords);
        newMap.set(key, data as WorkRecord);
        setWorkRecords(newMap);
      }
    }
  };

  const getDaysInMonth = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
    return { daysInMonth, firstDayOfWeek };
  };

  const { daysInMonth, firstDayOfWeek } = getDaysInMonth();

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  const getWorkStatus = (date: string, period: 'AM' | 'PM') => {
    const key = `${date}-${period}`;
    const record = workRecords.get(key);
    return record?.is_working ?? false;
  };

  const isHoliday = (date: string) => {
    return holidays.has(date);
  };

  const getHolidayInfo = (date: string) => {
    return holidays.get(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const emptyDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-800">
          {monthNames[month - 1]} {year}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-medium text-gray-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {emptyDays.map((i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {days.map((day) => {
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const amWorking = getWorkStatus(dateStr, 'AM');
          const pmWorking = getWorkStatus(dateStr, 'PM');
          const holiday = getHolidayInfo(dateStr);

          return (
            <div key={day} className={`border border-gray-200 rounded-lg p-2 aspect-square flex flex-col ${
              holiday ? 'bg-yellow-50' : 'bg-white'
            }`}>
              <div className="flex items-start justify-between mb-1">
                <div className="text-sm font-medium text-gray-700">{day}</div>
                {holiday && <span className="text-xs font-semibold text-orange-600 leading-none">H</span>}
              </div>
              {holiday && <div className="text-xs text-gray-600 mb-1 leading-tight line-clamp-1">{holiday.name}</div>}
              <div className="flex-1 flex flex-col gap-1">
                <button
                  onClick={() => toggleWorkStatus(dateStr, 'AM')}
                  disabled={loading}
                  className={`flex-1 rounded text-xs font-medium transition-colors ${
                    amWorking
                      ? 'bg-work-green text-white hover:opacity-90'
                      : 'bg-work-red text-white hover:opacity-90'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  AM
                </button>
                <button
                  onClick={() => toggleWorkStatus(dateStr, 'PM')}
                  disabled={loading}
                  className={`flex-1 rounded text-xs font-medium transition-colors ${
                    pmWorking
                      ? 'bg-work-green text-white hover:opacity-90'
                      : 'bg-work-red text-white hover:opacity-90'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  PM
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
