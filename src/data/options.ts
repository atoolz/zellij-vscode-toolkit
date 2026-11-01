export interface ConfigOption {
    name: string;
    type: 'boolean' | 'string' | 'number' | 'enum' | 'path';
    description: string;
    values?: string[];
    default?: string;
    example: string;
    docUrl: string;
    parent?: string;
}

const DOCS_BASE_URL = 'https://zellij.dev/documentation';

/**
 * A few options are documented under a different anchor than their KDL name
 * (the docs site tracks a newer Zellij version than 0.45.1).
 */
const OPTION_ANCHOR_ALIASES: Record<string, string> = {
    default_mode: 'default_mode-locked',
    serialize_pane_viewport: 'pane_viewport_serialization',
    enforce_https_for_localhost: 'enforce_https_on_localhost',
};

/** Options that are not documented on the options page at all. */
const OPTIONS_WITHOUT_ANCHOR = new Set(['client_async_worker_tasks']);

/** Deep link to an option on https://zellij.dev/documentation/options.html */
export function optionDocUrl(name: string): string {
    if (OPTIONS_WITHOUT_ANCHOR.has(name)) {
        return `${DOCS_BASE_URL}/options.html?highlight=${name}`;
    }
    const anchor = OPTION_ANCHOR_ALIASES[name] ?? name;
    return `${DOCS_BASE_URL}/options.html?highlight=${name}#${anchor}`;
}

/** Deep link to a named style / theme key on https://zellij.dev/documentation/themes.html */
export function themeDocUrl(name?: string, hasAnchor = true): string {
    const page = `${DOCS_BASE_URL}/themes.html`;
    if (!name) {
        return `${page}#theme-definition-specification`;
    }
    if (!hasAnchor) {
        return `${page}?highlight=${name}#theme-definition-specification`;
    }
    return `${page}?highlight=${name}#${name}`;
}

/** Deep link to a layout element on https://zellij.dev/documentation/layouts.html */
export function layoutDocUrl(name: string): string {
    return `${DOCS_BASE_URL}/layouts.html?highlight=${name}#layout-configuration-language`;
}

