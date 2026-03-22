import * as vscode from 'vscode';
import { ZellijCompletionProvider } from './providers/completionProvider';
import { ZellijHoverProvider } from './providers/hoverProvider';
import { ZellijDiagnosticProvider } from './providers/diagnosticProvider';
import { ZellijColorProvider } from './providers/colorProvider';
import { setupAutoDetection } from './utils/configDetector';

const LANGUAGE_ID = 'zellij-kdl';

export let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Zellij Config');
    context.subscriptions.push(outputChannel);

    const selector: vscode.DocumentSelector = { language: LANGUAGE_ID };

    // Auto-detect Zellij KDL files
    setupAutoDetection(context);

    // Completion provider
    const completionProvider = new ZellijCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            selector,
            completionProvider,
            '.', '"', ' ', '\n'
        )
    );

    // Hover provider
    const hoverProvider = new ZellijHoverProvider();
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(selector, hoverProvider)
    );

    // Diagnostic provider
    new ZellijDiagnosticProvider(context);

    // Color provider
    const colorProvider = new ZellijColorProvider();
    context.subscriptions.push(
        vscode.languages.registerColorProvider(selector, colorProvider)
    );

    // Command: Set as Zellij Config
    context.subscriptions.push(
        vscode.commands.registerCommand('zellij-config.setAsZellijConfig', () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                vscode.languages.setTextDocumentLanguage(editor.document, LANGUAGE_ID).then(
                    () => {
                        vscode.window.showInformationMessage('File language set to Zellij Config (KDL).');
                    },
                    (err) => {
                        vscode.window.showErrorMessage(`Failed to set language: ${err}`);
                    }
                );
            } else {
                vscode.window.showWarningMessage('No active editor found.');
            }
        })
    );

    // Command: Open Zellij Documentation
    context.subscriptions.push(
        vscode.commands.registerCommand('zellij-config.openDocs', () => {
            vscode.env.openExternal(vscode.Uri.parse('https://zellij.dev/documentation')).then(
                (success) => {
                    if (!success) {
                        vscode.window.showWarningMessage('Could not open Zellij documentation in browser.');
                    }
                },
                () => {
                    vscode.window.showWarningMessage('Failed to open Zellij documentation.');
                }
            );
        })
    );
}

export function deactivate() {
    // Nothing to clean up
}
