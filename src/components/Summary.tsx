import { useState, useEffect } from 'react';
import { Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Holiday {
  date: string;
  on_shift_multiplier: number;
  off_shift_multiplier: number;
}

interface DayRecord {
  am: boolean;
  pm: boolean;
  holiday?: Holiday;
}

interface SummaryProps {
  year: number;
  month: number;
}

export function Summary({ year, month }: SummaryProps) {
  const [workingDays, setWorkingDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const DAILY_RATE = 8500 / 26;

  useEffect(() => {
    calculateWorkingDays();
  }, [year, month]);

  const calculateWorkingDays = async () => {
    setLoading(true);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const firstDayStr = firstDay.toISOString().split('T')[0];
    const lastDayStr = lastDay.toISOString().split('T')[0];

    const { data: workData, error: workError } = await supabase
      .from('work_records')
      .select('date, period, is_working')
      .gte('date', firstDayStr)
      .lte('date', lastDayStr)
      .eq('is_working', true);

    const { data: holidayData, error: holidayError } = await supabase
      .from('holidays')
      .select('date, on_shift_multiplier, off_shift_multiplier')
      .gte('date', firstDayStr)
      .lte('date', lastDayStr);

    if (workError) {
      console.error('Error calculating working days:', workError);
      setWorkingDays(0);
    } else if (workData) {
      const daysMap = new Map<string, DayRecord>();

      workData.forEach((record) => {
        const existing = daysMap.get(record.date) || { am: false, pm: false };
        if (record.period === 'AM') {
          existing.am = true;
        } else {
          existing.pm = true;
        }
        daysMap.set(record.date, existing);
      });

      if (holidayData && !holidayError) {
        holidayData.forEach((holiday) => {
          const existing = daysMap.get(holiday.date);
          if (existing) {
            existing.holiday = holiday;
          }
        });
      }

      let totalDays = 0;
      daysMap.forEach((dayRecord) => {
        const { am, pm, holiday } = dayRecord;
        const isWorking = am || pm;

        if (!isWorking) return;

        let dayValue = 0;
        if (am && pm) {
          dayValue = 1;
        } else if (am || pm) {
          dayValue = 0.5;
        }

        if (holiday) {
          const isFullDay = am && pm;
          const multiplier = isFullDay ? holiday.on_shift_multiplier : holiday.on_shift_multiplier;
          totalDays += dayValue * multiplier;
        } else {
          totalDays += dayValue;
        }
      });

      setWorkingDays(totalDays);
    }
    setLoading(false);
  };

  const salary = workingDays * DAILY_RATE;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Summary</h3>

      <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-lg">
        <div className="bg-slate-700 p-3 rounded-lg">
          <Calendar className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Working Days</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : workingDays.toFixed(1)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#8a9a5b1a' }}>
        <div className="p-3 rounded-lg" style={{ backgroundColor: '#8a9a5b' }}>
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600">Salary (RMB)</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '...' : salary.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Rate: {DAILY_RATE.toFixed(2)} RMB/day
          </p>
        </div>
      </div>
    </div>
  );
}