export const configOptions: ConfigOption[] = [
    {
        name: 'simplified_ui',
        type: 'boolean',
        description: 'Removes the arrow fonts from the UI and uses ASCII characters instead. Useful for terminals that do not support arrow fonts.',
        values: ['true', 'false'],
        default: 'false',
        example: 'simplified_ui true',
        docUrl: optionDocUrl('simplified_ui'),
    },
    {
        name: 'default_shell',
        type: 'path',
        description: 'Sets the default shell to use in new panes. If not set, uses the system default shell.',
        example: 'default_shell "fish"',
        docUrl: optionDocUrl('default_shell'),
    },
    {
        name: 'default_cwd',
        type: 'path',
        description: 'Sets the default working directory for new panes. All panes will open in this directory unless overridden.',
        example: 'default_cwd "/home/user/projects"',
        docUrl: optionDocUrl('default_cwd'),
    },
    {
        name: 'default_layout',
        type: 'string',
        description: 'Sets the default layout to use when starting a new session. Can be a layout name or a path to a layout file.',
        default: '"default"',
        example: 'default_layout "compact"',
        docUrl: optionDocUrl('default_layout'),
    },
    {
        name: 'default_mode',
        type: 'enum',
        description: 'Sets the mode Zellij starts in. Useful if you want Zellij to start in locked mode.',
        values: ['normal', 'locked', 'resize', 'pane', 'tab', 'scroll', 'entersearch', 'search', 'renametab', 'renamepane', 'session', 'move', 'prompt', 'tmux'],
        default: '"normal"',
        example: 'default_mode "locked"',
        docUrl: optionDocUrl('default_mode'),
    },
    {
        name: 'mouse_mode',
        type: 'boolean',
        description: 'Enables or disables mouse support. When enabled, you can use the mouse to select panes, scroll, and resize.',
        values: ['true', 'false'],
        default: 'true',
        example: 'mouse_mode true',
        docUrl: optionDocUrl('mouse_mode'),
    },
    {
        name: 'scroll_buffer_size',
        type: 'number',
        description: 'Sets the maximum number of lines to keep in the scroll buffer for each pane.',
        default: '10000',
        example: 'scroll_buffer_size 50000',
        docUrl: optionDocUrl('scroll_buffer_size'),
    },
    {
        name: 'copy_command',
        type: 'string',
        description: 'Sets the command to use for copying text to the clipboard. Useful for systems where clipboard integration is not automatic.',
        example: 'copy_command "xclip -selection clipboard"',
        docUrl: optionDocUrl('copy_command'),
    },
    {
        name: 'copy_clipboard',
        type: 'enum',
        description: 'Sets which clipboard to use for copy operations.',
        values: ['system', 'primary'],
        default: '"system"',
        example: 'copy_clipboard "system"',
        docUrl: optionDocUrl('copy_clipboard'),
    },
    {
        name: 'copy_on_select',
        type: 'boolean',
        description: 'Automatically copies text to clipboard when selected with the mouse.',
        values: ['true', 'false'],
        default: 'true',
        example: 'copy_on_select false',
        docUrl: optionDocUrl('copy_on_select'),
    },
    {
        name: 'scrollback_editor',
        type: 'path',
        description: 'Sets the editor to use when editing the scrollback buffer. The file path will be passed as an argument.',
        example: 'scrollback_editor "/usr/bin/vim"',
        docUrl: optionDocUrl('scrollback_editor'),
    },
    {
        name: 'mirror_session',
        type: 'boolean',
        description: 'When enabled, all sessions will mirror the layout of the first session. Useful for pair programming.',
        values: ['true', 'false'],
        default: 'false',
        example: 'mirror_session true',
        docUrl: optionDocUrl('mirror_session'),
    },
    {
        name: 'on_force_close',
        type: 'enum',
        description: 'Sets the behavior when Zellij receives a force close signal (e.g., terminal is closed).',
        values: ['quit', 'detach'],
        default: '"detach"',
        example: 'on_force_close "quit"',
        docUrl: optionDocUrl('on_force_close'),
    },
    {
        name: 'pane_frames',
        type: 'boolean',
        description: 'Enables or disables pane frames (borders around each pane).',
        values: ['true', 'false'],
        default: 'true',
        example: 'pane_frames false',
        docUrl: optionDocUrl('pane_frames'),
    },
    {
        name: 'auto_layout',
        type: 'boolean',
        description: 'When enabled, Zellij will automatically adjust the layout when panes are added or removed.',
        values: ['true', 'false'],
        default: 'true',
        example: 'auto_layout true',
        docUrl: optionDocUrl('auto_layout'),
    },
    {
        name: 'session_serialization',
        type: 'boolean',
        description: 'Enables or disables session serialization. When enabled, sessions are saved to disk and can be restored.',
        values: ['true', 'false'],
        default: 'true',
        example: 'session_serialization true',
        docUrl: optionDocUrl('session_serialization'),
    },
    {
        name: 'serialize_pane_viewport',
        type: 'boolean',
        description: 'When enabled, the visible viewport of each pane is also serialized with the session.',
        values: ['true', 'false'],
        default: 'false',
        example: 'serialize_pane_viewport true',
        docUrl: optionDocUrl('serialize_pane_viewport'),
    },
    {
        name: 'scrollback_lines_to_serialize',
        type: 'number',
        description: 'Sets the number of scrollback lines to serialize per pane. 0 means all lines are serialized.',
        default: '10000',
        example: 'scrollback_lines_to_serialize 5000',
        docUrl: optionDocUrl('scrollback_lines_to_serialize'),
    },
    {
        name: 'theme',
        type: 'string',
        description: 'Sets the color theme to use. Must match a theme name defined in the themes block or a built-in theme.',
        example: 'theme "dracula"',
        docUrl: optionDocUrl('theme'),
    },
    {
        name: 'styled_underlines',
        type: 'boolean',
        description: 'Enables styled (curly) underlines. Requires terminal support. Disable if underlines look wrong.',
        values: ['true', 'false'],
        default: 'true',
        example: 'styled_underlines false',
        docUrl: optionDocUrl('styled_underlines'),
    },
    {
        name: 'serialization_interval',
        type: 'number',
        description: 'Sets the interval in seconds between automatic session serializations.',
        default: '60',
        example: 'serialization_interval 300',
        docUrl: optionDocUrl('serialization_interval'),
    },
    {
        name: 'disable_session_metadata',
        type: 'boolean',
        description: 'Disables writing session metadata to disk. This can improve performance but disables session restore.',
        values: ['true', 'false'],
        default: 'false',
        example: 'disable_session_metadata true',
        docUrl: optionDocUrl('disable_session_metadata'),
    },
    {
        name: 'support_kitty_keyboard_protocol',
        type: 'boolean',
        description: 'Enables support for the Kitty keyboard protocol, allowing more key combinations to be captured.',
        values: ['true', 'false'],
        default: 'false',
        example: 'support_kitty_keyboard_protocol true',
        docUrl: optionDocUrl('support_kitty_keyboard_protocol'),
    },
    {
        name: 'theme_dark',
        type: 'string',
        description: 'Theme to use when the host terminal reports a dark color palette. Requires `theme_light` to also be set; otherwise `theme` is used.',
        example: 'theme_dark "dracula"',
        docUrl: optionDocUrl('theme_dark'),
    },
    {
        name: 'theme_light',
        type: 'string',
        description: 'Theme to use when the host terminal reports a light color palette. Requires `theme_dark` to also be set; otherwise `theme` is used.',
        example: 'theme_light "dayfox"',
        docUrl: optionDocUrl('theme_light'),
    },
    {
        name: 'explicit_theme_hue',
        type: 'enum',
        description: 'Pin the session to a dark or light appearance, ignoring what the host terminal reports. When unset, the host terminal decides.',
        values: ['dark', 'light'],
        example: 'explicit_theme_hue "dark"',
        docUrl: optionDocUrl('explicit_theme_hue'),
    },
    {
        name: 'layout_dir',
        type: 'path',
        description: 'The folder in which Zellij will look for layouts. Requires restart.',
        example: 'layout_dir "~/my-layouts"',
        docUrl: optionDocUrl('layout_dir'),
    },
    {
        name: 'theme_dir',
        type: 'path',
        description: 'The folder in which Zellij will look for themes. Requires restart.',
        example: 'theme_dir "~/my-themes"',
        docUrl: optionDocUrl('theme_dir'),
    },
    {
        name: 'pane_frame_style',
        type: 'enum',
        description: 'Set the pane frame style when pane_frames is enabled.',
        values: ['full', 'titles', 'none'],
        default: '"titles"',
        example: 'pane_frame_style "full"',
        docUrl: optionDocUrl('pane_frame_style'),
    },
    {
        name: 'osc8_hyperlinks',
        type: 'boolean',
        description: 'Enable OSC8 hyperlink output.',
        values: ['true', 'false'],
        default: 'true',
        example: 'osc8_hyperlinks true',
        docUrl: optionDocUrl('osc8_hyperlinks'),
    },
    {
        name: 'session_name',
        type: 'string',
        description: 'A fixed name to always give the Zellij session. Consider also setting `attach_to_session true`, otherwise this will error if such a session exists.',
        example: 'session_name "main"',
        docUrl: optionDocUrl('session_name'),
    },
    {
        name: 'attach_to_session',
        type: 'boolean',
        description: 'When `session_name` is provided, attaches to that session if it is already running or creates it otherwise.',
        values: ['true', 'false'],
        default: 'false',
        example: 'attach_to_session true',
        docUrl: optionDocUrl('attach_to_session'),
    },
    {
        name: 'stacked_resize',
        type: 'boolean',
        description: 'Whether to stack panes when resizing beyond a certain size.',
        values: ['true', 'false'],
        default: 'true',
        example: 'stacked_resize true',
        docUrl: optionDocUrl('stacked_resize'),
    },
    {
        name: 'stacked_pane_list',
        type: 'boolean',
        description: 'Whether stacked panes display as a list with the expanded pane pinned to the bottom.',
        values: ['true', 'false'],
        default: 'true',
        example: 'stacked_pane_list true',
        docUrl: optionDocUrl('stacked_pane_list'),
    },
    {
        name: 'show_startup_tips',
        type: 'boolean',
        description: 'Whether to show tips on startup.',
        values: ['true', 'false'],
        default: 'true',
        example: 'show_startup_tips false',
        docUrl: optionDocUrl('show_startup_tips'),
    },
    {
        name: 'show_release_notes',
        type: 'boolean',
        description: 'Whether to show release notes on first version run.',
        values: ['true', 'false'],
        default: 'true',
        example: 'show_release_notes false',
        docUrl: optionDocUrl('show_release_notes'),
    },
    {
        name: 'advanced_mouse_actions',
        type: 'boolean',
        description: 'Whether to enable mouse hover effects and pane grouping functionality.',
        values: ['true', 'false'],
        default: 'true',
        example: 'advanced_mouse_actions false',
        docUrl: optionDocUrl('advanced_mouse_actions'),
    },
    {
        name: 'mouse_scroll_resize',
        type: 'boolean',
        description: 'Whether Ctrl+ScrollWheel resizes panes.',
        values: ['true', 'false'],
        default: 'true',
        example: 'mouse_scroll_resize false',
        docUrl: optionDocUrl('mouse_scroll_resize'),
    },
    {
        name: 'scroll_mode_sync',
        type: 'boolean',
        description: 'Whether scrolling a pane implicitly enters and exits Scroll mode.',
        values: ['true', 'false'],
        default: 'true',
        example: 'scroll_mode_sync false',
        docUrl: optionDocUrl('scroll_mode_sync'),
    },
    {
        name: 'mouse_hover_effects',
        type: 'boolean',
        description: 'Whether to enable mouse hover visual effects (frame highlight and help text).',
        values: ['true', 'false'],
        default: 'true',
        example: 'mouse_hover_effects false',
        docUrl: optionDocUrl('mouse_hover_effects'),
    },
    {
        name: 'mouse_hover_tips',
        type: 'boolean',
        description: 'Whether to show mouse hover help-text tips (resize help and group shortcuts).',
        values: ['true', 'false'],
        default: 'true',
        example: 'mouse_hover_tips false',
        docUrl: optionDocUrl('mouse_hover_tips'),
    },
    {
        name: 'visual_bell',
        type: 'boolean',
        description: 'Whether to show visual bell indicators (pane/tab frame flash and [!] suffix).',
        values: ['true', 'false'],
        default: 'true',
        example: 'visual_bell false',
        docUrl: optionDocUrl('visual_bell'),
    },
    {
        name: 'focus_follows_mouse',
        type: 'boolean',
        description: 'Whether to focus panes on mouse hover.',
        values: ['true', 'false'],
        default: 'false',
        example: 'focus_follows_mouse true',
        docUrl: optionDocUrl('focus_follows_mouse'),
    },
    {
        name: 'mouse_click_through',
        type: 'boolean',
        description: 'Whether clicking a pane to focus it also sends the click into the pane.',
        values: ['true', 'false'],
        default: 'false',
        example: 'mouse_click_through true',
        docUrl: optionDocUrl('mouse_click_through'),
    },
    {
        name: 'osc133_command_selection',
        type: 'boolean',
        description: 'Whether triple-clicking inside command output marked by the shell (OSC 133) selects the command and its output instead of the logical line.',
        values: ['true', 'false'],
        default: 'true',
        example: 'osc133_command_selection false',
        docUrl: optionDocUrl('osc133_command_selection'),
    },
    {
        name: 'word_separators',
        type: 'string',
        description: 'Characters that terminate a word when double-clicking to select it. Whitespace is always a separator and need not be listed here.',
        default: '"[]{}<>()"',
        example: 'word_separators "[]{}<>()"',
        docUrl: optionDocUrl('word_separators'),
    },
    {
        name: 'host_notification_protocol',
        type: 'enum',
        description: 'Which escape sequence desktop notifications coming from panes are forwarded to the host terminal with.',
        values: ['auto', 'osc9', 'osc99', 'bell', 'off'],
        default: '"auto"',
        example: 'host_notification_protocol "osc99"',
        docUrl: optionDocUrl('host_notification_protocol'),
    },
    {
        name: 'nested_session_handling',
        type: 'enum',
        description: 'How to handle a nested Zellij session detected inside a pane.',
        values: ['ask', 'fullscreen', 'descend', 'never'],
        default: '"ask"',
        example: 'nested_session_handling "descend"',
        docUrl: optionDocUrl('nested_session_handling'),
    },
    {
        name: 'support_kitty_graphics_protocol',
        type: 'boolean',
        description: 'Enable or disable support for the Kitty Graphics Protocol, used to display images (the host terminal must also support it). Requires restart.',
        values: ['true', 'false'],
        example: 'support_kitty_graphics_protocol true',
        docUrl: optionDocUrl('support_kitty_graphics_protocol'),
    },
    {
        name: 'web_server',
        type: 'boolean',
        description: 'Whether to make sure a local web server is running when a new Zellij session starts. Requires restart.',
        values: ['true', 'false'],
        default: 'false',
        example: 'web_server true',
        docUrl: optionDocUrl('web_server'),
    },
    {
        name: 'web_sharing',
        type: 'enum',
        description: 'Whether to allow sessions started in the terminal to be shared through a local web server, assuming one is running. Requires restart.',
        values: ['on', 'off', 'disabled'],
        default: '"off"',
        example: 'web_sharing "on"',
        docUrl: optionDocUrl('web_sharing'),
    },
    {
        name: 'web_server_ip',
        type: 'string',
        description: 'The IP address the web server should listen on when it starts. Requires restart.',
        default: '"127.0.0.1"',
        example: 'web_server_ip "127.0.0.1"',
        docUrl: optionDocUrl('web_server_ip'),
    },
    {
        name: 'web_server_port',
        type: 'number',
        description: 'The port the web server should listen on when it starts. Requires restart.',
        default: '8082',
        example: 'web_server_port 8082',
        docUrl: optionDocUrl('web_server_port'),
    },
    {
        name: 'web_server_cert',
        type: 'path',
        description: 'A path to a certificate file used when serving the web client over HTTPS.',
        example: 'web_server_cert "/path/to/cert.pem"',
        docUrl: optionDocUrl('web_server_cert'),
    },
    {
        name: 'web_server_key',
        type: 'path',
        description: 'A path to a key file used when serving the web client over HTTPS.',
        example: 'web_server_key "/path/to/key.pem"',
        docUrl: optionDocUrl('web_server_key'),
    },
    {
        name: 'enforce_https_for_localhost',
        type: 'boolean',
        description: 'Whether to enforce HTTPS connections to the web server when it is bound to localhost. HTTPS is always enforced on non-local interfaces.',
        values: ['true', 'false'],
        default: 'false',
        example: 'enforce_https_for_localhost true',
        docUrl: optionDocUrl('enforce_https_for_localhost'),
    },
    {
        name: 'post_command_discovery_hook',
        type: 'string',
        description: 'A command to run after Zellij discovers a command inside a pane when resurrecting sessions. Its stdout is used instead of RESURRECT_COMMAND.',
        example: 'post_command_discovery_hook "sed \'s/^sudo //\'"',
        docUrl: optionDocUrl('post_command_discovery_hook'),
    },
    {
        name: 'client_async_worker_tasks',
        type: 'number',
        description: 'Number of async worker tasks to spawn per active client. Set to 0 to use the number of physical CPU cores. Currently only applies to web clients.',
        default: '0',
        example: 'client_async_worker_tasks 4',
        docUrl: optionDocUrl('client_async_worker_tasks'),
    },
    {
        name: 'dangerously_enable_paste_buffer_read',
        type: 'boolean',
        description: 'Let programs inside panes read the paste buffer (clipboard) with the OSC 52 escape sequence. Any program in any pane, including over SSH, can then read your clipboard without asking.',
        values: ['true', 'false'],
        default: 'false',
        example: 'dangerously_enable_paste_buffer_read false',
        docUrl: optionDocUrl('dangerously_enable_paste_buffer_read'),
    },
];

