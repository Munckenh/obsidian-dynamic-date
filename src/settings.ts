import DynamicDatePlugin from './main';
import { App, PluginSettingTab, Setting } from 'obsidian';

export class DynamicDateSettingTab extends PluginSettingTab {
    plugin: DynamicDatePlugin;

    constructor(app: App, plugin: DynamicDatePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl).setName('Color').setHeading();

        new Setting(containerEl)
            .setName('Overdue')
            .setDesc('Color for dates that have passed')
            .addExtraButton(button => button
                .setIcon('rotate-ccw')
                .setTooltip('Restore default')
                .onClick(async () => {
                    this.plugin.settings.pillColors.overdue = '#d1453b';
                    await this.plugin.saveSettings();
                    this.display();
                }),
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.pillColors.overdue)
                .onChange(async (value) => {
                    this.plugin.settings.pillColors.overdue = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Today')
            .setDesc('Color for today\'s date')
            .addExtraButton(button => button
                .setIcon('rotate-ccw')
                .setTooltip('Restore default')
                .onClick(async () => {
                    this.plugin.settings.pillColors.today = '#058527';
                    await this.plugin.saveSettings();
                    this.display();
                }),
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.pillColors.today)
                .onChange(async (value) => {
                    this.plugin.settings.pillColors.today = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Tomorrow')
            .setDesc('Color for tomorrow\'s date')
            .addExtraButton(button => button
                .setIcon('rotate-ccw')
                .setTooltip('Restore default')
                .onClick(async () => {
                    this.plugin.settings.pillColors.tomorrow = '#ad6200';
                    await this.plugin.saveSettings();
                    this.display();
                }),
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.pillColors.tomorrow)
                .onChange(async (value) => {
                    this.plugin.settings.pillColors.tomorrow = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('This week')
            .setDesc('Color for dates within the next 7 days')
            .addExtraButton(button => button
                .setIcon('rotate-ccw')
                .setTooltip('Restore default')
                .onClick(async () => {
                    this.plugin.settings.pillColors.thisWeek = '#692ec2';
                    await this.plugin.saveSettings();
                    this.display();
                }),
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.pillColors.thisWeek)
                .onChange(async (value) => {
                    this.plugin.settings.pillColors.thisWeek = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Future')
            .setDesc('Color for dates beyond next week')
            .addExtraButton(button => button
                .setIcon('rotate-ccw')
                .setTooltip('Restore default')
                .onClick(async () => {
                    this.plugin.settings.pillColors.future = '#808080';
                    await this.plugin.saveSettings();
                    this.display();
                }),
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.pillColors.future)
                .onChange(async (value) => {
                    this.plugin.settings.pillColors.future = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Text')
            .setDesc('Color of the text inside date pills')
            .addExtraButton(button => button
                .setIcon('rotate-ccw')
                .setTooltip('Restore default')
                .onClick(async () => {
                    this.plugin.settings.pillTextColor = '#ffffff';
                    this.display();
                    await this.plugin.saveSettings();
                }),
            )
            .addColorPicker(color => color
                .setValue(this.plugin.settings.pillTextColor)
                .onChange(async (value) => {
                    this.plugin.settings.pillTextColor = value;
                    await this.plugin.saveSettings();
                }));
    }
}
