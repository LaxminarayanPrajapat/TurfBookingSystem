export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

export const formatDateTime = (date: Date | string): string => {
    return `${formatDate(date)} ${formatTime(date)}`;
};

export const calculateDuration = (startDate: Date, endDate: Date): number => {
    return Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60); // hours
};

export const calculateTotalPrice = (pricePerHour: number, duration: number): number => {
    return Math.round(pricePerHour * duration * 100) / 100;
};

export const truncateString = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '...';
};

export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const getStarColor = (rating: number): string => {
    if (rating >= 4.5) return 'text-yellow-400';
    if (rating >= 4) return 'text-yellow-300';
    if (rating >= 3) return 'text-yellow-200';
    return 'text-gray-300';
};

export const sortByRating = (a: any, b: any): number => {
    return b.rating - a.rating;
};

export const sortByPrice = (a: any, b: any): number => {
    return a.pricePerHour - b.pricePerHour;
};

export const sortByNewest = (a: any, b: any): number => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};