export const uiOptions: ConfigOption[] = [
    {
        name: 'rounded_corners',
        type: 'boolean',
        description: 'Enables rounded corners for pane frames.',
        values: ['true', 'false'],
        default: 'false',
        example: 'rounded_corners true',
        docUrl: optionDocUrl('rounded_corners'),
        parent: 'ui.pane_frames',
    },
    {
        name: 'hide_session_name',
        type: 'boolean',
        description: 'Hides the session name from the status bar.',
        values: ['true', 'false'],
        default: 'false',
        example: 'hide_session_name true',
        docUrl: optionDocUrl('hide_session_name'),
        parent: 'ui.pane_frames',
    },
];

/** Legacy flat palette theme keys (still supported by Zellij). */
export const themeColors = [
    { name: 'fg', description: 'Foreground color' },
    { name: 'bg', description: 'Background color' },
    { name: 'black', description: 'Black color (ANSI 0)' },
    { name: 'red', description: 'Red color (ANSI 1)' },
    { name: 'green', description: 'Green color (ANSI 2)' },
    { name: 'yellow', description: 'Yellow color (ANSI 3)' },
    { name: 'blue', description: 'Blue color (ANSI 4)' },
    { name: 'magenta', description: 'Magenta color (ANSI 5)' },
    { name: 'cyan', description: 'Cyan color (ANSI 6)' },
    { name: 'white', description: 'White color (ANSI 7)' },
    { name: 'orange', description: 'Orange color (used by Zellij UI)' },
];

