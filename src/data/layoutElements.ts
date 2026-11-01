export interface LayoutElement {
    name: string;
    description: string;
    attributes: LayoutAttribute[];
    children?: string[];
    docUrl: string;
}

export interface LayoutAttribute {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum' | 'percentage';
    description: string;
    values?: string[];
    example: string;
}

const DOCS_BASE_URL = 'https://zellij.dev/documentation';

/** Deep link to the layout documentation, highlighting this element. */
function layoutDocUrl(name: string): string {
    return `${DOCS_BASE_URL}/layouts.html?highlight=${name}#layout-configuration-language`;
}

export const layoutElements: LayoutElement[] = [
    {
        name: 'layout',
        description: 'Root node of a Zellij layout file. Contains pane definitions, tab templates, and swap layouts.',
        attributes: [],
        children: ['pane', 'tab', 'pane_template', 'tab_template', 'default_tab_template', 'swap_tiled_layout', 'swap_floating_layout', 'floating_panes'],
        docUrl: layoutDocUrl('layout'),
    },
    {
        name: 'pane',
        description: 'Defines a terminal pane in the layout. Can be nested to create split layouts.',
        attributes: [
            {
                name: 'split_direction',
                type: 'enum',
                description: 'Direction to split child panes.',
                values: ['vertical', 'horizontal'],
                example: 'pane split_direction="vertical" { ... }',
            },
            {
                name: 'size',
                type: 'string',
                description: 'Fixed size (number of rows/columns) or percentage (e.g., "50%").',
                example: 'pane size=1',
            },
            {
                name: 'borderless',
                type: 'boolean',
                description: 'Whether to hide the pane border.',
                values: ['true', 'false'],
                example: 'pane borderless=true',
            },
            {
                name: 'focus',
                type: 'boolean',
                description: 'Whether this pane should be focused when the layout is loaded.',
                values: ['true', 'false'],
                example: 'pane focus=true',
            },
            {
                name: 'name',
                type: 'string',
                description: 'A custom name for the pane, shown in the pane frame.',
                example: 'pane name="editor"',
            },
            {
                name: 'cwd',
                type: 'string',
                description: 'The working directory for commands run in this pane.',
                example: 'pane cwd="/home/user/project"',
            },
            {
                name: 'command',
                type: 'string',
                description: 'A command to run in this pane instead of the default shell.',
                example: 'pane command="htop"',
            },
            {
                name: 'close_on_exit',
                type: 'boolean',
                description: 'Whether to close the pane when the command exits.',
                values: ['true', 'false'],
                example: 'pane close_on_exit=true',
            },
            {
                name: 'start_suspended',
                type: 'boolean',
                description: 'Whether to start the pane with the command suspended (press Enter to run).',
                values: ['true', 'false'],
                example: 'pane start_suspended=true',
            },
            {
                name: 'floating',
                type: 'boolean',
                description: 'Whether this pane is a floating pane.',
                values: ['true', 'false'],
                example: 'pane floating=true',
            },
            {
                name: 'stacked',
                type: 'boolean',
                description: 'Whether child panes should be stacked (overlapping, showing one at a time).',
                values: ['true', 'false'],
                example: 'pane stacked=true { ... }',
            },
        ],
        children: ['pane', 'plugin', 'args'],
        docUrl: layoutDocUrl('pane'),
    },
    {
        name: 'tab',
        description: 'Defines a tab in the layout. Each tab can contain its own pane arrangement.',
        attributes: [
            {
                name: 'name',
                type: 'string',
                description: 'The name shown in the tab bar.',
                example: 'tab name="main"',
            },
            {
                name: 'focus',
                type: 'boolean',
                description: 'Whether this tab should be focused when the layout is loaded.',
                values: ['true', 'false'],
                example: 'tab focus=true',
            },
            {
                name: 'cwd',
                type: 'string',
                description: 'Default working directory for all panes in this tab.',
                example: 'tab cwd="/home/user"',
            },
            {
                name: 'hide_floating_panes',
                type: 'boolean',
                description: 'Whether to hide floating panes when switching to this tab.',
                values: ['true', 'false'],
                example: 'tab hide_floating_panes=true',
            },
        ],
        children: ['pane', 'floating_panes'],
        docUrl: layoutDocUrl('tab'),
    },
    {
        name: 'pane_template',
        description: 'Defines a reusable pane template. Can be referenced by name in other parts of the layout.',
        attributes: [
            {
                name: 'name',
                type: 'string',
                description: 'The name of this template, used to reference it.',
                example: 'pane_template name="editor-pane"',
            },
            {
                name: 'split_direction',
                type: 'enum',
                description: 'Direction to split child panes.',
                values: ['vertical', 'horizontal'],
                example: 'pane_template split_direction="vertical"',
            },
            {
                name: 'command',
                type: 'string',
                description: 'Command to run in panes created from this template.',
                example: 'pane_template command="vim"',
            },
            {
                name: 'cwd',
                type: 'string',
                description: 'Working directory for panes created from this template.',
                example: 'pane_template cwd="/src"',
            },
        ],
        children: ['pane', 'children', 'plugin'],
        docUrl: layoutDocUrl('pane_template'),
    },
    {
        name: 'tab_template',
        description: 'Defines a reusable tab template with predefined pane arrangements.',
        attributes: [
            {
                name: 'name',
                type: 'string',
                description: 'The name of this tab template.',
                example: 'tab_template name="dev-tab"',
            },
        ],
        children: ['pane', 'children', 'floating_panes'],
        docUrl: layoutDocUrl('tab_template'),
    },
    {
        name: 'default_tab_template',
        description: 'Defines the default template for new tabs. Applied to all tabs that do not use a specific template.',
        attributes: [],
        children: ['pane', 'children', 'floating_panes'],
        docUrl: layoutDocUrl('default_tab_template'),
    },
    {
        name: 'swap_tiled_layout',
        description: 'Defines a swap layout for tiled panes. Users can cycle through swap layouts to rearrange panes.',
        attributes: [
            {
                name: 'name',
                type: 'string',
                description: 'Name of this swap layout.',
                example: 'swap_tiled_layout name="stacked"',
            },
        ],
        children: ['tab'],
        docUrl: layoutDocUrl('swap_tiled_layout'),
    },
    {
        name: 'swap_floating_layout',
        description: 'Defines a swap layout for floating panes.',
        attributes: [
            {
                name: 'name',
                type: 'string',
                description: 'Name of this swap layout.',
                example: 'swap_floating_layout name="spread"',
            },
        ],
        children: ['floating_panes'],
        docUrl: layoutDocUrl('swap_floating_layout'),
    },
    {
        name: 'plugin',
        description: 'Loads a Zellij plugin inside a pane.',
        attributes: [
            {
                name: 'location',
                type: 'string',
                description: 'Plugin URL or built-in plugin name (e.g., "zellij:tab-bar").',
                example: 'plugin location="zellij:tab-bar"',
            },
        ],
        children: [],
        docUrl: layoutDocUrl('plugin'),
    },
    {
        name: 'children',
        description: 'Placeholder node in templates. Replaced with actual content when the template is used.',
        attributes: [],
        children: [],
        docUrl: layoutDocUrl('children'),
    },
    {
        name: 'floating_panes',
        description: 'Container for floating pane definitions within a tab or layout.',
        attributes: [],
        children: ['pane'],
        docUrl: layoutDocUrl('floating_panes'),
    },
    {
        name: 'args',
        description: 'Arguments to pass to the command in a pane.',
        attributes: [],
        children: [],
        docUrl: layoutDocUrl('args'),
    },
];

export function getLayoutElementByName(name: string): LayoutElement | undefined {
    return layoutElements.find(e => e.name === name);
}

export function getAllLayoutElementNames(): string[] {
    return layoutElements.map(e => e.name);
}

export function getAttributesForElement(elementName: string): LayoutAttribute[] {
    const element = getLayoutElementByName(elementName);
    return element?.attributes || [];
}
