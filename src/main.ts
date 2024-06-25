import { App, Editor, EditorPosition, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { getWeekNumber, getDateWithFormat } from 'src/utils';
import { ExplorerLeaf } from './types';

interface FastActionsSettings {
	star: string,
	action: string,
	question: string,
	delimPaths: string[],
	delimFormat: string;
}

const DEFAULT_SETTINGS: FastActionsSettings = {
	star: '#key',
	action: '#action',
	question: "#question",
	delimPaths: ["Daily/"],
	delimFormat: "DD-MM-YYYY"
}

export default class FastActions extends Plugin {
	settings: FastActionsSettings;

	async onload() {
		await this.loadSettings();

		// Star
		this.addCommand({
			id: 'star-toggle',
			name: 'Toggle Star',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.toggleValue(editor, this.settings.star);
			},
			icon: "star"
		});

		// Action
		this.addCommand({
			id: 'action-toggle',
			name: 'Toggle Action',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.toggleValue(editor, this.settings.action);
			}
		});

		// Question
		this.addCommand({
			id: 'question-toggle',
			name: 'Toggle Question',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.toggleValue(editor, this.settings.question);
			}
		});

		// Register change events
		this.app.workspace.onLayoutReady(() => this.handleExplorerRefresh());
		this.registerEvent(
			this.app.workspace.on('layout-change', () => this.handleExplorerRefresh()),
		);
		this.registerEvent(
			this.app.vault.on('delete', (file) => this.handleExplorerRefresh()),
		);
		this.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => this.handleExplorerRefresh()),
		);

		// Register the settings tab
		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() { }

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	handleExplorerRefresh(): void {
		const fileExplorers : ExplorerLeaf[] = this.app.workspace.getLeavesOfType('file-explorer');
		for (const fileExplorer of fileExplorers) { 
			const leaves = Object.keys(fileExplorer.view.fileItems);
			var targetLeaves : any = {};
			for (const sub of this.settings.delimPaths) {
				targetLeaves[sub] = [];
			}

			for (let i = 0; i < leaves.length; i++) {
				const name = leaves[i];
				if (this.settings.delimPaths.some(sub => name.startsWith(sub))) {
					fileExplorer.view.fileItems[name].el.classList.remove("divider");
					fileExplorer.view.fileItems[name].el.id = getWeekNumber(getDateWithFormat(name, this.settings.delimFormat)).toString();
					for (const sub of this.settings.delimPaths) {
						if (name.startsWith(sub)) {
							targetLeaves[sub].push(name);
						}
					}
				}
			}

			for (const sub of this.settings.delimPaths) {
				targetLeaves[sub].sort((a : string, b : string) => {
					const d1 = getDateWithFormat(a, this.settings.delimFormat);
					const d2 = getDateWithFormat(b, this.settings.delimFormat);
					return d1.getTime() - d2.getTime();
				});
			}

			for (const sub of this.settings.delimPaths) {
				for (let i = 0; i < targetLeaves[sub].length - 1; i++) {
					const name = targetLeaves[sub][i];
					if (fileExplorer.view.fileItems[name].el.id < fileExplorer.view.fileItems[targetLeaves[sub][i+1]].el.id) {
						fileExplorer.view.fileItems[name].el.classList.add("divider");
					}
				}
			}
		}
	}

	toggleValue(editor: Editor, val: string): void {
		var sel = editor.listSelections();
		var end = sel[0].anchor.line;
		var start = sel[0].head.line;
		var num_lines = end - start;
		for (let i = 0; i <= num_lines; i++) {
			var v : EditorPosition = {ch : 1, line: start + i};
			this.lineToggleValue(editor, v, val);
		}
	}

	lineToggleValue(editor: Editor, pos: EditorPosition, val: string): void {
		var txt = editor.getLine(pos.line);

		var toggleType = txt.includes(val + " ");
		var checkbox = RegExp(/([-+*].(\[.\]))/).test(txt);
		var numbered = RegExp(/^[\s]*(?:\d+\.) .*/).test(txt);

		if (toggleType) {
			txt = txt.replace(new RegExp(val + " ", "g"), "");
		} else {
			if (txt.length > 0) {
				var txtTrim = txt.trimStart();
				var startPos = txt.search(/\S|$/);
				if (txtTrim[0] == "-" || txtTrim[0] == "+" || txtTrim[0] == "*") {
					if (checkbox) {
						txt = txt.slice(0, startPos) + "- [" + txt[startPos + 3] + "] " + val + txt.slice(startPos + 5);
					} else {
						txt = txt.slice(0, startPos) + "- " + val + txt.slice(startPos + 1);
					}
				} else {
					if (numbered) {
						var startContent = txt.search(/\./);
						txt = txt.slice(0, startContent) + ". " + val + txt.slice(startContent + 1);
					} else {
						if (startPos == 0) {
							txt = val + " " + txt.slice(startPos);
						} else {
							txt = txt.slice(0, startPos) + val + " " + txt.slice(startPos);
						}
					}
				}
			}
		}
		editor.setLine(pos.line, txt);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: FastActions;

	constructor(app: App, plugin: FastActions) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h1", {
			text: "Fast Actions - Settings",
		});

		new Setting(containerEl)
			.setName('Star')
			.setDesc('String toggle using the Star command')
			.addText(text => text
				.setPlaceholder('#key')
				.setValue(this.plugin.settings.star)
				.onChange(async (value) => {
					this.plugin.settings.star = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Action')
			.setDesc('String toggle using the Action command')
			.addText(text => text
				.setPlaceholder('#action')
				.setValue(this.plugin.settings.action)
				.onChange(async (value) => {
					this.plugin.settings.action = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Question')
			.setDesc('String toggle using the Question command')
			.addText(text => text
				.setPlaceholder('#question')
				.setValue(this.plugin.settings.question)
				.onChange(async (value) => {
					this.plugin.settings.question = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Weekly Deliminator: Folder Paths')
			.setDesc('Path to the daily notes folder for adding separators, one per line')
			.addTextArea(text => text
				.setPlaceholder('Daily/')
				.setValue(this.plugin.settings.delimPaths.join("\n"))
				.onChange(async (value) => {
					this.plugin.settings.delimPaths = value.split("\n");
					await this.plugin.saveSettings();
					this.plugin.handleExplorerRefresh();
				}));

		new Setting(containerEl)
			.setName('Weekly Deliminator: Date Format')
			.setDesc('Format for ')
			.addText(text => text
				.setPlaceholder('DD-MM-YYYY')
				.setValue(this.plugin.settings.delimFormat)
				.onChange(async (value) => {
					this.plugin.settings.delimFormat = value;
					await this.plugin.saveSettings();
					this.plugin.handleExplorerRefresh();
				}));
	}
}
