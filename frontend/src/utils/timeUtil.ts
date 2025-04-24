export function formatTimeRange(dateString: string, minutesToAdd: number): string {
    const startDate = new Date(dateString);

    const startHours = String(startDate.getUTCHours()).padStart(2, '0');
    const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');

    const endDate = new Date(startDate.getTime() + minutesToAdd * 60 * 1000);

    const endHours = String(endDate.getUTCHours()).padStart(2, '0');
    const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');

    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}`;
}

export function formatDuration(duration: number): string {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (minutes === 0) {
        return `${hours}год`;
    }
    return `${hours}год ${minutes}хв`;
}