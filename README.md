# Code Reaper

Set of features to easily and efficiently navigate around workspace.  

## Features

- Highly customizable navigation mode (NORMAL model in vim).
- List opened tabs in the order of most-recently-used and quickly jump to them.
- Fuzzy search for files within the workspace and jump to them.
- Fuzzy search for content inside wokspace files and jump to them.

## Installation

- Download the file **codereaper-x.x.x.vsix**
- Open VSCode
- Open Command Palette with keyboard shortcut `ctrl/cmd+shift+p` and type **install from vsix**
- Navigate to the download location and install the extension

## Configuration

Follow the sections below to configure required feature.

### Navigation Mode Configuration

| Command | Explanation |
|---|---|
| `codereaper.toggle` | Toggle between NORMAL (as in vscode normal) mode and NAVIGATION mode. By default is mapped to a keyboard shortcut `alt+q` |
| `codereaper.clearInput` | Clear currently type keys in NAVIGATION mode. By default is mapped to keyboard shortcut `esc` |

#### Configuring

- **`codereaper.keymap`**: Defines mapping between keysequences to commands in NAVIGATION mode. By default this is set to [this](https://github.com/muralivnv/CodeReaper-vscode-extension/blob/2f0cf9b901c385354ed53477c6ecfc416ef85272/package.json#L71). Modify this in your `settings.json` to your liking.  

- **`codereaper.stickyParentKeys`**: For example, let's say keysequence `ci` is mapped to command `cursorInsertBelow`. It would be inconvenient to press `ci` n-times. Instead by adding `c` to `stickyParentKeys` array, we type `c` 1-time and `i` n-times. To go out of sticky mode, simply press `esc` or any keysequence that is not under this is not under current sticky parent. By default this array contains `m`, `c`, `e`. Modify this in your `settings.json` to your liking.  

- **`codereaper.navigationModeIdentifier`**: Text to display at the bottom left corner of vscode when in NAVIGATION mode. Set to 🐒 by default and can be changed in `settings.json`.

- **`codereaper.editModeIdentifier`**: Text to display at the bottom left corner of vscode when in NORMAL mode. Set to 🐑 by default and can be changed in `settings.json`. 

### Jumping Between Tabs

| Command | Explanation |
|---|---|
| `codereaper.jumpToTab` | List n most recently used in the order of earliest to oldest with hints to jump. Need to hit ENTER to open that tab |
| `codereaper.quickJumpToTab` | List n most recently used in the order of earliest to oldest with hints to jump. Simply pressing the hint shown will automatically switch to that tab |

#### Configuring

- **`codereaper.maxMRUTabsLen`**: N most recently used tabs to keep in list. Set to 20 by default and can be changed this in `settings.json`. 
- **`codereaper.tabHintCharList`**: Hints to be used to show next to tab names for quick jumping. Set to `asdjklyweio` by default and can be changed in `settings.json`.

### Fuzzy Searching

This feature uses Ripgrep and FZF extensively. 

| Command | Explanation |
|---|---|
| `codereaper.fuzzySearchFiles` | Command to trigger fuzzy searching for files. After hitting selecting the file in FZF, the extension will automatically open this file in the editor. |
| `codereaper.fuzzySearchFileContents` | Command to trigger fuzzy searching for a content inside all the files. After selecting a required line in FZF, the extension will automatically open the file at the location in the editor. Type of lines that will be shown can be configured using the setting `codereaper.fuzzySearchContentRegExp` |
| `codereaper.fuzzySearchTodoContents` | Same as above but tuned towards lines that includes TODO or FIXME or XXX or HACK. Type of lines that will be shown can be configured using the setting `codereaper.fuzzySearchTodoContentRegExp`|

For all the three above commands, the type of files and folders that will be used can be configured using the setting `codereaper.fuzzySearchIncludeGlob`. Similarly, some paths and files can be ignored to speed up the search. This is can configured using the setting `codereaper.fuzzySearchExcludeGlob`. 

#### Configuring

- **`codereaper.ripgrepPath`**: Path to ripgrep executable. Set to `rg` by default.

- **`codereaper.fzfPath`**: Path to fzf executable. Set to `fzf` by default.

- **`codereaper.fuzzySearchIncludeGlob`**: Type of files and folders to be used in fuzzy search mode for all the three commands above. Set to `**/*.{c,py,txt,cpp,h,cc,hpp,json,yaml,js,ts,md,csv,xlsx}` by default to only search files with this extensions. **Note**: The syntax of this should be recognizable by ripgrep.

- **`codereaper.fuzzySearchExcludeGlob`**: Type of files and folders to be ignored in fuzzy search mode for all the three commands above. Set to `!**/{node_modules}/**` by default. **Note**: The syntax of this should be recognizable by ripgrep

- **`codereaper.fuzzySearchContentRegExp`**: Type of content to be extracted by ripgrep from all the files for fuzzy searching of contents. Set to `\"^\\s*\\w+(\\w+(?!^\\s*(//|/\\*|#|<!--|;|-)))\"` by default to exclude lines that are comments. 

- **`codereaper.fuzzySearchTodoContentRegExp`**: Type of content to be extracted by ripgrep from all the file for fuzzy searching of TODOs. Set to `\"((//|/\\*|#|<!--|;|-)\\s*(TODO|FIXME|XXX|HACK))\"` by default to only include comment lines and has one of TODO, FIXME, XXX, HACK. 

- **`codereaper.fzfOptions`**: Options to pass to FZF to prettify output or configuring FZF search. Set to `--algo=v2 --color hl:221,hl+:74 --margin 1% --border` by default.

## References

- David Bankier: [Quick-Select](https://github.com/dbankier/vscode-quick-select)
- Brian Malehorn: [Vimspired](https://github.com/bmalehorn/vscode-vimspired)
- Tommy Johtela: [ModalEdit](https://github.com/johtela/vscode-modaledit)
- tomrijndorp: [FindItFaster](https://github.com/tomrijndorp/vscode-finditfaster)
