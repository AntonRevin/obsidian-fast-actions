import moment from 'moment';

// Weeknumber from date
export const getWeekNumber = (d: Date): number => {
    var d: Date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil(( ( (d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
}

export const getDateWithFormat = (input: string,frmt: string): Date => new Date(moment(input.split('/').pop()?.substring(0, frmt.length), frmt).toString())