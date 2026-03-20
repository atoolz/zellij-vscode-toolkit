# Posts de divulgação

## Reddit r/zellij

**Title:** Built the first VS Code extension for Zellij config files - completions, validation, and color preview

**Body:**

Editing Zellij config in KDL without any tooling is painful. You end up going back and forth to the docs to check action names, mode names, and option values. So I built a VS Code extension specifically for Zellij config and layout files.

**What it does:**
- **Completions** for all 26+ config options, 53 actions, 14 modes, layout elements, and built-in plugins
- **Context-aware**: suggests modes inside keybinds, actions inside bind blocks, colors inside themes
- **Hover docs** showing description, valid values, type, and examples
- **Validation** for unknown options, invalid values, unknown modes/actions, and malformed hex colors
- **Color decorators** inline for theme hex values with VS Code's color picker
- **10 snippets** for common patterns (full config, keybinds, themes, layouts)

Auto-detects `config.kdl` in your Zellij config directory. Also works with layout files.

GitHub: https://github.com/atoolz/zellij-vscode-toolkit

Would love feedback on what else would be useful. I'm tracking the KDL v2 migration too.

---

## Reddit r/vscode

**Title:** Zellij Config - first VS Code extension for Zellij terminal config files (completions, validation, color preview)

**Body:**

Zellij (30K+ GitHub stars) uses KDL for configuration but there was zero dedicated editor support. The generic KDL extension only does syntax highlighting.

This extension adds IntelliSense specifically for Zellij:
- Completions for config options, keybind actions, modes, layout elements, plugins
- Context-aware (different suggestions in keybinds vs themes vs layouts)
- Validation for option names, value types, mode names, action names, hex colors
- Inline color decorators for theme definitions
- Auto-detects Zellij config files

GitHub: https://github.com/atoolz/zellij-vscode-toolkit

---

## Reddit r/commandline

**Title:** Made a VS Code extension for Zellij config because editing KDL without tooling is rough

**Body:**

If you use Zellij, you know the config has 53 actions, 14 modes, and dozens of options. KDL is a nice format but without completions or validation, configuring Zellij is trial-and-error.

Built a VS Code extension that gives you completions for everything, catches errors before you launch Zellij, and shows inline color preview for themes.

GitHub: https://github.com/atoolz/zellij-vscode-toolkit

---

## Zellij Discord

Sharing a VS Code extension I built for Zellij config/layout files. Provides completions for all options, actions, modes, and layout elements. Also validates config in real-time and shows color decorators for themes.

Zero dedicated Zellij extensions existed before this, so this is the first one.

https://github.com/atoolz/zellij-vscode-toolkit

Feedback welcome, especially on missing options or actions.

---

## GitHub Discussion on zellij-org/zellij

**Title:** VS Code extension for Zellij configuration files

**Body:**

I built a VS Code extension that provides IntelliSense for Zellij config and layout files:

- Completions for config options, keybind actions (53+), modes (14), layout elements, and built-in plugins
- Context-aware suggestions based on where you are in the config
- Real-time validation for unknown options, invalid values, and malformed hex colors
- Inline color decorators for theme definitions
- Auto-detection of Zellij config files

Would it be useful to mention this in the Zellij docs or community resources?

https://github.com/atoolz/zellij-vscode-toolkit

---

## Twitter/X

Zellij has 30K+ stars but zero dedicated editor support for its config format.

Built the first VS Code extension:
- completions for 53 actions, 14 modes, 26+ options
- validation catches errors before runtime
- color preview for themes
- auto-detects config.kdl

https://github.com/atoolz/zellij-vscode-toolkit

#zellij #vscode #terminal #opensource
