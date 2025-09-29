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

        this.registerMarkdownPostProcessor((element, _) => {
            this.processElement(element);
        });

        this.registerDomEvent(document, 'click', (event) => {
            this.handleCheckboxClick(event);
        });
    }

    onunload() {
        const body = document.body;
        body.style.removeProperty('--date-pill-overdue');
        body.style.removeProperty('--date-pill-today');
        body.style.removeProperty('--date-pill-tomorrow');
        body.style.removeProperty('--date-pill-this-week');
        body.style.removeProperty('--date-pill-future');
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

    private setEditorExtensions() {
        this.editorExtensions.push(dateHighlightingPlugin);
    }

    private setPillColors() {
        const body = document.body;
        body.style.setProperty('--date-pill-overdue', this.settings.pillColors.overdue);
        body.style.setProperty('--date-pill-today', this.settings.pillColors.today);
        body.style.setProperty('--date-pill-tomorrow', this.settings.pillColors.tomorrow);
        body.style.setProperty('--date-pill-this-week', this.settings.pillColors.thisWeek);
        body.style.setProperty('--date-pill-future', this.settings.pillColors.future);
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
        if (!(item.textContent || '').match(DATE_REGEX)) return;

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
            if (value.match(DATE_REGEX)) nodes.push(node);
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
