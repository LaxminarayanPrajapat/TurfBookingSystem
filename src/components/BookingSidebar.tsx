interface BookingSidebarProps {
    turfName: string;
    selectedDate: Date | null;
    selectedSlots: string[];   // slot ids
    slotLabels: string[];      // human-readable e.g. ["06:00–07:00", "07:00–08:00"]
    pricePerHour: number;
    ctaLabel?: string;
    onCtaClick: () => void;
    ctaDisabled?: boolean;
}

function formatDate(date: Date) {
    return date.toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
}

const BookingSidebar = ({
    turfName,
    selectedDate,
    selectedSlots,
    slotLabels,
    pricePerHour,
    ctaLabel = 'Proceed to Payment',
    onCtaClick,
    ctaDisabled = false,
}: BookingSidebarProps) => {
    const duration = selectedSlots.length;
    const subtotal = duration * pricePerHour;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    return (
        <div className="sticky top-20 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="btn-gradient px-5 py-4">
                <h3 className="font-semibold text-white text-lg" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    Booking Summary
                </h3>
            </div>

            <div className="p-5 space-y-4">
                {/* Turf name */}
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">stadium</span>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Venue</p>
                        <p className="font-semibold text-on-surface">{turfName}</p>
                    </div>
                </div>

                {/* Date */}
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">calendar_today</span>
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                        <p className="font-medium text-on-surface text-sm">
                            {selectedDate ? formatDate(selectedDate) : <span className="text-gray-400">Not selected</span>}
                        </p>
                    </div>
                </div>

                {/* Slots */}
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-xl mt-0.5">schedule</span>
                    <div className="flex-1">
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Time Slots</p>
                        {slotLabels.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1">
                                {slotLabels.map((label, i) => (
                                    <span key={i} className="text-xs bg-orange-50 text-primary border border-orange-200 rounded-full px-2 py-0.5">
                                        {label}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No slots selected</p>
                        )}
                    </div>
                </div>

                {/* Duration */}
                {duration > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary text-xl">timer</span>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">Duration</p>
                            <p className="font-medium text-on-surface text-sm">{duration} hour{duration > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500">
                        <span>₹{pricePerHour}/hr × {duration} hr{duration !== 1 ? 's' : ''}</span>
                        <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                        <span>GST (18%)</span>
                        <span>₹{tax}</span>
                    </div>
                    <div className="flex justify-between font-bold text-on-surface text-base border-t border-gray-100 pt-2">
                        <span>Total</span>
                        <span className="text-primary">₹{total}</span>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={onCtaClick}
                    disabled={ctaDisabled}
                    className={[
                        'w-full py-3 rounded-full font-semibold text-sm transition-all',
                        ctaDisabled
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'btn-gradient hover:opacity-90 shadow-sm',
                    ].join(' ')}
                >
                    {ctaLabel}
                </button>
            </div>
        </div>
    );
};

export default BookingSidebar;
