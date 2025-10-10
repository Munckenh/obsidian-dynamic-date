import { Plugin } from 'obsidian';
import { RelativeDatesSettingTab } from './settings';
import moment from 'moment';
import { dateHighlightingPlugin } from './extension';
import { DATE_REGEX, DEFAULT_SETTINGS, RelativeDatesSettings, getRelativeText, getDateCategory, createDateElement } from './utils';
import { Extension } from '@codemirror/state';

export default class RelativeDatesPlugin extends Plugin {
    settings: RelativeDatesSettings;
    private editorExtensions: Extension[] = [];
    private styleElement: HTMLStyleElement | null = null;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new RelativeDatesSettingTab(this.app, this));
        this.registerEditorExtension(this.editorExtensions);

        this.registerMarkdownPostProcessor((element, _) => {
            this.processElement(element);
        });

        this.registerDomEvent(document, 'click', (event) => {
            this.handleCheckboxClick(event);
        });
    }

    onunload() {
        if (this.styleElement && this.styleElement.parentNode)
            this.styleElement.parentNode.removeChild(this.styleElement);
    }

    async loadSettings() {
        this.setEditorExtensions();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.updateStyles();
    }

    async saveSettings() {
        await this.saveData(this.settings);
        this.updateStyles();
    }

    private setEditorExtensions() {
        this.editorExtensions.push(dateHighlightingPlugin);
    }

    private updateStyles() {
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = 'relative-dates-custom-colors';
            document.head.appendChild(this.styleElement);
        }

        const css = `
            body {
                --date-pill-overdue: ${this.settings.pillColors.overdue};
                --date-pill-today: ${this.settings.pillColors.today};
                --date-pill-tomorrow: ${this.settings.pillColors.tomorrow};
                --date-pill-this-week: ${this.settings.pillColors.thisWeek};
                --date-pill-future: ${this.settings.pillColors.future};
                --date-pill-text: ${this.settings.pillTextColor};
            }
        `;

        this.styleElement.textContent = css;
    }

    private processElement(element: Element) {
        const items = element.querySelectorAll('.task-list-item');
        items.forEach((item: HTMLElement) => this.processTaskItem(item));
    }

    private handleCheckboxClick(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.type !== 'checkbox') return;

        const clickedItem = target.closest('.task-list-item') as HTMLElement;
        if (!clickedItem) return;

        // Allow DOM to update checkbox state first
        setTimeout(() => {
            const items = [clickedItem, ...Array.from(clickedItem.querySelectorAll('.task-list-item'))];
            items.forEach((item: HTMLElement) => {
                item.querySelectorAll('.date-pill').forEach((pill) => {
                    pill.classList.toggle('struck-through', this.isStruckThrough(item));
                });
            });
        }, 10);
    }

    private isStruckThrough(item: HTMLElement) {
        let current = item;
        while (current) {
            if (current.classList.contains('task-list-item')) {
                const taskAttribute = current.getAttribute('data-task');
                if (taskAttribute === 'x' || taskAttribute === '-') return true;
            }

            const parent = current.parentElement?.closest('.task-list-item') as HTMLElement;
            if (parent) {
                current = parent;
            } else {
                break;
            }
        }
        return false;
    }

    private processTaskItem(item: HTMLElement) {
        if ((item.textContent || '').search(DATE_REGEX) === -1) return;

        const nodes = this.getTextNodes(item);
        if (nodes.length > 0) {
            this.processTextNodes(nodes as Text[], this.isStruckThrough(item));
        }
    }

    private getTextNodes(item: HTMLElement) {
        const walker = document.createTreeWalker(
            item,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    let parent = node.parentNode;
                    while (parent && parent !== item) {
                        if (parent.nodeName === 'UL' || parent.nodeName === 'OL') {
                            return NodeFilter.FILTER_REJECT;
                        }
                        parent = parent.parentNode;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                },
            },
        );

        const nodes = [];
        while (walker.nextNode()) {
            const node = walker.currentNode;
            const value = node.nodeValue || '';
            if (value.search(DATE_REGEX) !== -1) nodes.push(node);
        }
        return nodes;
    }

    private processTextNodes(nodes: Text[], isStruckThrough: boolean) {
        nodes.forEach((node) => {
            const value = node.nodeValue || '';
            const matches = Array.from(value.matchAll(DATE_REGEX));

            if (matches.length === 0) return;

            const fragment = document.createDocumentFragment();
            let lastIndex = 0;

            for (const match of matches) {
                const matchIndex = match.index!;
                const date = moment(`${match[1]} ${match[2] || ''}`, 'YYYY-MM-DD HH:mm');

                if (matchIndex > lastIndex) {
                    fragment.appendChild(document.createTextNode(value.slice(lastIndex, matchIndex)));
                }

                if (date.isValid()) {
                    fragment.appendChild(createDateElement(
                        getRelativeText(date),
                        getDateCategory(date),
                        isStruckThrough,
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
