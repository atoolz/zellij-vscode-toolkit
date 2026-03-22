import * as vscode from 'vscode';
import { configOptions, uiOptions } from '../data/options';
import { actions } from '../data/actions';
import { modeNames } from '../data/modes';
import { isLayoutFile } from '../utils/configDetector';
import { layoutElements } from '../data/layoutElements';
import { removeStrings } from '../utils/kdlParser';
import { outputChannel } from '../extension';

const ALL_OPTION_NAMES = new Set(configOptions.map(o => o.name));
const ALL_UI_OPTION_NAMES = new Set(uiOptions.map(o => o.name));
const ALL_ACTION_NAMES = new Set(actions.map(a => a.name));
const ALL_MODE_NAMES = new Set(modeNames);
const ALL_LAYOUT_ELEMENT_NAMES = new Set(layoutElements.map(e => e.name));

const TOP_LEVEL_BLOCKS = new Set(['keybinds', 'themes', 'plugins', 'load_plugins', 'ui', 'env']);
const KEYBIND_BLOCKS = new Set([...modeNames, 'shared', 'shared_except', 'shared_among', 'tmux']);
const THEME_COLORS = new Set(['fg', 'bg', 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'orange']);

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ZellijDiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('zellij');
        context.subscriptions.push(this.diagnosticCollection);

        // Register listeners
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.languageId === 'zellij-kdl') {
                    this.validate(e.document);
                }
            }),
            vscode.workspace.onDidOpenTextDocument(doc => {
                if (doc.languageId === 'zellij-kdl') {
                    this.validate(doc);
                }
            }),
            vscode.workspace.onDidCloseTextDocument(doc => {
                this.diagnosticCollection.delete(doc.uri);
            })
        );

        // Validate already open documents
        for (const doc of vscode.workspace.textDocuments) {
            if (doc.languageId === 'zellij-kdl') {
                this.validate(doc);
            }
        }
    }

    validate(document: vscode.TextDocument): void {
        try {
            this.doValidate(document);
        } catch (err) {
            outputChannel?.appendLine(`Diagnostic error: ${err}`);
            this.diagnosticCollection.delete(document.uri);
        }
    }

    private doValidate(document: vscode.TextDocument): void {
        const config = vscode.workspace.getConfiguration('zellijConfig');
        if (!config.get('enableValidation', true)) {
            this.diagnosticCollection.delete(document.uri);
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];
        const isLayout = isLayoutFile(document);

        const contextStack: string[] = [];
        let inBlockComment = false;

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            const trimmed = line.text.trim();

            // Track multi-line block comments
            if (inBlockComment) {
                if (trimmed.includes('*/')) {
                    inBlockComment = false;
                }
                continue;
            }

            // Skip comments and empty lines
            if (!trimmed) continue;
            if (trimmed.startsWith('//')) continue;
            if (trimmed.startsWith('/*')) {
                if (!trimmed.includes('*/')) {
                    inBlockComment = true;
                }
                continue;
            }

            // Track brace nesting (strip strings first to avoid counting braces inside them)
            const stripped = removeStrings(trimmed);
            const opens = (stripped.match(/\{/g) || []).length;
            const closes = (stripped.match(/\}/g) || []).length;

            // Extract node name from line
            const nodeMatch = trimmed.match(/^([\w][\w-]*)/);
            const nodeName = nodeMatch ? nodeMatch[1] : null;

            if (nodeName && opens > closes) {
                // Validate based on context
                this.validateNode(nodeName, contextStack, line, diagnostics, isLayout);
                for (let j = 0; j < opens - closes; j++) {
                    contextStack.push(nodeName);
                }
            } else if (nodeName && opens === closes) {
                // Leaf node (no children)
                this.validateNode(nodeName, contextStack, line, diagnostics, isLayout);
                this.validateLeafValue(nodeName, contextStack, line, diagnostics);
            }

            if (closes > opens) {
                for (let j = 0; j < closes - opens && contextStack.length > 0; j++) {
                    contextStack.pop();
                }
            }

            // Validate action names inside bind blocks
            if (contextStack.includes('bind') || trimmed.match(/^bind\s/)) {
                this.validateActions(line, diagnostics);
            }

            // Validate mode names in SwitchToMode
            this.validateSwitchToMode(line, diagnostics);

            // Validate hex colors in theme blocks
            if (contextStack[0] === 'themes') {
                this.validateHexColors(line, diagnostics);
            }
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private validateNode(
        nodeName: string,
        contextStack: string[],
        line: vscode.TextLine,
        diagnostics: vscode.Diagnostic[],
        isLayout: boolean
    ): void {
        const depth = contextStack.length;

        // Top-level validation
        if (depth === 0) {
            if (isLayout) {
                if (!ALL_LAYOUT_ELEMENT_NAMES.has(nodeName) && nodeName !== 'layout') {
                    // In layout files, top-level should be layout elements
                    // Don't flag unknown ones too aggressively since layouts can have various nodes
                }
            } else {
                // Config file top-level
                const validTopLevel = new Set([...ALL_OPTION_NAMES, ...TOP_LEVEL_BLOCKS]);
                if (!validTopLevel.has(nodeName)) {
                    const range = this.getWordRange(line, nodeName);
                    if (range) {
                        const diag = new vscode.Diagnostic(
                            range,
                            `Unknown config option: "${nodeName}"`,
                            vscode.DiagnosticSeverity.Warning
                        );
                        diag.source = 'zellij';
                        diagnostics.push(diag);
                    }
                }
            }
        }

        // Inside keybinds, validate mode block names
        if (depth === 1 && contextStack[0] === 'keybinds') {
            if (!KEYBIND_BLOCKS.has(nodeName) && nodeName !== 'clear-defaults') {
                const range = this.getWordRange(line, nodeName);
                if (range) {
                    const diag = new vscode.Diagnostic(
                        range,
                        `Unknown keybind mode: "${nodeName}". Valid modes: ${[...KEYBIND_BLOCKS].join(', ')}`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diag.source = 'zellij';
                    diagnostics.push(diag);
                }
            }
        }

        // Inside themes, validate color names
        if (depth === 2 && contextStack[0] === 'themes') {
            if (!THEME_COLORS.has(nodeName)) {
                const range = this.getWordRange(line, nodeName);
                if (range) {
                    const diag = new vscode.Diagnostic(
                        range,
                        `Unknown theme color: "${nodeName}". Valid colors: ${[...THEME_COLORS].join(', ')}`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diag.source = 'zellij';
                    diagnostics.push(diag);
                }
            }
        }

        // Inside ui > pane_frames, validate option names
        if (depth === 2 && contextStack[0] === 'ui' && contextStack[1] === 'pane_frames') {
            if (!ALL_UI_OPTION_NAMES.has(nodeName)) {
                const range = this.getWordRange(line, nodeName);
                if (range) {
                    const diag = new vscode.Diagnostic(
                        range,
                        `Unknown UI option: "${nodeName}"`,
                        vscode.DiagnosticSeverity.Warning
                    );
                    diag.source = 'zellij';
                    diagnostics.push(diag);
                }
            }
        }
    }

    private validateLeafValue(
        nodeName: string,
        contextStack: string[],
        line: vscode.TextLine,
        diagnostics: vscode.Diagnostic[]
    ): void {
        const depth = contextStack.length;
        const trimmed = line.text.trim();

        // Validate boolean options
        if (depth === 0) {
            const option = configOptions.find(o => o.name === nodeName);
            if (option) {
                if (option.type === 'boolean') {
                    const valueMatch = trimmed.match(new RegExp(`^${escapeRegExp(nodeName)}\\s+(.+?)\\s*;?\\s*$`));
                    if (valueMatch) {
                        const value = valueMatch[1].replace(/"/g, '');
                        if (value !== 'true' && value !== 'false') {
                            const startIdx = line.text.indexOf(value);
                            if (startIdx >= 0) {
                                const range = new vscode.Range(line.lineNumber, startIdx, line.lineNumber, startIdx + value.length);
                                const diag = new vscode.Diagnostic(
                                    range,
                                    `Invalid value for "${nodeName}": expected true or false, got "${value}"`,
                                    vscode.DiagnosticSeverity.Error
                                );
                                diag.source = 'zellij';
                                diagnostics.push(diag);
                            }
                        }
                    }
                }

                if (option.type === 'enum' && option.values) {
                    const valueMatch = trimmed.match(new RegExp(`^${escapeRegExp(nodeName)}\\s+"?([^"\\s;]+)"?`));
                    if (valueMatch) {
                        const value = valueMatch[1];
                        if (!option.values.includes(value)) {
                            const startIdx = line.text.indexOf(value);
                            if (startIdx >= 0) {
                                const range = new vscode.Range(line.lineNumber, startIdx, line.lineNumber, startIdx + value.length);
                                const diag = new vscode.Diagnostic(
                                    range,
                                    `Invalid value for "${nodeName}": "${value}". Valid values: ${option.values.join(', ')}`,
                                    vscode.DiagnosticSeverity.Error
                                );
                                diag.source = 'zellij';
                                diagnostics.push(diag);
                            }
                        }
                    }
                }

                if (option.type === 'number') {
                    const valueMatch = trimmed.match(new RegExp(`^${escapeRegExp(nodeName)}\\s+(.+?)\\s*;?\\s*$`));
                    if (valueMatch) {
                        const value = valueMatch[1].replace(/"/g, '');
                        if (!/^\d+$/.test(value)) {
                            const startIdx = line.text.indexOf(value);
                            if (startIdx >= 0) {
                                const range = new vscode.Range(line.lineNumber, startIdx, line.lineNumber, startIdx + value.length);
                                const diag = new vscode.Diagnostic(
                                    range,
                                    `Invalid value for "${nodeName}": expected a number, got "${value}"`,
                                    vscode.DiagnosticSeverity.Error
                                );
                                diag.source = 'zellij';
                                diagnostics.push(diag);
                            }
                        }
                    }
                }
            }
        }
    }

    private validateActions(line: vscode.TextLine, diagnostics: vscode.Diagnostic[]): void {
        const text = removeStrings(line.text);
        // Match PascalCase words that look like action names (after stripping strings)
        const actionPattern = /\b([A-Z][a-zA-Z]+)\b/g;
        let match;

        while ((match = actionPattern.exec(text)) !== null) {
            const name = match[1];
            // Skip common non-action PascalCase words
            if (['Left', 'Right', 'Up', 'Down', 'Ctrl', 'Alt', 'Shift', 'Enter', 'Esc', 'Tab',
                'Backspace', 'Delete', 'Home', 'End', 'PageUp', 'PageDown', 'CaseSensitivity',
                'Wrap', 'WholeWord', 'Increase', 'Decrease', 'Normal', 'Locked', 'Resize',
                'Pane', 'Scroll', 'Search', 'Session', 'Move', 'Prompt', 'Tmux',
                'EnterSearch', 'RenameTab', 'RenamePane'].includes(name)) {
                continue;
            }

            if (!ALL_ACTION_NAMES.has(name)) {
                const range = new vscode.Range(
                    line.lineNumber, match.index,
                    line.lineNumber, match.index + name.length
                );
                const diag = new vscode.Diagnostic(
                    range,
                    `Unknown action: "${name}"`,
                    vscode.DiagnosticSeverity.Warning
                );
                diag.source = 'zellij';
                diagnostics.push(diag);
            }
        }
    }

    private validateSwitchToMode(line: vscode.TextLine, diagnostics: vscode.Diagnostic[]): void {
        const switchMatch = line.text.match(/SwitchToMode\s+"([^"]+)"/);
        if (switchMatch) {
            const mode = switchMatch[1].toLowerCase();
            const validModes = new Set([...modeNames, 'tmux']);
            if (!validModes.has(mode)) {
                const startIdx = line.text.indexOf(switchMatch[1]);
                const range = new vscode.Range(
                    line.lineNumber, startIdx,
                    line.lineNumber, startIdx + switchMatch[1].length
                );
                const diag = new vscode.Diagnostic(
                    range,
                    `Unknown mode: "${switchMatch[1]}". Valid modes: ${[...validModes].join(', ')}`,
                    vscode.DiagnosticSeverity.Error
                );
                diag.source = 'zellij';
                diagnostics.push(diag);
            }
        }
    }

    private validateHexColors(line: vscode.TextLine, diagnostics: vscode.Diagnostic[]): void {
        const colorPattern = /"(#[0-9a-fA-F]+)"/g;
        let match;

        while ((match = colorPattern.exec(line.text)) !== null) {
            const color = match[1];
            if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
                const startIdx = match.index + 1; // skip opening quote
                const range = new vscode.Range(
                    line.lineNumber, startIdx,
                    line.lineNumber, startIdx + color.length
                );
                const diag = new vscode.Diagnostic(
                    range,
                    `Invalid hex color: "${color}". Expected format: #RRGGBB (6 hex digits)`,
                    vscode.DiagnosticSeverity.Warning
                );
                diag.source = 'zellij';
                diagnostics.push(diag);
            }
        }
    }

    private getWordRange(line: vscode.TextLine, word: string): vscode.Range | null {
        const idx = line.text.indexOf(word);
        if (idx < 0) return null;
        return new vscode.Range(line.lineNumber, idx, line.lineNumber, idx + word.length);
    }
}
