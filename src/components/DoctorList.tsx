import { useEffect, useState } from 'react';
import { getDoctors } from '../api/clinicApi';
import { DoctorCalendar } from './DoctorCalendar';
import type { Doctor } from '../types/Doctor';

export function DoctorList() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [isBookingFlow, setIsBookingFlow] = useState(false);

    useEffect(() => {
        setLoading(true);
        getDoctors()
            .then(setDoctors)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-gray-500">Loading experts...</p>;

    if (!selectedDoctor) {
        return (
            <div className="max-w-xl mx-auto">
                <h2 className="text-xl font-semibold text-slate-800 mb-1">
                    Select an expert
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                    Who would you like to book an appointment with?
                </p>
                <ul className="space-y-3">
                    {doctors.map((doctor) => (
                        <li key={doctor.id} style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => setSelectedDoctor(doctor)}
                                className="
                                    group w-full text-left p-4 rounded-xl
                                    bg-white border border-slate-200
                                    hover:bg-blue-500 hover:shadow-sm
                                    transition"
                            >
                                <div className="font-medium text-slate-800 group-hover:text-white">
                                    {doctor.name}
                                </div>
                                <div className="text-sm text-slate-500 group-hover:text-slate-300">
                                    {doctor.specialization}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-8">
            {!isBookingFlow && (
                <button
                    onClick={() => setSelectedDoctor(null)}
                    className="text-sm text-blue-600 hover:underline mb-4"
                >
                    ← Back to experts
                </button>
            )}

            <DoctorCalendar
                doctor={selectedDoctor}
                onReturnHome={() => setSelectedDoctor(null)}
                onBookingStepChange={setIsBookingFlow}
            />
        </div>
    );
}
