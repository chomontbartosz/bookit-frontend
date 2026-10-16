import { useState } from 'react';
import { BookingFlow } from './components/booking/BookingFlow';
import { DoctorList } from './components/booking/DoctorList';
import { Header } from './components/Header';
import type { Doctor } from './types';

export default function App() {
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  return (
    <div className="card">
      <Header />
      <main className="card-body">
        {doctor ? (
          <BookingFlow key={doctor.id} doctor={doctor} onExit={() => setDoctor(null)} />
        ) : (
          <DoctorList onSelect={setDoctor} />
        )}
      </main>
    </div>
  );
}
