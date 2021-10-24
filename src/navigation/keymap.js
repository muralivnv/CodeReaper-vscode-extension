const keymap = {
  'i': {"command": "cursorUp",                              "args": {}},
  'I': {"command": "cursorUpSelect",                        "args": {}},
  'k': {"command": "cursorDown",                            "args": {}},
  'K': {"command": "cursorDownSelect",                      "args": {}},
  'u': {"command": "cursorLeft",                            "args": {}},
  'U': {"command": "cursorLeftSelect",                      "args": {}},
  'o': {"command": "cursorRight",                           "args": {}},
  'O': {"command": "cursorRightSelect",                     "args": {}},
  'j': {"command": "cursorWordLeft",                        "args": {}},
  'J': {"command": "cursorWordLeftSelect",                  "args": {}},
  'l': {"command": "cursorWordRight",                       "args": {}},
  'L': {"command": "cursorWordRightSelect",                 "args": {}},
  ',': {"command": "cursorHome",                            "args": {}},
  '<': {"command": "cursorHomeSelect",                      "args": {}},
  '.': {"command": "cursorEnd",                             "args": {}},
  '>': {"command": "cursorEndSelect",                       "args": {}},
  'b': {"command": "editor.action.jumpToBracket",           "args": {}},
  'B': {"command": "editor.action.selectToBracket",         "args": {}},
  '[': {"command": "workbench.action.navigateBack",         "args": {}},
  ']': {"command": "workbench.action.navigateForward",      "args": {}},
  'n': {"command": "editor.action.wordHighlightNext",       "args": {}},
  'p': {"command": "editor.action.wordHighlightPrev",       "args": {}},
  'mi': {"command": "editor.action.moveLinesUpAction",      "args": {}},
  'mk': {"command": "editor.action.moveLinesDownAction",    "args": {}},
  'mo': {"command": "editor.action.moveCarretRightAction",  "args": {}},
  'mu': {"command": "editor.action.moveCarretLeftAction",   "args": {}},
  'dd': {"command": "editor.action.revealDefinition",       "args": {}},
  'dp': {"command": "editor.action.peekDefinition",         "args": {}},
  'dr': {"command": "references-view.findReferences",       "args": {}},
  '-': {"command": "breadcrumbs.toggleToOn",                "args": {}},

  // go to 
  'gt': {"command": "cursorTop",                           "args": {}},
  'GT': {"command": "cursorTopSelect",                     "args": {}},
  'gb': {"command": "cursorBottom",                        "args": {}},
  'GB': {"command": "cursorBottomSelect",                  "args": {}},
  'gw': {"command": "jumpToHint.jumpByWord",               "args": {}},
  'gq': {"command": "jumpToHint.jumpBySearch",             "args": {}},
  'gl': {"command": "jumpToHint.jumpByLine",               "args": {}},

  // custom selection
  's(': {"command": "codereaper.selectParenthesis",         "args": {}},
  's)': {"command": "codereaper.selectParenthesisOuter",    "args": {}},
  's[': {"command": "codereaper.selectSquareBrackets",      "args": {}},
  's]': {"command": "codereaper.selectSquareBracketsOuter", "args": {}},
  's{': {"command": "codereaper.selectCurlyBrackets",       "args": {}},
  's}': {"command": "codereaper.selectCurlyBracketsOuter",  "args": {}},
  's<': {"command": "codereaper.selectAngleBrackets",       "args": {}},
  's>': {"command": "codereaper.selectAngleBracketsOuter",  "args": {}},
  's"': {"command": "codereaper.selectDoubleQuote",         "args": {}},
  's\'': {"command": "codereaper.selectSingleQuote",        "args": {}},
  's`': {"command": "codereaper.selectBackTick",            "args": {}},
  's.': {"command": "codereaper.selectInTag",               "args": {}},
  'ss': {"command": "editor.action.smartSelect.expand",     "args": {}},
  'sS': {"command": "editor.action.smartSelect.shrink",     "args": {}},
  'sl': {"command": "expandLineSelection",                  "args": {}},

  // multi-cursor
  'ca': {"command": "editor.action.selectHighlights",       "args": {}},
  'ci': {"command": "editor.action.insertCursorAbove",      "args": {}},
  'ck': {"command": "editor.action.insertCursorBelow",      "args": {}},
  'cc': {"command": "editor.action.addSelectionToNextFindMatch", "args": {}},
  'cn': {"command": "editor.action.moveSelectionToNextFindMatch", "args": {}},
  'cp': {"command": "editor.action.moveSelectionToPreviousFindMatch", "args": {}},
  
  // fuzzy search
  // custom file selection
  't': {"command": "codereaper.jumpToTab",                  "args": {}},
  '?': {"command": "codereaper.jumpToFile",                 "args": {}},
  // '?': {"command": "extension.multiCommand.execute",        "args": {"command": "multiCommand.fuzzySearchFiles"}},
  '/': {"command": "extension.multiCommand.execute",        "args": {"command": "multiCommand.fuzzySearchContent"}},

  // editor split
  '\\': {"command": "workbench.action.splitEditor",            "args": {}},
  '|': {"command": "workbench.action.splitEditorOrthogonal",   "args": {}}
};

const persistentParents = new Set(['m', 'c']);

// function to generate tree of key shortcuts
function getKeymapTree()
{
  let tree = {};
  tree["root"] = {};

  for (const key in keymap)
  {
    let parent = tree["root"];
    
    let i = 0;
    for (; i < key.length-1; i++)
    {
      if (!(key[i] in parent))
      { parent[key[i]] = {}; }

      parent = parent[key[i]];
    }
    parent[key[i]] = keymap[key];
  }
  return tree;
}

// export required modules
module.exports = { getKeymapTree, persistentParents };
