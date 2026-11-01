export interface ZellijAction {
    name: string;
    description: string;
    parameters?: ActionParameter[];
    example: string;
    docUrl: string;
}

export interface ActionParameter {
    name: string;
    type: 'string' | 'number' | 'direction' | 'mode' | 'search_option' | 'bytes';
    values?: string[];
    description: string;
}

const DOCS_BASE_URL = 'https://zellij.dev/documentation';

/** Deep link to the keybindings documentation, highlighting this action. */
function actionDocUrl(name: string): string {
    return `${DOCS_BASE_URL}/keybindings.html?highlight=${name}#configuring-keybindings`;
}

export const actions: ZellijAction[] = [
    {
        name: 'Quit',
        description: 'Quits Zellij immediately.',
        example: 'bind "Ctrl q" { Quit; }',
        docUrl: actionDocUrl('Quit'),
    },
    {
        name: 'Detach',
        description: 'Detaches from the current Zellij session, leaving it running in the background.',
        example: 'bind "Ctrl d" { Detach; }',
        docUrl: actionDocUrl('Detach'),
    },
    {
        name: 'SwitchToMode',
        description: 'Switches Zellij to the specified input mode.',
        parameters: [
            {
                name: 'mode',
                type: 'mode',
                values: ['Normal', 'Locked', 'Resize', 'Pane', 'Tab', 'Scroll', 'EnterSearch', 'Search', 'RenameTab', 'RenamePane', 'Session', 'Move', 'Prompt', 'Tmux'],
                description: 'The mode to switch to',
            },
        ],
        example: 'bind "Ctrl g" { SwitchToMode "locked"; }',
        docUrl: actionDocUrl('SwitchToMode'),
    },
    {
        name: 'NewPane',
        description: 'Opens a new pane in the specified direction. If no direction is given, uses the current auto-layout algorithm.',
        parameters: [
            {
                name: 'direction',
                type: 'direction',
                values: ['Down', 'Right'],
                description: 'Direction to open the new pane',
            },
        ],
        example: 'bind "Alt n" { NewPane; }',
        docUrl: actionDocUrl('NewPane'),
    },
    {
        name: 'NewFloatingPane',
        description: 'Opens a new floating pane.',
        example: 'bind "Alt f" { NewFloatingPane; }',
        docUrl: actionDocUrl('NewFloatingPane'),
    },
    {
        name: 'NewTiledPane',
        description: 'Opens a new tiled pane.',
        example: 'bind "Alt t" { NewTiledPane; }',
        docUrl: actionDocUrl('NewTiledPane'),
    },
    {
        name: 'NewTab',
        description: 'Opens a new tab. Optionally specify a layout and name.',
        example: 'bind "Alt t" { NewTab; }',
        docUrl: actionDocUrl('NewTab'),
    },
    {
        name: 'GoToNextTab',
        description: 'Switches to the next tab.',
        example: 'bind "Alt l" { GoToNextTab; }',
        docUrl: actionDocUrl('GoToNextTab'),
    },
    {
        name: 'GoToPreviousTab',
        description: 'Switches to the previous tab.',
        example: 'bind "Alt h" { GoToPreviousTab; }',
        docUrl: actionDocUrl('GoToPreviousTab'),
    },
    {
        name: 'GoToTab',
        description: 'Switches to the tab at the given index (1-based).',
        parameters: [
            {
                name: 'index',
                type: 'number',
                description: 'Tab index (1-based)',
            },
        ],
        example: 'bind "Alt 1" { GoToTab 1; }',
        docUrl: actionDocUrl('GoToTab'),
    },
    {
        name: 'GoToTabName',
        description: 'Switches to the tab with the given name.',
        parameters: [
            {
                name: 'name',
                type: 'string',
                description: 'Tab name to switch to',
            },
        ],
        example: 'bind "Alt e" { GoToTabName "editor"; }',
        docUrl: actionDocUrl('GoToTabName'),
    },
    {
        name: 'MoveFocus',
        description: 'Moves focus to the pane in the specified direction.',
        parameters: [
            {
                name: 'direction',
                type: 'direction',
                values: ['Left', 'Right', 'Up', 'Down'],
                description: 'Direction to move focus',
            },
        ],
        example: 'bind "Alt Left" { MoveFocus "Left"; }',
        docUrl: actionDocUrl('MoveFocus'),
    },
    {
        name: 'MovePane',
        description: 'Moves the current pane in the specified direction.',
        parameters: [
            {
                name: 'direction',
                type: 'direction',
                values: ['Left', 'Right', 'Up', 'Down'],
                description: 'Direction to move the pane',
            },
        ],
        example: 'bind "Alt Shift Left" { MovePane "Left"; }',
        docUrl: actionDocUrl('MovePane'),
    },
    {
        name: 'MoveTab',
        description: 'Moves the current tab in the specified direction.',
        parameters: [
            {
                name: 'direction',
                type: 'direction',
                values: ['Left', 'Right'],
                description: 'Direction to move the tab',
            },
        ],
        example: 'bind "Alt Shift Left" { MoveTab "Left"; }',
        docUrl: actionDocUrl('MoveTab'),
    },
    {
        name: 'Resize',
        description: 'Resizes the current pane in the specified direction.',
        parameters: [
            {
                name: 'direction',
                type: 'direction',
                values: ['Increase', 'Decrease', 'Left', 'Right', 'Up', 'Down'],
                description: 'Resize direction',
            },
        ],
        example: 'bind "Alt =" { Resize "Increase"; }',
        docUrl: actionDocUrl('Resize'),
    },
    {
        name: 'FocusNextPane',
        description: 'Moves focus to the next pane in the layout.',
        example: 'bind "Alt n" { FocusNextPane; }',
        docUrl: actionDocUrl('FocusNextPane'),
    },
    {
        name: 'FocusPreviousPane',
        description: 'Moves focus to the previous pane in the layout.',
        example: 'bind "Alt p" { FocusPreviousPane; }',
        docUrl: actionDocUrl('FocusPreviousPane'),
    },
    {
        name: 'ToggleFloatingPanes',
        description: 'Shows or hides all floating panes.',
        example: 'bind "Alt f" { ToggleFloatingPanes; }',
        docUrl: actionDocUrl('ToggleFloatingPanes'),
    },
    {
        name: 'TogglePaneEmbedOrFloating',
        description: 'Toggles the current pane between embedded and floating.',
        example: 'bind "Alt e" { TogglePaneEmbedOrFloating; }',
        docUrl: actionDocUrl('TogglePaneEmbedOrFloating'),
    },
    {
        name: 'ToggleFocusFullscreen',
        description: 'Toggles fullscreen for the currently focused pane.',
        example: 'bind "Alt z" { ToggleFocusFullscreen; }',
        docUrl: actionDocUrl('ToggleFocusFullscreen'),
    },
    {
        name: 'ToggleActiveSyncTab',
        description: 'Toggles input sync for the current tab. When enabled, keyboard input is sent to all panes.',
        example: 'bind "Alt s" { ToggleActiveSyncTab; }',
        docUrl: actionDocUrl('ToggleActiveSyncTab'),
    },
    {
        name: 'ToggleTab',
        description: 'Toggles between the current and the last active tab.',
        example: 'bind "Alt Tab" { ToggleTab; }',
        docUrl: actionDocUrl('ToggleTab'),
    },
    {
        name: 'ScrollUp',
        description: 'Scrolls up one line in the current pane.',
        example: 'bind "Alt Up" { ScrollUp; }',
        docUrl: actionDocUrl('ScrollUp'),
    },
    {
        name: 'ScrollDown',
        description: 'Scrolls down one line in the current pane.',
        example: 'bind "Alt Down" { ScrollDown; }',
        docUrl: actionDocUrl('ScrollDown'),
    },
    {
        name: 'ScrollToTop',
        description: 'Scrolls to the top of the scroll buffer.',
        example: 'bind "Home" { ScrollToTop; }',
        docUrl: actionDocUrl('ScrollToTop'),
    },
    {
        name: 'ScrollToBottom',
        description: 'Scrolls to the bottom of the scroll buffer.',
        example: 'bind "End" { ScrollToBottom; }',
        docUrl: actionDocUrl('ScrollToBottom'),
    },
    {
        name: 'PageScrollUp',
        description: 'Scrolls up one page in the current pane.',
        example: 'bind "PageUp" { PageScrollUp; }',
        docUrl: actionDocUrl('PageScrollUp'),
    },
    {
        name: 'PageScrollDown',
        description: 'Scrolls down one page in the current pane.',
        example: 'bind "PageDown" { PageScrollDown; }',
        docUrl: actionDocUrl('PageScrollDown'),
    },
    {
        name: 'HalfPageScrollUp',
        description: 'Scrolls up half a page in the current pane.',
        example: 'bind "Ctrl u" { HalfPageScrollUp; }',
        docUrl: actionDocUrl('HalfPageScrollUp'),
    },
    {
        name: 'HalfPageScrollDown',
        description: 'Scrolls down half a page in the current pane.',
        example: 'bind "Ctrl d" { HalfPageScrollDown; }',
        docUrl: actionDocUrl('HalfPageScrollDown'),
    },
    {
        name: 'Search',
        description: 'Searches in the specified direction within the scroll buffer.',
        parameters: [
            {
                name: 'direction',
                type: 'string',
                values: ['down', 'up'],
                description: 'Search direction',
            },
        ],
        example: 'bind "n" { Search "down"; }',
        docUrl: actionDocUrl('Search'),
    },
    {
        name: 'SearchToggleOption',
        description: 'Toggles a search option.',
        parameters: [
            {
                name: 'option',
                type: 'search_option',
                values: ['CaseSensitivity', 'Wrap', 'WholeWord'],
                description: 'Search option to toggle',
            },
        ],
        example: 'bind "c" { SearchToggleOption "CaseSensitivity"; }',
        docUrl: actionDocUrl('SearchToggleOption'),
    },
    {
        name: 'EditScrollback',
        description: 'Opens the current pane scrollback in the scrollback editor.',
        example: 'bind "e" { EditScrollback; }',
        docUrl: actionDocUrl('EditScrollback'),
    },
    {
        name: 'CloseFocus',
        description: 'Closes the currently focused pane.',
        example: 'bind "Alt w" { CloseFocus; }',
        docUrl: actionDocUrl('CloseFocus'),
    },
    {
        name: 'CloseTab',
        description: 'Closes the currently focused tab.',
        example: 'bind "Alt q" { CloseTab; }',
        docUrl: actionDocUrl('CloseTab'),
    },
    {
        name: 'UndoRenameTab',
        description: 'Reverts the tab name to the previous value. Used in rename_tab mode.',
        example: 'bind "Esc" { UndoRenameTab; SwitchToMode "tab"; }',
        docUrl: actionDocUrl('UndoRenameTab'),
    },
    {
        name: 'UndoRenamePane',
        description: 'Reverts the pane name to the previous value. Used in rename_pane mode.',
        example: 'bind "Esc" { UndoRenamePane; SwitchToMode "pane"; }',
        docUrl: actionDocUrl('UndoRenamePane'),
    },
    {
        name: 'RenameTab',
        description: 'Renames the currently focused tab.',
        example: 'bind "r" { SwitchToMode "RenameTab"; }',
        docUrl: actionDocUrl('RenameTab'),
    },
    {
        name: 'RenamePane',
        description: 'Renames the currently focused pane.',
        example: 'bind "r" { SwitchToMode "RenamePane"; }',
        docUrl: actionDocUrl('RenamePane'),
    },
    {
        name: 'Write',
        description: 'Writes the specified bytes to the focused pane.',
        parameters: [
            {
                name: 'bytes',
                type: 'bytes',
                description: 'Byte values to write',
            },
        ],
        example: 'bind "Ctrl a" { Write 1; }',
        docUrl: actionDocUrl('Write'),
    },
    {
        name: 'WriteChars',
        description: 'Writes the specified string to the focused pane.',
        parameters: [
            {
                name: 'chars',
                type: 'string',
                description: 'String to write',
            },
        ],
        example: 'bind "Alt c" { WriteChars "ls -la\\n"; }',
        docUrl: actionDocUrl('WriteChars'),
    },
    {
        name: 'DumpScreen',
        description: 'Dumps the current pane screen to the specified file.',
        parameters: [
            {
                name: 'path',
                type: 'string',
                description: 'File path to dump the screen to',
            },
        ],
        example: 'bind "Alt d" { DumpScreen "/tmp/screen-dump.txt"; }',
        docUrl: actionDocUrl('DumpScreen'),
    },
    {
        name: 'DumpLayout',
        description: 'Dumps the current layout to a file.',
        example: 'bind "Alt l" { DumpLayout; }',
        docUrl: actionDocUrl('DumpLayout'),
    },
    {
        name: 'Run',
        description: 'Runs a command in a new pane. Supports additional options like args and cwd.',
        parameters: [
            {
                name: 'command',
                type: 'string',
                description: 'Command to run',
            },
        ],
        example: 'bind "Alt r" { Run "htop"; }',
        docUrl: actionDocUrl('Run'),
    },
    {
        name: 'MessagePlugin',
        description: 'Sends a message to a plugin.',
        parameters: [
            {
                name: 'plugin_name',
                type: 'string',
                description: 'Name or URL of the plugin to message',
            },
        ],
        example: 'bind "Alt m" { MessagePlugin "plugin_name" { name "msg"; payload "data"; }; }',
        docUrl: actionDocUrl('MessagePlugin'),
    },
    {
        name: 'LaunchOrFocusPlugin',
        description: 'Launches a plugin if not running, or focuses it if already running.',
        parameters: [
            {
                name: 'plugin_url',
                type: 'string',
                description: 'Plugin URL to launch',
            },
        ],
        example: 'bind "Alt p" { LaunchOrFocusPlugin "zellij:strider" { floating true; }; }',
        docUrl: actionDocUrl('LaunchOrFocusPlugin'),
    },
    {
        name: 'PreviousSwapLayout',
        description: 'Switches to the previous swap layout.',
        example: 'bind "Alt [" { PreviousSwapLayout; }',
        docUrl: actionDocUrl('PreviousSwapLayout'),
    },
    {
        name: 'NextSwapLayout',
        description: 'Switches to the next swap layout.',
        example: 'bind "Alt ]" { NextSwapLayout; }',
        docUrl: actionDocUrl('NextSwapLayout'),
    },
    {
        name: 'Clear',
        description: 'Clears the current pane.',
        example: 'bind "Alt c" { Clear; }',
        docUrl: actionDocUrl('Clear'),
    },
    {
        name: 'BreakPane',
        description: 'Breaks the current pane out into a new tab.',
        example: 'bind "Alt b" { BreakPane; }',
        docUrl: actionDocUrl('BreakPane'),
    },
    {
        name: 'BreakPaneRight',
        description: 'Breaks the current pane out to a new tab to the right.',
        example: 'bind "Alt b" { BreakPaneRight; }',
        docUrl: actionDocUrl('BreakPaneRight'),
    },
    {
        name: 'BreakPaneLeft',
        description: 'Breaks the current pane out to a new tab to the left.',
        example: 'bind "Alt b" { BreakPaneLeft; }',
        docUrl: actionDocUrl('BreakPaneLeft'),
    },
    {
        name: 'ListClients',
        description: 'Lists all connected clients in the session.',
        example: 'bind "Alt c" { ListClients; }',
        docUrl: actionDocUrl('ListClients'),
    },
];

export function getActionByName(name: string): ZellijAction | undefined {
    return actions.find(a => a.name === name);
}

export function getAllActionNames(): string[] {
    return actions.map(a => a.name);
}
