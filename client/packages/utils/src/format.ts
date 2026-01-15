export const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${String(mins).padStart(2, '0')}`;
};

export const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
};
