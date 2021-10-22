// imports
let vscode = require('vscode');
const { getKeymapTree, persistentParents } = require('./keymap');

// global variables
const keymapTree = getKeymapTree();

let isInNavigationMode = false;
let typeSubscriptions  = undefined;
let statusBarItem      = undefined;
let lastKeyName        = undefined;
let lastKeyNode        = undefined;

// constants
const navigationModeCursorStyle   = vscode.TextEditorCursorStyle.Block;
const editModeCursorStyle         = vscode.TextEditorCursorStyle.Line;
const navigationModeStatusBarText = "🐒";
const editModeStatusBarText       = "🐑";

// navigation API configuration
const toggleId    = "codereaper.toggle";
const clearInputId = "codereaper.clearInput";

// custom register function that will be called during extension activation
function register (context)
{
  // setup status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = toggleId;

  // setup all subscriptions
  context.subscriptions.push(
    vscode.commands.registerCommand(toggleId, modeToggle),
    vscode.commands.registerCommand(clearInputId, clearInput)
  );

  context.subscriptions.push(statusBarItem);

  // initialization
  switchToEditMode();
  resetInputKeyTreeState();
}

// helper functions
function modeToggle()
{
  if (isInNavigationMode)
  { switchToEditMode(); }
  else 
  { switchToNavigationMode(); }
}

function clearInput()
{
  if (isInNavigationMode)
  {
    vscode.commands.executeCommand("cancelSelection");
    vscode.commands.executeCommand("removeSecondaryCursors");
    resetInputKeyTreeState();
  }
}

function switchToEditMode()
{
  if (typeSubscriptions)
  {
    typeSubscriptions.dispose();
    typeSubscriptions = undefined;
  }
  isInNavigationMode = false;
  updateCursorState(vscode.window.activeTextEditor);
  updateStatusBarItem();

  vscode.commands.executeCommand('setContext', "codereaper.isInNavigationMode", false);
}

function switchToNavigationMode()
{
  if (!typeSubscriptions)
  { typeSubscriptions = vscode.commands.registerCommand("type", onType); }
  isInNavigationMode = true;
  updateCursorState(vscode.window.activeTextEditor);
  updateStatusBarItem();

  vscode.commands.executeCommand('setContext', "codereaper.isInNavigationMode", true);
}

async function onType(event)
{
  const editor = vscode.window.activeTextEditor;
  const keyNode = (event.text in lastKeyNode)?lastKeyNode[event.text]:undefined;

  if (!keyNode)
  {
    resetInputKeyTreeState(); 
    return;
  }

  if (editor && ("command" in keyNode))
  {
    vscode.commands.executeCommand(keyNode.command, keyNode.args);  
    
    if (!persistentParents.has(lastKeyName))
    { resetInputKeyTreeState(); }
  }
  else
  {
    lastKeyName = event.text;
    lastKeyNode = keyNode;
  }
}

function updateCursorState(editor)
{
  if (editor)
  {
    if (isInNavigationMode)
    { editor.options.cursorStyle = navigationModeCursorStyle; }
    else 
    { editor.options.cursorStyle = editModeCursorStyle; }
  }
}

function updateStatusBarItem()
{
  if (statusBarItem)
  {
    statusBarItem.text = isInNavigationMode?navigationModeStatusBarText:editModeStatusBarText;
    statusBarItem.show();
  }
}

function resetInputKeyTreeState()
{
  lastKeyName = "root";
  lastKeyNode = keymapTree[lastKeyName];
}

// register objects that need to be exported
module.exports = { register }