/** Named style blocks used by current Zellij themes (0.43+). */
export const themeStyleKeys = [
    { name: 'text_unselected', description: 'Style for unselected text (e.g. text in unfocused panes)' },
    { name: 'text_selected', description: 'Style for selected text (e.g. text in the focused pane)' },
    { name: 'ribbon_unselected', description: 'Style for unselected ribbons (inactive tabs / tab-bar entries)' },
    { name: 'ribbon_selected', description: 'Style for the selected ribbon (active tab / tab-bar entry)' },
    { name: 'table_title', description: 'Style for table titles (e.g. the session name, list headers)' },
    { name: 'table_cell_unselected', description: 'Style for unselected table cells' },
    { name: 'table_cell_selected', description: 'Style for selected table cells' },
    { name: 'list_unselected', description: 'Style for unselected list entries' },
    { name: 'list_selected', description: 'Style for the selected list entry' },
    { name: 'frame_unselected', description: 'Style for unselected pane frames' },
    { name: 'frame_selected', description: 'Style for the focused pane frame' },
    { name: 'frame_highlight', description: 'Style for highlighted pane frames' },
    { name: 'exit_code_success', description: 'Color used to indicate a successful exit code' },
    { name: 'exit_code_error', description: 'Color used to indicate a failed exit code' },
    { name: 'multiplayer_user_colors', description: 'Colors assigned to users in multiplayer sessions (player_1 .. player_10)' },
];

