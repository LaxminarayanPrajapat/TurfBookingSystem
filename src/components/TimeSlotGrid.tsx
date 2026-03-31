import type { TimeSlot } from '../types';

interface TimeSlotGridProps {
    slots: TimeSlot[];
    selectedSlots: string[];
    onSlotToggle: (slotId: string) => void;
}

// Generate 06:00–22:00 hourly display labels
function formatHour(hour: number) {
    const h = hour.toString().padStart(2, '0');
    return `${h}:00`;
}

const TimeSlotGrid = ({ slots, selectedSlots, onSlotToggle }: TimeSlotGridProps) => {
    // Build a map for quick lookup by startTime string
    const slotMap = new Map(slots.map(s => [s.startTime, s]));

    // Always render 06:00–21:00 (16 slots representing 06:00–22:00 range)
    const hours = Array.from({ length: 16 }, (_, i) => i + 6);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {hours.map(hour => {
                const startTime = formatHour(hour);
                const endTime = formatHour(hour + 1);
                const slot = slotMap.get(startTime);

                const isBooked = slot ? !slot.isAvailable : false;
                const isSelected = slot ? selectedSlots.includes(slot.id) : false;

                return (
                    <button
                        key={hour}
                        onClick={() => slot && !isBooked && onSlotToggle(slot.id)}
                        disabled={isBooked || !slot}
                        className={[
                            'flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all min-h-[64px] text-sm font-medium',
                            isSelected
                                ? 'border-primary bg-orange-50 text-primary shadow-sm'
                                : isBooked
                                    ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                                    : !slot
                                        ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                        : 'border-gray-200 bg-white text-on-surface hover:border-primary hover:bg-orange-50 cursor-pointer',
                        ].join(' ')}
                        aria-label={`${startTime} to ${endTime}${isBooked ? ' (booked)' : isSelected ? ' (selected)' : ''}`}
                    >
                        <span className="font-semibold">{startTime}</span>
                        <span className="text-xs opacity-70">– {endTime}</span>
                        {isBooked && (
                            <span className="text-xs mt-1 text-gray-400">Booked</span>
                        )}
                        {isSelected && (
                            <span className="material-symbols-outlined text-primary text-base mt-0.5">check_circle</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

export default TimeSlotGrid;
