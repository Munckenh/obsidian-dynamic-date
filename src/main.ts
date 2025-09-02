import { Plugin } from 'obsidian';
import { DynamicDateSettingTab } from './settings';
import moment from 'moment';
import { dateHighlightingPlugin } from './extension';
import { DATE_REGEX, DEFAULT_SETTINGS, DynamicDateSettings, getRelativeText, getDateCategory, createDateElement } from './utils';
import { Extension } from '@codemirror/state';

export default class DynamicDatePlugin extends Plugin {
    settings: DynamicDateSettings;
    private editorExtensions: Extension[] = [];

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new DynamicDateSettingTab(this.app, this));
        this.registerEditorExtension(this.editorExtensions);

        this.registerMarkdownPostProcessor((element, context) => {
            const items = element.querySelectorAll('.task-list-item');
            items.forEach((item) => {
                this.processListItem(item as HTMLElement);
            });
        });

        this.registerDomEvent(document, 'click', (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (target.type === 'checkbox') {
                const item = target.closest('.task-list-item');
                if (item) {
                    setTimeout(() => {
                        item.querySelectorAll('.date-pill').forEach((pill) => {
                            pill.classList.toggle('striked-through', this.isStrikedThrough(item as HTMLElement));
                        });
                    }, 10);
                }

            }
        });
    }

    async loadSettings() {
        this.setEditorExtensions();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.setPillColors();
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.setPillColors();
    }

    onunload() {
        const body = document.body;
        body.style.removeProperty('--date-pill-overdue');
        body.style.removeProperty('--date-pill-today');
        body.style.removeProperty('--date-pill-tomorrow');
        body.style.removeProperty('--date-pill-this-week');
        body.style.removeProperty('--date-pill-future');
    }

    private setEditorExtensions() {
        this.editorExtensions.push(dateHighlightingPlugin);
    }

    private setPillColors(): void {
        const body = document.body;
        body.style.setProperty('--date-pill-overdue', this.settings.pillColors.overdue);
        body.style.setProperty('--date-pill-today', this.settings.pillColors.today);
        body.style.setProperty('--date-pill-tomorrow', this.settings.pillColors.tomorrow);
        body.style.setProperty('--date-pill-this-week', this.settings.pillColors.thisWeek);
        body.style.setProperty('--date-pill-future', this.settings.pillColors.future);
    }

    private isStrikedThrough(element: HTMLElement): boolean {
        const taskAttribute = element.getAttribute('data-task');
        return taskAttribute === 'x' || taskAttribute === '-';
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
                const matchIndex = match.index!;
                const date = moment(`${match[1]} ${match[2] || ''}`, 'YYYY-MM-DD HH:mm');

                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(value.slice(lastIndex, matchIndex)));
                }

                if (date.isValid()) {
                    fragment.appendChild(createDateElement(
                        getRelativeText(date),
                        getDateCategory(date),
                        this.isStrikedThrough(element),
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
}
