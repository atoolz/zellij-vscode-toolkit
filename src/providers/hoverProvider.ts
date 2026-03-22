import * as vscode from 'vscode';
import { getWordAtPosition, getKdlContext } from '../utils/kdlParser';
import { outputChannel } from '../extension';
import { configOptions, uiOptions, topLevelBlocks, themeColors } from '../data/options';
import { actions } from '../data/actions';
import { modes, keybindBlocks } from '../data/modes';
import { layoutElements } from '../data/layoutElements';
import { builtinPlugins } from '../data/builtinPlugins';

export class ZellijHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.Hover | undefined {
        try {
            return this.doProvideHover(document, position);
        } catch (err) {
            outputChannel?.appendLine(`Hover error: ${err}`);
            return undefined;
        }
    }

    private doProvideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.Hover | undefined {
        const word = getWordAtPosition(document, position);
        if (!word) {
            return undefined;
        }

        const ctx = getKdlContext(document, position);

        if (ctx.inComment) {
            return undefined;
        }

        // Try config options
        const configOption = configOptions.find(o => o.name === word) || uiOptions.find(o => o.name === word);
        if (configOption) {
            return this.createConfigOptionHover(configOption);
        }

        // Try top-level blocks
        const block = topLevelBlocks.find(b => b.name === word);
        if (block) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`## ${block.name}\n\n`);
            md.appendMarkdown(`${block.description}\n\n`);
            md.appendMarkdown(`[Zellij Documentation](https://zellij.dev/documentation)`);
            return new vscode.Hover(md);
        }

        // Try actions
        const action = actions.find(a => a.name === word);
        if (action) {
            return this.createActionHover(action);
        }

        // Try modes
        const mode = modes.find(m => m.name === word);
        if (mode) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`## Mode: ${mode.name}\n\n`);
            md.appendMarkdown(`${mode.description}\n\n`);
            md.appendMarkdown(`[Zellij Modes Documentation](https://zellij.dev/documentation/keybindings)`);
            return new vscode.Hover(md);
        }

        // Try keybind blocks (shared, shared_except, etc.)
        const kbBlock = keybindBlocks.find(b => b.name === word);
        if (kbBlock && !mode) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`## ${kbBlock.name}\n\n`);
            md.appendMarkdown(`${kbBlock.description}\n\n`);
            return new vscode.Hover(md);
        }

        // Try layout elements
        const layoutEl = layoutElements.find(e => e.name === word);
        if (layoutEl) {
            return this.createLayoutElementHover(layoutEl);
        }

        // Try theme colors
        const themeColor = themeColors.find(c => c.name === word);
        if (themeColor && ctx.path.includes('themes')) {
            const md = new vscode.MarkdownString();
            md.appendMarkdown(`## Theme Color: ${themeColor.name}\n\n`);
            md.appendMarkdown(`${themeColor.description}\n\n`);
            md.appendMarkdown(`**Value:** A hex color string (e.g., \`"#ff0000"\`)\n\n`);
            md.appendMarkdown(`[Zellij Themes Documentation](https://zellij.dev/documentation/themes)`);
            return new vscode.Hover(md);
        }

        // Try built-in plugin names
        const line = document.lineAt(position.line).text;
        for (const plugin of builtinPlugins) {
            if (line.includes(plugin.location) && line.indexOf(plugin.location) <= position.character && position.character <= line.indexOf(plugin.location) + plugin.location.length) {
                const md = new vscode.MarkdownString();
                md.appendMarkdown(`## Plugin: ${plugin.name}\n\n`);
                md.appendMarkdown(`${plugin.description}\n\n`);
                md.appendMarkdown(`**Location:** \`${plugin.location}\`\n\n`);
                md.appendMarkdown(`[Zellij Plugins Documentation](https://zellij.dev/documentation/plugins)`);
                return new vscode.Hover(md);
            }
        }

        // Try keywords
        if (word === 'bind') {
            const md = new vscode.MarkdownString();
            md.appendMarkdown('## bind\n\n');
            md.appendMarkdown('Binds a key combination to one or more actions.\n\n');
            md.appendMarkdown('**Syntax:** `bind "Key" { Action; }`\n\n');
            md.appendMarkdown('**Key modifiers:** `Ctrl`, `Alt`, `Shift`\n\n');
            md.appendMarkdown('**Special keys:** `Enter`, `Esc`, `Tab`, `Backspace`, `Delete`, `Home`, `End`, `PageUp`, `PageDown`, `Up`, `Down`, `Left`, `Right`, `F1`-`F12`\n\n');
            md.appendMarkdown('**Example:**\n```kdl\nbind "Ctrl a" { SwitchToMode "locked"; }\n```\n\n');
            md.appendMarkdown('[Zellij Keybindings](https://zellij.dev/documentation/keybindings)');
            return new vscode.Hover(md);
        }

        if (word === 'unbind') {
            const md = new vscode.MarkdownString();
            md.appendMarkdown('## unbind\n\n');
            md.appendMarkdown('Removes a previously defined key binding.\n\n');
            md.appendMarkdown('**Syntax:** `unbind "Key"`\n\n');
            md.appendMarkdown('**Example:**\n```kdl\nunbind "Ctrl a"\n```');
            return new vscode.Hover(md);
        }

        return undefined;
    }

    private createConfigOptionHover(option: { name: string; type: string; description: string; values?: string[]; default?: string; example: string; docUrl: string }): vscode.Hover {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`## ${option.name}\n\n`);
        md.appendMarkdown(`${option.description}\n\n`);
        md.appendMarkdown(`**Type:** \`${option.type}\`\n\n`);

        if (option.values) {
            md.appendMarkdown(`**Valid values:** ${option.values.map(v => `\`${v}\``).join(', ')}\n\n`);
        }

        if (option.default) {
            md.appendMarkdown(`**Default:** \`${option.default}\`\n\n`);
        }

        md.appendMarkdown(`**Example:**\n\`\`\`kdl\n${option.example}\n\`\`\`\n\n`);
        md.appendMarkdown(`[Zellij Documentation](${option.docUrl})`);

        return new vscode.Hover(md);
    }

    private createActionHover(action: { name: string; description: string; parameters?: { name: string; type: string; values?: string[]; description: string }[]; example: string; docUrl: string }): vscode.Hover {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`## Action: ${action.name}\n\n`);
        md.appendMarkdown(`${action.description}\n\n`);

        if (action.parameters && action.parameters.length > 0) {
            md.appendMarkdown('**Parameters:**\n\n');
            for (const param of action.parameters) {
                md.appendMarkdown(`- \`${param.name}\` (${param.type}): ${param.description}`);
                if (param.values) {
                    md.appendMarkdown(` [${param.values.map(v => `\`${v}\``).join(', ')}]`);
                }
                md.appendMarkdown('\n');
            }
            md.appendMarkdown('\n');
        }

        md.appendMarkdown(`**Example:**\n\`\`\`kdl\n${action.example}\n\`\`\`\n\n`);
        md.appendMarkdown(`[Zellij Actions Documentation](${action.docUrl})`);

        return new vscode.Hover(md);
    }

    private createLayoutElementHover(element: { name: string; description: string; attributes: { name: string; type: string; description: string; example: string }[]; docUrl: string }): vscode.Hover {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`## Layout: ${element.name}\n\n`);
        md.appendMarkdown(`${element.description}\n\n`);

        if (element.attributes.length > 0) {
            md.appendMarkdown('**Attributes:**\n\n');
            for (const attr of element.attributes) {
                md.appendMarkdown(`- \`${attr.name}\` (${attr.type}): ${attr.description}\n`);
            }
            md.appendMarkdown('\n');
        }

        md.appendMarkdown(`[Zellij Layouts Documentation](${element.docUrl})`);

        return new vscode.Hover(md);
    }
}
