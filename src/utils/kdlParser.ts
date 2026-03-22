import * as vscode from 'vscode';

export interface KdlContext {
    /** The nesting path of node names from root to cursor, e.g. ["keybinds", "normal", "bind"] */
    path: string[];
    /** The immediate parent node name */
    parentNode: string | null;
    /** The current node name (the one the cursor is on or inside) */
    currentNode: string | null;
    /** Whether the cursor is inside a string */
    inString: boolean;
    /** Whether the cursor is inside a comment */
    inComment: boolean;
    /** Whether the cursor is in an attribute value position (after =) */
    inAttributeValue: boolean;
    /** The attribute name if cursor is in attribute value position */
    attributeName: string | null;
    /** Current nesting depth (number of unclosed braces) */
    depth: number;
    /** The word at or before the cursor */
    wordAtCursor: string;
    /** Whether we are at the start of a line (potentially a new node) */
    isLineStart: boolean;
    /** Whether the cursor is inside braces of a bind action block */
    inBindActionBlock: boolean;
}

/**
 * Analyzes KDL document context at a given position.
 * This is a lightweight heuristic parser, not a full KDL parser.
 */
export function getKdlContext(document: vscode.TextDocument, position: vscode.Position): KdlContext {
    const text = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
    const line = document.lineAt(position.line).text;
    const linePrefix = line.substring(0, position.character);

    const result: KdlContext = {
        path: [],
        parentNode: null,
        currentNode: null,
        inString: false,
        inComment: false,
        inAttributeValue: false,
        attributeName: null,
        depth: 0,
        wordAtCursor: '',
        isLineStart: false,
        inBindActionBlock: false,
    };

    // Check if in string
    result.inString = isInsideString(linePrefix);

    // Check if in comment
    result.inComment = isInsideComment(text, linePrefix);

    if (result.inString || result.inComment) {
        return result;
    }

    // Check if at line start (only whitespace before cursor)
    result.isLineStart = /^\s*$/.test(linePrefix) || /^\s*\w*$/.test(linePrefix);

    // Check attribute value position
    const attrMatch = linePrefix.match(/(\w+)\s*=\s*"?([^"]*)?$/);
    if (attrMatch) {
        result.inAttributeValue = true;
        result.attributeName = attrMatch[1];
    }

    // Get word at cursor
    const wordMatch = linePrefix.match(/(\w+)$/);
    result.wordAtCursor = wordMatch ? wordMatch[1] : '';

    // Build path by tracking brace nesting
    const path = buildPath(text);
    result.path = path;
    result.depth = path.length;
    result.parentNode = path.length > 0 ? path[path.length - 1] : null;

    // Determine current node from the current line
    const nodeMatch = linePrefix.match(/^\s*(\w[\w-]*)/);
    if (nodeMatch) {
        result.currentNode = nodeMatch[1];
    }

    // Detect if inside a bind action block: bind "key" { <cursor> }
    result.inBindActionBlock = detectBindActionBlock(text, linePrefix, path);

    return result;
}

function isInsideString(linePrefix: string): boolean {
    let inStr = false;
    for (let i = 0; i < linePrefix.length; i++) {
        if (linePrefix[i] === '"' && (i === 0 || linePrefix[i - 1] !== '\\')) {
            inStr = !inStr;
        }
    }
    return inStr;
}

function isInsideComment(fullText: string, linePrefix: string): boolean {
    // Line comment
    const lineNoStr = removeStrings(linePrefix);
    if (lineNoStr.includes('//')) {
        return true;
    }

    // Block comment: check if we have an unclosed /*
    const textNoStr = removeStrings(fullText);
    const opens = (textNoStr.match(/\/\*/g) || []).length;
    const closes = (textNoStr.match(/\*\//g) || []).length;
    return opens > closes;
}

export function removeStrings(text: string): string {
    return text.replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

function buildPath(text: string): string[] {
    const cleaned = removeStrings(text);
    // Remove comments
    const noComments = cleaned
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '');

    const path: string[] = [];
    const lines = noComments.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Count opening and closing braces
        const opens = (trimmed.match(/\{/g) || []).length;
        const closes = (trimmed.match(/\}/g) || []).length;

        // If line has opening brace, extract node name
        if (opens > closes) {
            const nodeMatch = trimmed.match(/^(\w[\w-]*)/);
            if (nodeMatch) {
                for (let i = 0; i < opens - closes; i++) {
                    path.push(nodeMatch[1]);
                }
            } else {
                for (let i = 0; i < opens - closes; i++) {
                    path.push('__anonymous__');
                }
            }
        } else if (closes > opens) {
            for (let i = 0; i < closes - opens; i++) {
                path.pop();
            }
        }
    }

    return path;
}

function detectBindActionBlock(text: string, linePrefix: string, path: string[]): boolean {
    // We are in a bind action block if the path includes 'bind' or if
    // we're inside keybinds > mode > bind
    if (path.length >= 3 && path[0] === 'keybinds') {
        // Check if the last path entry is 'bind' or if we're inside a bind's action block
        if (path.includes('bind')) {
            return true;
        }
    }

    // Also check if the current line has a bind with an opening brace
    const bindPattern = /bind\s+"[^"]*"\s*\{/;
    if (bindPattern.test(linePrefix)) {
        return true;
    }

    // Check if we're on a line inside a bind block by looking at recent context
    const lines = text.split('\n');
    for (let i = lines.length - 1; i >= Math.max(0, lines.length - 20); i--) {
        const l = lines[i].trim();
        if (l.match(/^bind\s/)) {
            return true;
        }
        if (l === '}') {
            break;
        }
    }

    return false;
}

/**
 * Gets the word range at the given position in the document.
 */
export function getWordRangeAtPosition(document: vscode.TextDocument, position: vscode.Position): vscode.Range | undefined {
    return document.getWordRangeAtPosition(position, /[\w-]+/);
}

/**
 * Gets the word at the given position.
 */
export function getWordAtPosition(document: vscode.TextDocument, position: vscode.Position): string {
    const range = getWordRangeAtPosition(document, position);
    return range ? document.getText(range) : '';
}

/**
 * Checks if a line contains only whitespace and possibly the start of a word (for completion).
 */
export function isCompletionPosition(linePrefix: string): boolean {
    return /^\s*\w*$/.test(linePrefix);
}
