import { Decoration, DecorationSet, EditorView, PluginSpec, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import moment from 'moment';
import { DATE_REGEX, getRelativeText, getDateCategory, createDateElement } from './utils';

export class DateWidget extends WidgetType {
    constructor(
        private text: string,
        private category: string,
    ) {
        super();
    }

    toDOM(view: EditorView): HTMLElement {
        return createDateElement(this.text, this.category);
    }
}

export class DateHighlightingPlugin implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged || update.selectionSet) {
            this.decorations = this.buildDecorations(update.view);
        }
    }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const cursorPos = view.state.selection.main.head;

        for (let { from, to } of view.visibleRanges) {
            const text = view.state.doc.sliceString(from, to);
            const matches = text.matchAll(DATE_REGEX);

            for (const match of matches) {
                const matchStart = from + match.index!;
                const matchEnd = matchStart + match[0].length;

                const cursorInRange = cursorPos >= matchStart && cursorPos <= matchEnd;
                if (!cursorInRange) {
                    const date = moment(`${match[1]} ${match[2] || ''}`, 'YYYY-MM-DD HH:mm');

                    if (date.isValid()) {
                        const relativeText = getRelativeText(date);
                        const category = getDateCategory(date);

                        const decoration = Decoration.replace({
                            widget: new DateWidget(relativeText, category),
                        });

                        builder.add(matchStart, matchEnd, decoration);
                    }
                }
            }
        }

        return builder.finish();
    }
}

const pluginSpec: PluginSpec<DateHighlightingPlugin> = {
    decorations: (value: DateHighlightingPlugin) => value.decorations
};

export const dateHighlightingPlugin = ViewPlugin.fromClass(
    DateHighlightingPlugin,
    pluginSpec
);
