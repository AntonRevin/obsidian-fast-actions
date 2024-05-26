import { App, Editor, MarkdownView, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface FastActionsSettings {
	star: string,
	action: string,
	question: string;
}

const DEFAULT_SETTINGS: FastActionsSettings = {
	star: '#key',
	action: '#action',
	question: "#question"
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
				this.lineToggleValue(editor, this.settings.star);
			},
			icon: "star"
		});

		// Action
		this.addCommand({
			id: 'action-toggle',
			name: 'Toggle Action',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.lineToggleValue(editor, this.settings.action);
			}
		});

		// Question
		this.addCommand({
			id: 'question-toggle',
			name: 'Toggle Question',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				this.lineToggleValue(editor, this.settings.question);
			}
		});

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

	lineToggleValue(editor: Editor, val: string): void {
		var ln = editor.getCursor();
		var txt = editor.getLine(ln.line);

		var toggleType = txt.includes(val + " ");
		var checkbox = RegExp(/([-+*].(\[.\]))/).test(txt);

		if (toggleType) {
			txt = txt.replace(new RegExp(val + " ", "g"), "");
		} else {
			if (txt.length > 0) {
				var txtTrim = txt.trimStart();
				var startPos = txt.search(/\S|$/);
				if (txtTrim[0] == "-" || txtTrim[0] == "+") {
					if (checkbox) {
						txt = txt.slice(0, startPos) + "- [" + txt[startPos + 3] + "] " + val + txt.slice(startPos + 5);
					} else {
						txt = txt.slice(0, startPos) + "- " + val + txt.slice(startPos + 1);
					}
				} else {
					if (startPos == 0) {
						txt = val + " " + txt.slice(startPos);
					} else {
						txt = txt.slice(0, startPos) + val + " " + txt.slice(startPos + 1);
					}
				}
			}
		}
		editor.setLine(ln.line, txt);
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

		containerEl.createEl("p", {
			text: "Fast Actions - Settings",
		});

		containerEl.createEl("a", {
			text: "//AR",
			cls: "fastactions_logo",
			href: "https://www.linkedin.com/in/antonrevin/"
		});
	}
}
