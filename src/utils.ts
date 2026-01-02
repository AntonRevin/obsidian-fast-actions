import moment from 'moment';

// Weeknumber from date
export const getWeekNumber = (date: Date): number => {
    return moment(date).isoWeek();
};

export const getDateWithFormat = (input: string, format: string): Date => {
    const fileName = input.split('/').pop();
    if (!fileName) {
        throw new Error("Invalid path");
    }

    const baseName = fileName.replace(/\.[^/.]+$/, ''); // remove .md

    const m = moment(baseName, format, true);
    if (!m.isValid()) {
        throw new Error(`Invalid date in path: ${input}`);
    }

    return m.toDate();
};
