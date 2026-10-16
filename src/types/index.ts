/* ── API wire format (exactly what the backend sends and receives) ── */

export interface DoctorDto {
  id: number;
  name: string;
  specialization: string;
  visit_duration: number | string;
}

export interface AppointmentRequest {
  doctor_id: number;
  date: string;
  time: string;
  patient_name: string;
  patient_email: string;
}

export interface AppointmentResponse {
  success: true;
  appointment_id: number;
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
}

/* ── App models ── */

export interface Doctor {
  id: number;
  name: string;
  specialization: string;
  /** Visit length in minutes. */
  visitDuration: number;
}

export interface Slot {
  /** Local date, `YYYY-MM-DD`. */
  date: string;
  /** Local time, `HH:MM`. */
  time: string;
  booked: boolean;
}
