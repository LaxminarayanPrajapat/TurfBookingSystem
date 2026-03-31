import { useState } from 'react';

interface CustomCalendarProps {
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    disabledDates?: Date[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}

function isDisabled(date: Date, disabledDates: Date[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return disabledDates.some(d => isSameDay(d, date));
}

const CustomCalendar = ({ selectedDate, onDateSelect, disabledDates = [] }: CustomCalendarProps) => {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Build grid cells: leading empty + day cells
    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    return (
        <div className="bg-white rounded-xl p-4 select-none">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-low transition-colors text-on-surface"
                    aria-label="Previous month"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>
                <span className="font-semibold text-on-surface" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {MONTHS[viewMonth]} {viewYear}
                </span>
                <button
                    onClick={nextMonth}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-low transition-colors text-on-surface"
                    aria-label="Next month"
                >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map(d => (
                    <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} />;

                    const date = new Date(viewYear, viewMonth, day);
                    const disabled = isDisabled(date, disabledDates);
                    const selected = selectedDate ? isSameDay(date, selectedDate) : false;
                    const isToday = isSameDay(date, today);

                    return (
                        <button
                            key={day}
                            onClick={() => !disabled && onDateSelect(date)}
                            disabled={disabled}
                            className={[
                                'w-full aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all',
                                selected
                                    ? 'btn-gradient text-white shadow-sm'
                                    : isToday && !disabled
                                        ? 'border-2 border-primary text-primary'
                                        : disabled
                                            ? 'text-gray-300 cursor-not-allowed'
                                            : 'text-on-surface hover:bg-surface-low cursor-pointer',
                            ].join(' ')}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomCalendar;
