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

    const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove .md

    // Extract the date part from the start of the string (if any)
    const dateRegex = /^\d{2}-\d{2}-\d{4}/; // Matches the date format "DD-MM-YYYY"
    const match = baseName.match(dateRegex);

    if (!match) {
        throw new Error(`No valid date found in path: ${input}`);
    }

    const datePart = match[0]; // This is the date string

    // Parse the date part using Moment.js
    const m = moment(datePart, format, true);
    if (!m.isValid()) {
        throw new Error(`Invalid date format in path: ${input}`);
    }

    return m.toDate();
};