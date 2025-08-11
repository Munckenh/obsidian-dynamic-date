import { Plugin } from 'obsidian';
import { DynamicDateSettingTab } from './settings';
import moment from 'moment';

const DATE_REGEX = /📅\s*(\d{4}-\d{2}-\d{2})(?:\s*(\d{2}:\d{2}))?/g;
const DEFAULT_SETTINGS: DynamicDateOptions = {
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

interface DynamicDateOptions {
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

export default class DynamicDatePlugin extends Plugin {
    settings: DynamicDateOptions;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new DynamicDateSettingTab(this.app, this));
        this.registerMarkdownPostProcessor((element, context) => {
            const items = element.querySelectorAll('.task-list-item');
            items.forEach((item) => {
                this.processListItem(item as HTMLElement)
            });
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.updateColor();
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateColor();
    }

    onunload() {}

    private updateColor(): void {
        const body = document.body;
        body.style.setProperty('--date-pill-overdue', this.settings.pillColors.overdue);
        body.style.setProperty('--date-pill-today', this.settings.pillColors.today);
        body.style.setProperty('--date-pill-tomorrow', this.settings.pillColors.tomorrow);
        body.style.setProperty('--date-pill-this-week', this.settings.pillColors.thisWeek);
        body.style.setProperty('--date-pill-future', this.settings.pillColors.future);
    }

    private processListItem(element: HTMLElement): void {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];

        while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            if ((node.nodeValue || '').match(DATE_REGEX)) {
                nodes.push(node);
            }
        }
        
        nodes.forEach((node) => {
            const fragment = document.createDocumentFragment();
            const value = node.nodeValue || '';

            let lastIndex = 0;
            for (const match of value.matchAll(DATE_REGEX)) {
                const matchIndex = match.index;
                const dateString = `${match[1]} ${match[2] || ''}`.trim();
                const date = moment(dateString, 'YYYY-MM-DD HH:mm');

                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(value.slice(lastIndex, matchIndex)));
                }

                if (date.isValid()) {
                    fragment.appendChild(this.createDateElement(
                        this.getRelativeDateText(date),
                        this.getDateCategory(date),
                        dateString
                    ));
                } else {
                    fragment.appendChild(document.createTextNode(match[0]));
                }

                lastIndex = matchIndex + match[0].length;
            }

            if (lastIndex < value.length) {
                fragment.appendChild(document.createTextNode(value.slice(lastIndex)));
            }

            node.parentNode!.replaceChild(fragment, node);
        });
    }

    getRelativeDateText(date: moment.Moment): string {
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

    getDateCategory(date: moment.Moment): string {
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

    createDateElement(text: string, category: string, originalDate?: string): HTMLElement {
        const span = document.createElement('span');
        span.textContent = text;
        span.className = `date-pill date-pill-${category}`;
        if (originalDate) {
            span.title = originalDate;
        }
        return span;
    }
}
