import { useEffect, useState } from 'react';
import { bookAppointment, getAvailability } from '../api/clinicApi';
import type { Doctor } from '../types/Doctor';

type Slot = {
  date: string;
  time: string;
  booked: boolean;
};

type Props = {
  doctor: Doctor;
};

export function Availability({ doctor }: Props) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    getAvailability(doctor.id)
      .then((data: Slot[]) => setSlots(data))
      .finally(() => setLoading(false));
  }, [doctor.id]);

  const handleSelect = (slot: Slot) => {
    setSelectedSlot(slot);
    setPatientName('');
    setPatientEmail('');
    setStatus('');
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setStatus('');
    try {
      await bookAppointment({
        doctor_id: doctor.id,
        date: selectedSlot.date,
        time: selectedSlot.time,
        patient_name: patientName,
        patient_email: patientEmail,
      });
      setStatus(`Appointment booked for ${selectedSlot.date} ${selectedSlot.time}`);
      setSlots((prev) =>
        prev.map((s) =>
          s.date === selectedSlot.date && s.time === selectedSlot.time
            ? { ...s, booked: true }
            : s
        )
      );
      setSelectedSlot(null);
    } catch (err: any) {
      setStatus(err.message || 'Booking failed');
    }
  };

  if (loading) return <p>Loading slots...</p>;
  if (slots.length === 0) return <p>No available slots.</p>;

  return (
    <div>
      <h3>Available slots for {doctor.name}</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {slots.map((slot) => {
          const isSelected =
            selectedSlot?.date === slot.date && selectedSlot?.time === slot.time;
          return (
            <li
              key={`${slot.date}-${slot.time}`}
              style={{
                marginBottom: '8px',
                backgroundColor: slot.booked
                  ? '#ccc'
                  : isSelected
                  ? '#ffe082'
                  : '#d0f0c0',
                padding: '8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>
                {slot.date} {slot.time} {slot.booked ? '(Booked)' : ''}
              </span>
              {!slot.booked && !isSelected && (
                <button onClick={() => handleSelect(slot)}>Select</button>
              )}
            </li>
          );
        })}
      </ul>

      {selectedSlot && (
        <div style={{ marginTop: '16px' }}>
          <h4>
            Booking {selectedSlot.date} {selectedSlot.time}
          </h4>
          <input
            type="text"
            placeholder="Patient Name"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            style={{ display: 'block', marginBottom: '8px', width: '200px' }}
          />
          <input
            type="email"
            placeholder="Patient Email"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            style={{ display: 'block', marginBottom: '8px', width: '200px' }}
          />
          <button onClick={handleBook}>Book Now</button>
        </div>
      )}

      {status && <p style={{ marginTop: '12px' }}>{status}</p>}
    </div>
  );
}
