# Changelog

## [Unreleased]

### Fixed

- Config option list updated to Zellij 0.45.1 (`Options::from_kdl`): 36 missing
  options (`pane_frame_style`, `show_startup_tips`, `show_release_notes`,
  `mouse_hover_tips`, `mouse_hover_effects`, `advanced_mouse_actions`,
  `stacked_pane_list`, `scroll_mode_sync`, `nested_session_handling`,
  `web_server*`, `osc8_hyperlinks`, `osc133_command_selection`, ...) no longer
  reported as "Unknown config option"
- Removed three options that do not exist in Zellij
  (`stacked_pane_resize_algorithm`, `stacked_resize_up_start_count`,
  `stacked_resize_down_start_count`)
- `default_mode` valid values now match `InputMode::from_str`
  (`renametab`, `renamepane`, `entersearch`, `tmux`)
- Theme validation supports the named style format introduced in Zellij 0.43
  (`text_unselected`, `ribbon_selected`, `multiplayer_user_colors`, ...) while
  still accepting legacy flat palette themes. Style blocks are validated for
  `base`/`background`/`emphasis_0..3` and `multiplayer_user_colors` for
  `player_1..player_10`

### Added

- Completions and hover docs for the new options and the named-style theme
  format (RGB triplet / 8-bit / hex palette values)
- Deep documentation links: options link to
  `options.html?highlight=<name>#<name>` (with aliases for the few options
  documented under a different anchor), theme keys to
  `themes.html?highlight=<key>#<key>`, and actions/layout elements highlight
  their entry on the keybindings/layouts pages

### Fixed

- Inside layout files, hovering `pane` / `tab` now shows the layout element
  instead of the same-named input mode (the mode/keybind hover is now limited
  to config files)
- Action and layout-element documentation links pointed at
  `keybindings-actions`, which no longer exists (404); they now target
  `keybindings.html` / `layouts.html`

## [0.1.8] - 2026-03-22

### Fixed

- Brace counting inside strings no longer corrupts diagnostic and color provider state
- Block comment tracking now handles multi-line and mid-line `/* */` correctly
- Action validation no longer produces false positives on PascalCase words inside strings
- Diagnostic ranges now point to the correct column positions
- Stack underflow guard on malformed KDL with extra closing braces
- Regex injection risk in dynamic patterns from node names
- Unhandled promise rejection in auto-detection language switch
- `openExternal` result now provides user feedback on failure
- Removed quotes from bracket matching config (not structural pairs)

### Added

- Error boundaries with stack trace logging on all providers
- Output channel ("Zellij Config") for debugging extension issues
- `provideColorPresentations` error handling

### Improved

- Config auto-detection restricted to known Zellij paths (no longer matches any directory named "zellij")
- Content-based detection limited to first 200 lines for performance
- Layout file detection limited to first 100 lines
- Removed unused variables across providers

## [0.1.0] - 2024-01-01

### Added

- KDL syntax highlighting for Zellij configuration and layout files
- Autocompletion for all config options, actions, modes, layout elements, and plugins
- Hover documentation with descriptions, valid values, examples, and doc links
- Real-time validation and diagnostics for config errors
- Inline color decorators for hex colors in theme definitions
- Snippets for common config patterns (config, keybinds, themes, layouts, plugins)
- Auto-detection of Zellij KDL files based on path, content, and marker comments
- "Zellij: Set as Zellij Config" command for manual language association
- "Zellij: Open Documentation" command
