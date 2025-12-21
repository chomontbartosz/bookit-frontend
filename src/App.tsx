import { useState } from 'react';
import type { Doctor } from './types/Doctor';
import { DoctorList } from './components/DoctorList';
import { Availability } from './components/Availability';
import { DoctorCalendar } from './components/DoctorCalendar';

function App() {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  return (
      <div className="w-xl mx-auto bg-white rounded-2xl">
      <header className="border-b border-gray-100 max-w-xl mx-auto">
        <div className="max-w-xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-slate-800">
            Book<span className="text-blue-600">.it</span>
          </h1>
        </div>
      </header>

      {!selectedDoctor && (
        <main className="max-w-xl mx-auto px-6 py-10">
        <DoctorList />
        </main>
      )}

      {selectedDoctor && (
        <>
          <button onClick={() => setSelectedDoctor(null)}>← Back</button>
          <Availability doctor={selectedDoctor} />
          <DoctorCalendar
      doctor={selectedDoctor}
      onReturnHome={() => setSelectedDoctor(null)}
    />
        </>
      )}
    </div>
  );
}

export default App;
