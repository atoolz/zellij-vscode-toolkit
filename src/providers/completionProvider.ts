import * as vscode from 'vscode';
import { getKdlContext } from '../utils/kdlParser';
import { outputChannel } from '../extension';
import { configOptions, uiOptions, topLevelBlocks, themeColors } from '../data/options';
import { actions } from '../data/actions';
import { keybindBlocks, modeNames } from '../data/modes';
import { layoutElements, getAttributesForElement } from '../data/layoutElements';
import { builtinPlugins } from '../data/builtinPlugins';
import { isLayoutFile } from '../utils/configDetector';

export class ZellijCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): vscode.CompletionItem[] | undefined {
        try {
            return this.doProvideCompletionItems(document, position);
        } catch (err) {
            outputChannel?.appendLine(`Completion error: ${err}`);
            return undefined;
        }
    }

    private doProvideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): vscode.CompletionItem[] | undefined {
        const ctx = getKdlContext(document, position);

        if (ctx.inString || ctx.inComment) {
            return this.getStringCompletions(ctx, document);
        }

        if (ctx.inAttributeValue) {
            return this.getAttributeValueCompletions(ctx);
        }

        const items: vscode.CompletionItem[] = [];

        // Top-level completions
        if (ctx.depth === 0) {
            items.push(...this.getTopLevelCompletions(document));
        }

        // Inside keybinds block
        if (ctx.path[0] === 'keybinds') {
            items.push(...this.getKeybindCompletions(ctx));
        }

        // Inside themes block
        if (ctx.path[0] === 'themes') {
            items.push(...this.getThemeCompletions(ctx));
        }

        // Inside plugins block
        if (ctx.path[0] === 'plugins' || ctx.path[0] === 'load_plugins') {
            items.push(...this.getPluginCompletions(ctx));
        }

        // Inside ui block
        if (ctx.path[0] === 'ui') {
            items.push(...this.getUiCompletions(ctx));
        }

        // Layout file completions
        if (isLayoutFile(document) || ctx.path[0] === 'layout') {
            items.push(...this.getLayoutCompletions(ctx));
        }

        // Action completions inside bind blocks
        if (ctx.inBindActionBlock) {
            items.push(...this.getActionCompletions());
        }

        return items.length > 0 ? items : undefined;
    }

    private getTopLevelCompletions(document: vscode.TextDocument): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];
        const isLayout = isLayoutFile(document);

        if (isLayout) {
            // Layout file top-level elements
            for (const el of layoutElements) {
                if (['layout', 'pane', 'tab', 'pane_template', 'tab_template', 'default_tab_template', 'swap_tiled_layout', 'swap_floating_layout'].includes(el.name)) {
                    const item = new vscode.CompletionItem(el.name, vscode.CompletionItemKind.Keyword);
                    item.documentation = new vscode.MarkdownString(el.description);
                    item.insertText = new vscode.SnippetString(`${el.name} {\n\t$0\n}`);
                    items.push(item);
                }
            }
        } else {
            // Config file top-level options
            for (const option of configOptions) {
                const item = new vscode.CompletionItem(option.name, vscode.CompletionItemKind.Property);
                item.documentation = new vscode.MarkdownString(
                    `${option.description}\n\n**Type:** ${option.type}\n\n**Example:** \`${option.example}\``
                );
                item.insertText = this.getOptionInsertText(option);
                item.detail = option.type;
                items.push(item);
            }

            // Top-level blocks
            for (const block of topLevelBlocks) {
                const item = new vscode.CompletionItem(block.name, vscode.CompletionItemKind.Module);
                item.documentation = new vscode.MarkdownString(block.description);
                item.insertText = new vscode.SnippetString(`${block.name} {\n\t$0\n}`);
                items.push(item);
            }
        }

        return items;
    }

    private getOptionInsertText(option: { name: string; type: string; values?: string[] }): vscode.SnippetString {
        if (option.type === 'boolean') {
            return new vscode.SnippetString(`${option.name} \${1|true,false|}`);
        }
        if (option.type === 'enum' && option.values) {
            const choices = option.values.join(',');
            return new vscode.SnippetString(`${option.name} "\${1|${choices}|}"`);
        }
        if (option.type === 'number') {
            return new vscode.SnippetString(`${option.name} \${1:0}`);
        }
        return new vscode.SnippetString(`${option.name} "\${1}"`);
    }

    private getKeybindCompletions(ctx: ReturnType<typeof getKdlContext>): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        if (ctx.depth === 1) {
            // Inside keybinds, suggest mode blocks
            for (const block of keybindBlocks) {
                const item = new vscode.CompletionItem(block.name, vscode.CompletionItemKind.Struct);
                item.documentation = new vscode.MarkdownString(block.description);
                if (block.name === 'shared_except' || block.name === 'shared_among') {
                    item.insertText = new vscode.SnippetString(`${block.name} "\${1:normal}" {\n\t$0\n}`);
                } else {
                    item.insertText = new vscode.SnippetString(`${block.name} {\n\t$0\n}`);
                }
                items.push(item);
            }

            // clear-defaults
            const clearItem = new vscode.CompletionItem('clear-defaults', vscode.CompletionItemKind.Keyword);
            clearItem.documentation = new vscode.MarkdownString('Clear all default keybindings. Must be placed at the top of the keybinds block.');
            clearItem.insertText = new vscode.SnippetString('clear-defaults true');
            items.push(clearItem);
        }

        if (ctx.depth === 2) {
            // Inside a mode block, suggest bind
            const bindItem = new vscode.CompletionItem('bind', vscode.CompletionItemKind.Function);
            bindItem.documentation = new vscode.MarkdownString('Bind a key combination to one or more actions.');
            bindItem.insertText = new vscode.SnippetString('bind "${1:Ctrl a}" { ${0}; }');
            items.push(bindItem);

            const unbindItem = new vscode.CompletionItem('unbind', vscode.CompletionItemKind.Function);
            unbindItem.documentation = new vscode.MarkdownString('Remove a previously defined key binding.');
            unbindItem.insertText = new vscode.SnippetString('unbind "${1:Ctrl a}"');
            items.push(unbindItem);
        }

        // Inside bind block, suggest actions
        if (ctx.inBindActionBlock || ctx.depth >= 3) {
            items.push(...this.getActionCompletions());
        }

        return items;
    }

    private getActionCompletions(): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        for (const action of actions) {
            const item = new vscode.CompletionItem(action.name, vscode.CompletionItemKind.Method);
            item.documentation = new vscode.MarkdownString(
                `${action.description}\n\n**Example:** \`${action.example}\``
            );

            if (action.parameters && action.parameters.length > 0) {
                const param = action.parameters[0];
                if (param.values) {
                    const choices = param.values.join(',');
                    item.insertText = new vscode.SnippetString(`${action.name} "\${1|${choices}|}";`);
                } else if (param.type === 'number') {
                    item.insertText = new vscode.SnippetString(`${action.name} \${1:1};`);
                } else {
                    item.insertText = new vscode.SnippetString(`${action.name} "\${1}";`);
                }
            } else {
                item.insertText = new vscode.SnippetString(`${action.name};`);
            }

            items.push(item);
        }

        return items;
    }

    private getThemeCompletions(ctx: ReturnType<typeof getKdlContext>): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        if (ctx.depth === 1) {
            // Suggest a new theme name
            const item = new vscode.CompletionItem('mytheme', vscode.CompletionItemKind.Color);
            item.documentation = new vscode.MarkdownString('Define a new color theme. Replace "mytheme" with your theme name.');
            item.insertText = new vscode.SnippetString('${1:mytheme} {\n\tfg "${2:#ffffff}"\n\tbg "${3:#000000}"\n\tblack "${4:#000000}"\n\tred "${5:#ff0000}"\n\tgreen "${6:#00ff00}"\n\tyellow "${7:#ffff00}"\n\tblue "${8:#0000ff}"\n\tmagenta "${9:#ff00ff}"\n\tcyan "${10:#00ffff}"\n\twhite "${11:#ffffff}"\n\torange "${12:#ff8800}"\n}');
            items.push(item);
        }

        if (ctx.depth === 2) {
            // Inside a theme, suggest color keys
            for (const color of themeColors) {
                const item = new vscode.CompletionItem(color.name, vscode.CompletionItemKind.Color);
                item.documentation = new vscode.MarkdownString(color.description);
                item.insertText = new vscode.SnippetString(`${color.name} "\${1:#000000}"`);
                items.push(item);
            }
        }

        return items;
    }

    private getPluginCompletions(ctx: ReturnType<typeof getKdlContext>): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        if (ctx.depth === 1) {
            for (const plugin of builtinPlugins) {
                const item = new vscode.CompletionItem(plugin.name, vscode.CompletionItemKind.Module);
                item.documentation = new vscode.MarkdownString(
                    `${plugin.description}\n\n**Location:** \`${plugin.location}\``
                );
                item.insertText = new vscode.SnippetString(`${plugin.name} location="${plugin.location}"`);
                items.push(item);
            }
        }

        return items;
    }

    private getUiCompletions(ctx: ReturnType<typeof getKdlContext>): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        if (ctx.depth === 1) {
            const item = new vscode.CompletionItem('pane_frames', vscode.CompletionItemKind.Struct);
            item.documentation = new vscode.MarkdownString('Configure pane frame appearance.');
            item.insertText = new vscode.SnippetString('pane_frames {\n\t$0\n}');
            items.push(item);
        }

        if (ctx.depth === 2 || ctx.parentNode === 'pane_frames') {
            for (const option of uiOptions) {
                const item = new vscode.CompletionItem(option.name, vscode.CompletionItemKind.Property);
                item.documentation = new vscode.MarkdownString(option.description);
                item.insertText = this.getOptionInsertText(option);
                items.push(item);
            }
        }

        return items;
    }

    private getLayoutCompletions(ctx: ReturnType<typeof getKdlContext>): vscode.CompletionItem[] {
        const items: vscode.CompletionItem[] = [];

        // Get valid children for the current parent
        const parent = ctx.parentNode;
        const parentElement = parent ? layoutElements.find(e => e.name === parent) : null;
        const validChildren = parentElement?.children || [];

        if (validChildren.length > 0) {
            for (const childName of validChildren) {
                const el = layoutElements.find(e => e.name === childName);
                if (el) {
                    const item = new vscode.CompletionItem(el.name, vscode.CompletionItemKind.Keyword);
                    item.documentation = new vscode.MarkdownString(el.description);

                    if (el.children && el.children.length > 0) {
                        item.insertText = new vscode.SnippetString(`${el.name} {\n\t$0\n}`);
                    } else {
                        item.insertText = new vscode.SnippetString(`${el.name}`);
                    }

                    items.push(item);
                }
            }
        } else if (ctx.depth >= 1) {
            // Inside layout context, suggest common elements
            for (const el of layoutElements) {
                if (['pane', 'tab', 'plugin', 'children', 'floating_panes'].includes(el.name)) {
                    const item = new vscode.CompletionItem(el.name, vscode.CompletionItemKind.Keyword);
                    item.documentation = new vscode.MarkdownString(el.description);
                    if (el.name === 'pane' || el.name === 'tab') {
                        item.insertText = new vscode.SnippetString(`${el.name} {\n\t$0\n}`);
                    } else if (el.name === 'plugin') {
                        item.insertText = new vscode.SnippetString(`plugin location="\${1|${builtinPlugins.map(p => p.location).join(',')}|}"`);
                    } else {
                        item.insertText = new vscode.SnippetString(el.name);
                    }
                    items.push(item);
                }
            }
        }

        // Attribute completions for the current node
        if (ctx.currentNode) {
            const attrs = getAttributesForElement(ctx.currentNode);
            for (const attr of attrs) {
                const item = new vscode.CompletionItem(attr.name, vscode.CompletionItemKind.Field);
                item.documentation = new vscode.MarkdownString(attr.description);
                if (attr.type === 'enum' && attr.values) {
                    const choices = attr.values.join(',');
                    item.insertText = new vscode.SnippetString(`${attr.name}="\${1|${choices}|}"`);
                } else if (attr.type === 'boolean') {
                    item.insertText = new vscode.SnippetString(`${attr.name}=\${1|true,false|}`);
                } else {
                    item.insertText = new vscode.SnippetString(`${attr.name}="\${1}"`);
                }
                items.push(item);
            }
        }

        return items;
    }

    private getStringCompletions(ctx: ReturnType<typeof getKdlContext>, document: vscode.TextDocument): vscode.CompletionItem[] | undefined {
        const items: vscode.CompletionItem[] = [];

        if (ctx.path.includes('keybinds')) {
            // Could be a mode name in shared_except/shared_among
            for (const mode of modeNames) {
                const item = new vscode.CompletionItem(mode, vscode.CompletionItemKind.EnumMember);
                items.push(item);
            }
        }

        // Plugin location completions
        if (ctx.path.includes('plugins') || ctx.path.includes('load_plugins')) {
            for (const plugin of builtinPlugins) {
                const item = new vscode.CompletionItem(plugin.location, vscode.CompletionItemKind.Reference);
                item.documentation = new vscode.MarkdownString(plugin.description);
                items.push(item);
            }
        }

        return items.length > 0 ? items : undefined;
    }

    private getAttributeValueCompletions(ctx: ReturnType<typeof getKdlContext>): vscode.CompletionItem[] | undefined {
        const items: vscode.CompletionItem[] = [];

        if (ctx.attributeName === 'split_direction') {
            items.push(
                this.createEnumItem('vertical', 'Split panes vertically (left/right).'),
                this.createEnumItem('horizontal', 'Split panes horizontally (top/bottom).'),
            );
        }

        if (ctx.attributeName === 'location') {
            for (const plugin of builtinPlugins) {
                const item = new vscode.CompletionItem(plugin.location, vscode.CompletionItemKind.Reference);
                item.documentation = new vscode.MarkdownString(plugin.description);
                items.push(item);
            }
        }

        return items.length > 0 ? items : undefined;
    }

    private createEnumItem(value: string, description: string): vscode.CompletionItem {
        const item = new vscode.CompletionItem(value, vscode.CompletionItemKind.EnumMember);
        item.documentation = new vscode.MarkdownString(description);
        return item;
    }
}