/** Keys valid inside a named style block. */
export const styleDeclarationKeys = [
    { name: 'base', description: 'Base text color' },
    { name: 'background', description: 'Background color' },
    { name: 'emphasis_0', description: 'Emphasis color 0' },
    { name: 'emphasis_1', description: 'Emphasis color 1' },
    { name: 'emphasis_2', description: 'Emphasis color 2' },
    { name: 'emphasis_3', description: 'Emphasis color 3' },
];

/** Keys valid inside multiplayer_user_colors. */
export const multiplayerColorKeys = Array.from({ length: 10 }, (_, i) => `player_${i + 1}`);

export const topLevelBlocks = [
    { name: 'keybinds', description: 'Define keybindings for all modes. Contains mode blocks with bind statements.' },
    { name: 'themes', description: 'Define color themes. Each child node is a theme name containing color definitions.' },
    { name: 'plugins', description: 'Define plugin aliases. Each child is a plugin name with a location attribute.' },
    { name: 'load_plugins', description: 'Plugins to load at startup.' },
    { name: 'ui', description: 'UI-specific configuration options like pane frame styling.' },
    { name: 'env', description: 'Environment variables to set for all panes.' },
];

export function getOptionByName(name: string): ConfigOption | undefined {
    return configOptions.find(o => o.name === name) || uiOptions.find(o => o.name === name);
}

export function getAllOptionNames(): string[] {
    return configOptions.map(o => o.name);
}
