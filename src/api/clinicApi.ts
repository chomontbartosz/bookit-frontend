const API_BASE = import.meta.env.VITE_API_URL;
// const API_BASE = 'http://book-it.local/wp-json/clinic/v1';

export async function getDoctors() {
  const res = await fetch(`${API_BASE}/doctors`);
  if (!res.ok) throw new Error('Failed to fetch doctors');
  return res.json();
}

export async function getAvailability(doctorId: number) {
  const res = await fetch(`${API_BASE}/doctors/${doctorId}/availability`);
  if (!res.ok) throw new Error('Failed to fetch availability');
  return res.json();
}

export async function bookAppointment(payload: {
  doctor_id: number;
  date: string;
  time: string;
  patient_name?: string;
  patient_email?: string;
}) {
  const res = await fetch(`${API_BASE}/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || 'Booking failed');
  }
  return res.json();
}
