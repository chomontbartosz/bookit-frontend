import { useEffect, useState } from 'react';
import { getAvailability, bookAppointment } from '../api/clinicApi';
import type { Doctor } from '../types/Doctor';

function getGoogleCalendarUrl(params: {
    title: string;
    description: string;
    start: Date;
    end: Date;
}) {
    const formatDate = (date: Date) =>
        date.toISOString().replace(/-|:|\.\d+/g, '');

    const startStr = formatDate(params.start);
    const endStr = formatDate(params.end);

    const url = new URL('https://calendar.google.com/calendar/render');

    url.searchParams.set('action', 'TEMPLATE');
    url.searchParams.set('text', params.title);
    url.searchParams.set('details', params.description);
    url.searchParams.set('dates', `${startStr}/${endStr}`);

    return url.toString();
}


type Slot = { date: string; time: string; booked: boolean };

type Props = {
    doctor: Doctor;
    onReturnHome: () => void;
    onBookingStepChange?: (active: boolean) => void;
};

export function DoctorCalendar({
    doctor,
    onReturnHome,
    onBookingStepChange,
}: Props) {
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [calendarUrl, setCalendarUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [patientName, setPatientName] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [status, setStatus] = useState('');
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);


    useEffect(() => {
        setLoading(true);
        getAvailability(doctor.id)
            .then((data: Slot[]) => setSlots(data))
            .finally(() => setLoading(false));
    }, [doctor.id]);

    useEffect(() => {
        const isInBookingFlow = Boolean(selectedDate || selectedTime || bookingSuccess);
        onBookingStepChange?.(isInBookingFlow);
    }, [selectedDate, selectedTime, bookingSuccess, onBookingStepChange]);

    const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));

    const weeks: Date[][] = [];
    let week: Date[] = [];
    for (let i = 0; i < startOfMonth.getDay(); i++) week.push(null as unknown as Date);
    daysInMonth.forEach((day) => {
        week.push(day);
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    });
    if (week.length > 0) {
        while (week.length < 7) week.push(null as unknown as Date);
        weeks.push(week);
    }

    const handleBook = async () => {
        if (!selectedDate || !selectedTime) return;
        setStatus('');
        try {
            const startDateTime = new Date(selectedDate);
            const [hours, minutes] = selectedTime.split(':').map(Number);
            startDateTime.setHours(hours, minutes);

            const endDateTime = new Date(startDateTime);
            endDateTime.setMinutes(endDateTime.getMinutes() + 30);

            const gcalUrl = getGoogleCalendarUrl({
                title: `Appointment with Dr. ${doctor.name}`,
                description: `Your appointment booked via Book.it`,
                start: startDateTime,
                end: endDateTime,
            });

            await bookAppointment({
                doctor_id: doctor.id,
                date: selectedDate.toISOString().split('T')[0],
                time: selectedTime,
                patient_name: patientName,
                patient_email: patientEmail,
            });

            setCalendarUrl(gcalUrl);
            setBookingSuccess(true);
            setStatus(`Appointment booked for ${startDateTime.toLocaleString()}`);

            setSelectedDate(null);
            setSelectedTime(null);
            setPatientName('');
            setPatientEmail('');

        } catch (err: any) {
            setStatus(err.message || 'Booking failed');
        }

    };

    if (loading) return <p>Loading availability...</p>;

    if (bookingSuccess) {
        return (
            <div className="bg-white p-6 rounded-xl shadow-sm max-w-md">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Appointment confirmed
                </h3>

                <p className="text-slate-600 mb-4">{status}</p>

                {calendarUrl && (
                    <a
                        href={calendarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mb-4 px-4 py-2 rounded-sm bg-transparent border border-blue-600 text-blue-600 text-sm hover:bg-blue-700 hover:text-white"
                    >
                        ➕ Add to Google Calendar
                    </a>
                )}

                <div>
                    <button
                        onClick={onReturnHome}
                        className="text-sm text-slate-600 hover:underline"
                    >
                        ← Return to home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-semibold text-slate-800">
                Book appointment
            </h2>
            <p className="text-sm text-slate-500">
                with Dr. {doctor.name}
            </p>

            {!selectedDate && (
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex justify-between items-center mb-3">
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="px-3 py-1 rounded border hover:bg-gray-100">← Prev</button>
                        <span className="font-medium">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="px-3 py-1 rounded border hover:bg-gray-100">Next →</button>
                    </div>
                    <div className="w-full max-w-md mx-auto">
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="text-center text-xs font-semibold text-slate-500 uppercase">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1.5"> { }
                            {weeks.flat().map((day, index) => {
                                if (!day) return <div key={index} className="h-12 bg-slate-50/50 rounded-lg" />;

                                const dayStr = day.toISOString().split('T')[0];
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                const isToday = day.getTime() === today.getTime();
                                const isPast = day < today;
                                const hasAvailable = !isPast && slotsByDate[dayStr]?.some(s => !s.booked);

                                return (
                                    <button
                                        key={day.getTime()}
                                        disabled={!hasAvailable || isPast}
                                        onClick={() => setSelectedDate(day)}
                                        className={`
                                            relative h-12 w-full flex flex-col items-center justify-center 
                                            text-sm rounded-xl transition-all duration-200
                                            ${isPast
                                                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                : hasAvailable
                                                    ? 'bg-green-100 text-green-500 shadow-sm hover:border-blue-400 hover:shadow-md cursor-pointer'
                                                    : 'bg-slate-100 text-slate-500 cursor-default'
                                            }
                                            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2 z-10' : ''}
                                        `}
                                    >
                                        <span className={isToday ? 'font-bold text-blue-600' : ''}>
                                            {day.getDate()}
                                        </span>

                                        {hasAvailable && (
                                            <span className="absolute bottom-1.5 w-1 h-1 bg-green-500 rounded-full"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {selectedDate && !selectedTime && (
                <div style={{ marginTop: '16px' }}>
                    <h4>Available times for {selectedDate.toDateString()}</h4>
                    {slotsByDate[selectedDate.toISOString().split('T')[0]]?.filter(s => !s.booked).length === 0 ? (
                        <p>No available slots on this day.</p>
                    ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {slotsByDate[selectedDate.toISOString().split('T')[0]]
                                .filter(s => !s.booked)
                                .map(s => (
                                    <div
                                        key={s.time}
                                        className="px-3 py-2 rounded bg-blue-50 hover:bg-blue-100 cursor-pointer text-sm"
                                        onClick={() => setSelectedTime(s.time)}
                                    >
                                        {s.time}
                                    </div>
                                ))}
                        </div>
                    )}
                    <button onClick={() => setSelectedDate(null)}>← Back to calendar</button>
                </div>
            )}

            {selectedTime && (
                <div style={{ marginTop: '16px' }}>
                    <h4>
                        Booking {selectedDate?.toDateString()} at {selectedTime}
                    </h4>
                    <input
                        type="text"
                        placeholder="Patient Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-2"
                    />
                    <input
                        type="email"
                        placeholder="Patient Email"
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        className="border rounded px-3 py-2 w-full mb-2"
                    />
                    {patientEmail && !isValidEmail(patientEmail) && (
                        <p style={{ color: 'red', fontSize: '12px' }}>
                            Please enter a valid email address
                        </p>
                    )}

                    <button onClick={handleBook}>Book Now</button>
                </div>
            )}

            {status && <p style={{ marginTop: '12px' }}>{status}</p>}
        </div>
    );
}