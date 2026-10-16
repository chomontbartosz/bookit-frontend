import { APP_CONFIG } from '../config';
import type {
  ApiErrorBody,
  AppointmentRequest,
  AppointmentResponse,
  Doctor,
  DoctorDto,
  Slot,
} from '../types';

/** Error with a machine-readable `code`, translated in the UI (see i18n `errors.*`). */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message?: string) {
    super(message ?? code);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${APP_CONFIG.apiBaseUrl}${path}`, {
      ...init,
      headers: { Accept: 'application/json', ...init.headers },
    });
  } catch {
    throw new ApiError('network_error', 0);
  }

  const body: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (body ?? {}) as ApiErrorBody;
    throw new ApiError(error.code ?? 'unknown_error', res.status, error.message);
  }
  return body as T;
}

const toDoctor = (dto: DoctorDto): Doctor => ({
  id: dto.id,
  name: dto.name,
  specialization: dto.specialization,
  visitDuration: Number(dto.visit_duration) || APP_CONFIG.defaultVisitMinutes,
});

export async function getDoctors(): Promise<Doctor[]> {
  const doctors = await request<DoctorDto[]>('/doctors');
  return doctors.map(toDoctor);
}

export function getAvailability(doctorId: number): Promise<Slot[]> {
  return request<Slot[]>(`/doctors/${doctorId}/availability`);
}

export function bookAppointment(payload: AppointmentRequest): Promise<AppointmentResponse> {
  return request<AppointmentResponse>('/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
