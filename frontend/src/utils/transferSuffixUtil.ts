export const getStopsSuffix = (count: number): string => {
    if (count === 1) {
        return 'А';
    } else if (count >= 2 && count <= 4) {
        return 'И';
    } else {
        return 'ОК';
    }
};