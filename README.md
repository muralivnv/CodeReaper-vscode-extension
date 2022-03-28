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

### Navigation Mode Configuration

| Command | Explanation |
|---|---|
| `codereaper.toggle` | Command to go in and out of NAVIGATION mode. By default this is mapped to a keybinding `alt+q` |
| `codereaper.clearInput` | Command to clear currently typed key sequence in NAVIGATION mode. By default this is mapped to a keybinding `esc` |

#### Configuring

- **`codereaper.keymap`**: Defines mapping between key sequences to commands in NAVIGATION mode. By default this is set to [this](https://github.com/muralivnv/CodeReaper-vscode-extension/blob/2f0cf9b901c385354ed53477c6ecfc416ef85272/package.json#L71). Can be modified through `settings.json`.  

- **`codereaper.stickyParentKeys`**: For example, let's say a key sequence `ci` is mapped to command `cursorInsertBelow`. It would be inconvenient to press `ci` n-times. Instead, by adding `c` to `stickyParentKeys` list, we can press `c` just 1-time and then press `i` n-times or any other key under this parent. To go out of this sticky key mode, simply press `esc` or any key sequence that is not under this current sticky parent. By default this array contains `m`, `c`, `e`. Can be modified through `settings.json`.  

- **`codereaper.navigationModeIdentifier`**: Text to display at the bottom left corner of VSCode when in NAVIGATION mode. This is set to 🐒 by default and can be changed in `settings.json`.

- **`codereaper.editModeIdentifier`**: Text to display at the bottom left corner of vscode when in NORMAL mode. This is set to 🐑 by default and can be changed in `settings.json`. 

### Jumping Between Tabs

| Command | Explanation |
|---|---|
| `codereaper.jumpToTab` | List n most recently used tabs in the order of latest to oldest with hints to **select and jump**. Need to hit ENTER to open the tab |
| `codereaper.quickJumpToTab` | List n most recently used tabs in the order of latest to oldest with hints to **immediately jump**. Simply pressing the hint that is shown next to tab name will automatically switch to that tab without user pressing ENTER |

#### Configuring

- **`codereaper.maxMRUTabsLen`**: N most recently used tabs to keep track of. This is set to 20 by default and can be modified through `settings.json`. 
- **`codereaper.tabHintCharList`**: Hints to be used to show next to the tab names for easy tab selection. This is set to `asdjklyweio` by default and can be modified through `settings.json`.

### Fuzzy Searching

[ripgrep](https://github.com/BurntSushi/ripgrep) and [fzf](https://github.com/junegunn/fzf) are the backbone for this feature. 

| Command | Explanation |
|---|---|
| `codereaper.fuzzySearchFiles` | Command to trigger fuzzy searching for files in terminal. After selecting the file in fzf, the extension will automatically open the selected file in the editor |
| `codereaper.fuzzySearchFileContents` | Command to trigger fuzzy searching for contents inside the files. After selecting the line in fzf, the extension will automatically open the file at the current line in the editor. Type of lines that will be shown can be configured using the setting `codereaper.fuzzySearchContentRegExp` |
| `codereaper.fuzzySearchTodoContents` | Same as above but tuned to show comment lines that includes TODO or FIXME or XXX or HACK. Type of lines that will be shown can be configured using the setting `codereaper.fuzzySearchTodoContentRegExp` |
  
For all the three above commands, the type of files and folders that will be used can be configured using the setting `codereaper.fuzzySearchIncludeGlob`.   
Similarly, some paths and files can be ignored to speed up the search. This is can configured using the setting `codereaper.fuzzySearchExcludeGlob`. 

#### Configuring

- **`codereaper.ripgrepPath`**: Path to ripgrep executable. This is set to `rg` by default and can be modified through `settings.json`.

- **`codereaper.fzfPath`**: Path to fzf executable. This is set to `fzf` by default and can be modified through `settings.json`.

- **`codereaper.fuzzySearchIncludeGlob`**: Type of files and folders to be used by ripgrep for all the three commands above. This is set to `**/*.{c,py,txt,cpp,h,cc,hpp,json,yaml,js,ts,md,csv,xlsx}` by default to only search files with these extensions and can be modified through `settings.json`. **Note**: The reg-exp syntax of this setting should be understandable by ripgrep.

- **`codereaper.fuzzySearchExcludeGlob`**: Type of files and folders to be ignored by ripgrep for all the three commands above. This is set to `!**/{node_modules}/**` by default and can be modified through `settings.json`. **Note**: The reg-exp syntax of this setting should be understandable by ripgrep.

- **`codereaper.fuzzySearchContentRegExp`**: Type of content to be extracted by ripgrep from all the files for fuzzy searching of contents. This is set to `\"^\\s*\\w+(\\w+(?!^\\s*(//|/\\*|#|<!--|;|-)))\"` by default to exclude lines that are comments. This can be modified through `settings.json`. 

- **`codereaper.fuzzySearchTodoContentRegExp`**: Type of content to be extracted by ripgrep from all the file for fuzzy searching of TODOs. This is set to `\"((//|/\\*|#|<!--|;|-)\\s*(TODO|FIXME|XXX|HACK))\"` by default to only include comment lines that has one of TODO, FIXME, XXX, HACK. This can be modified through `settings.json`. 

- **`codereaper.fzfOptions`**: Options to pass to fzf to configure fuzzy search. This is set to `--algo=v2 --color hl:221,hl+:74 --margin 1% --border` by default and can be modified through `settings.json`.

## References

- David Bankier: [Quick-Select](https://github.com/dbankier/vscode-quick-select)
- Brian Malehorn: [Vimspired](https://github.com/bmalehorn/vscode-vimspired)
- Tommy Johtela: [ModalEdit](https://github.com/johtela/vscode-modaledit)
- tomrijndorp: [FindItFaster](https://github.com/tomrijndorp/vscode-finditfaster)
