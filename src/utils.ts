import moment from 'moment';

export const DATE_REGEX = /📅\s*(\d{4}-\d{2}-\d{2})(?:\s*(\d{2}:\d{2}))?/g;

export const DEFAULT_SETTINGS: DynamicDateSettings = {
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    pillColors: {
        overdue: '#d1453b',
        today: '#058527',
        tomorrow: '#ad6200',
        thisWeek: '#692ec2',
        future: '#808080'
    },
    pillTextColor: '#ffffff'
};

export interface DynamicDateSettings {
    dateFormat: string;
    timeFormat: string;
    pillColors: {
        overdue: string;
        today: string;
        tomorrow: string;
        thisWeek: string;
        future: string;
    };
    pillTextColor: string;
}

export function getRelativeText(date: moment.Moment): string {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    const hasTime = date.minutes() !== 0 || date.hours() !== 0;
    const timeString = hasTime ? date.minutes() === 0 ? ` ${date.format('h A')}` : ` ${date.format('h:mm A')}` : '';

    if (date.isSame(today, 'day')) {
        return `Today${timeString}`;
    } else if (date.isSame(tomorrow, 'day')) {
        return `Tomorrow${timeString}`;
    } else if (date.isBetween(today, moment().add(7, 'days').endOf('day'), 'day')) {
        return `${date.format('dddd')}${timeString}`;
    } else if (date.year() === today.year()) {
        return `${date.format('D MMM')}${timeString}`;
    } else {
        return `${date.format('D MMM YYYY')}${timeString}`;
    }
}

export function getDateCategory(date: moment.Moment): string {
    const today = moment().startOf('day');
    const tomorrow = moment().add(1, 'day').startOf('day');
    const sevenDaysFromNow = moment().add(7, 'days').endOf('day');

    if (date.isBefore(today, 'day')) {
        return 'overdue';
    } else if (date.isSame(today, 'day')) {
        return 'today';
    } else if (date.isSame(tomorrow, 'day')) {
        return 'tomorrow';
    } else if (date.isBetween(tomorrow, sevenDaysFromNow, 'day')) {
        return 'this-week';
    }
    return 'future';
}

export function createDateElement(text: string, category: string): HTMLElement {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = `date-pill date-pill-${category}`;
    return span;
}
