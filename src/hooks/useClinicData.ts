import { useCallback } from 'react';
import { getAvailability, getDoctors } from '../api/clinicApi';
import { useFetch } from './useFetch';

export const useDoctors = () => useFetch(getDoctors);

export function useAvailability(doctorId: number) {
  const loader = useCallback(() => getAvailability(doctorId), [doctorId]);
  return useFetch(loader);
}
