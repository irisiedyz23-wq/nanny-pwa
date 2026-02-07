import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { Summary } from './components/Summary';

function App() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(1);

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Nanny Work Tracker</h1>
          <p className="text-gray-700">Track working hours and calculate monthly salary</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar year={year} month={month} onMonthChange={handleMonthChange} />
          </div>
          <div>
            <Summary year={year} month={month} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
