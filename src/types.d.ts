import { View, WorkspaceLeaf } from "obsidian";

declare module 'obsidian' {
	interface Workspace {
		getLeavesOfType(
		viewType: 'markdown' | 'search' | 'file-explorer',
		): ExplorerLeaf[];
	}
}

interface FileItem {
	titleEl?: HTMLDivElement;
	titleInnerEl?: HTMLDivElement;
	selfEl: HTMLDivElement;
	innerEl: HTMLDivElement;
	el: HTMLDivElement;
}

interface ExplorerView extends View {
	fileItems: Record<string, FileItem>; // keyed by path
}

interface ExplorerLeaf extends WorkspaceLeaf {
	view: ExplorerView;
}