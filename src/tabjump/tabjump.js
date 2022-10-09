let vscode = require('vscode');
let path   = require('path');
const {existsSync} = require('fs');
let { MRUTabs } = require('./types');

// constants
let maxMRUTabs = 10; // default, will be updated later based on user-configuration
let hintCharList = "asdjklyweio"; // default, will be updated later based on user-configuration
let removeClosedTabsFromList = false;

// configuration
const jumpToTabId = 'codereaper.jumpToTab';
const quickJumpToTabId = 'codereaper.quickJumpToTab';

// global variables
let mruTabsList = new MRUTabs(maxMRUTabs);
let lastTab = undefined;

function register(context)
{
  context.subscriptions.push(
    vscode.commands.registerCommand(jumpToTabId, jumpToTab),
    vscode.commands.registerCommand(quickJumpToTabId, quickJumpToTab),
    vscode.workspace.onDidChangeConfiguration(updateConfig)
  );

  // register listeners to maintain MRU Tabs List
  vscode.window.onDidChangeActiveTextEditor(e => {
    try
    {
      const _ = lastTab?mruTabsList.add(lastTab, undefined):undefined;
      lastTab = e.document.uri.fsPath;
      mruTabsList.remove(e.document.uri.fsPath);
    }
    catch(err)
    { console.log(err); }
  });

  vscode.workspace.onDidCloseTextDocument(d => {
    const file = d.uri.fsPath;
    if (removeClosedTabsFromList == true)
    { mruTabsList.remove(file); }
    if (file == lastTab)
    { lastTab = undefined; }
  });

  updateConfig();
}

function updateConfig()
{
  const codereaper = vscode.workspace.getConfiguration("codereaper");

  maxMRUTabs = codereaper.get("maxMRUTabsLen");
  hintCharList = codereaper.get("tabHintCharList");
  mruTabsList.setMaxSize(maxMRUTabs);
  removeClosedTabsFromList = codereaper.get("removeClosedTabsFromList");
}

function jumpToTab()
{
  // get list of known text docs
  let knownDocs = mruTabsList.getMRUTabs();
  const hintLen = Math.ceil(knownDocs.length/hintCharList.length);
  let docHints = generateFixedLenHints(knownDocs.length, hintLen);

  // combine hints and docs together
  let searcheable = Object.keys(knownDocs).map(label => ({label: `${docHints[label]} ~ ${path.basename(knownDocs[label])}`,
                                                          description: `${vscode.workspace.asRelativePath(path.dirname(knownDocs[label]))}`,
                                                          alwaysShow: true}));
  // set up quick-pick
  let quickPick = vscode.window.createQuickPick();

  quickPick.matchOnDescription = true;
  quickPick.matchOnDetail = true;
  quickPick.items = searcheable;

  // pre-select first item in the list
  quickPick.items[0].picked = true;

  quickPick.onDidAccept(()=>{
    quickPick.selectedItems.forEach(e => {
      const dirname = e.description;
      const filename = (e.label.split('~')[1]).trimStart();
      let fullPath = path.join(dirname, filename)

      // in case the file is not from workspace folder don't prematurely append workspace folder
      if (!existsSync(fullPath))
      { fullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, fullPath); }

      vscode.window.showTextDocument(
        vscode.Uri.file( fullPath ),
        { preview: false});
    })
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

function quickJumpToTab()
{
  // get list of known text docs
  let knownDocs = mruTabsList.getMRUTabs();
  const hintLen = Math.ceil(knownDocs.length/hintCharList.length);
  let docHints = generateFixedLenHints(knownDocs.length, hintLen);

  // combine hints and docs together
  let searcheable = Object.keys(knownDocs).map(label => ({label: `${docHints[label]} ~ ${path.basename(knownDocs[label])}`,
                                                          description: `${vscode.workspace.asRelativePath(path.dirname(knownDocs[label]))}`,
                                                          alwaysShow: true}));
  // set up quick-pick
  let quickPick = vscode.window.createQuickPick();

  quickPick.matchOnDescription = false;
  quickPick.matchOnDetail = false;
  quickPick.canSelectMany = false;

  quickPick.items = searcheable;

  // pre-select first item in the list
  quickPick.items[0].picked = true;

  quickPick.onDidChangeValue(e => {
    if (e != '')
    {
      if (e.length == hintLen)
      {
        const firstItem = quickPick.activeItems[0];

        const dirname = firstItem.description;
        const filename = (firstItem.label.split('~')[1]).trimStart();
        let fullPath = path.join(dirname, filename)

        // in case the file is not from workspace folder don't prematurely append workspace folder
        if (!existsSync(fullPath))
        { fullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, fullPath); }

        vscode.window.showTextDocument(
          vscode.Uri.file( fullPath ),
          { preview: false});

        quickPick.dispose();
      }
    }
  });

  quickPick.onDidAccept(()=>{
    quickPick.selectedItems.forEach(e => {
      const dirname = e.description;
      const filename = (e.label.split('~')[1]).trimStart();
      let fullPath = path.join(dirname, filename)

      // in case the file is not from workspace folder don't prematurely append workspace folder
      if (!existsSync(fullPath))
      { fullPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, fullPath); }

      vscode.window.showTextDocument(
        vscode.Uri.file( fullPath ),
        { preview: false});
    })
  });

  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

function generateFixedLenHints(count, hintLen)
{
  let dfs = (hint, list) => {
    if (list.length >= count) return list;

    if (hint.length < hintLen)
    {
      for (let i = 0; i < hintCharList.length; i++)
      {
        dfs(hint + hintCharList[i], list);
      }
    }
    else
    {
      list.push(hint);
    }
    return list;
  };

  return dfs('', []);
}

function generateVariableLabelList(count)
{
  let hintList = [''];
  let offset = 0;
  while (   (hintList.length - offset < count)
         || (hintList.length == 1))
  {
    let hint = hintList[offset++];
    (new Set(hintCharList)).forEach((val) => {
        hintList.push(hint + val);
    });
  }

  return hintList.slice(offset, offset + count);
}

function getKnownTextDocs()
{
  let knownDocsPaths = []
  vscode.workspace.textDocuments.forEach(doc => {
    knownDocsPaths.push(doc.uri.fsPath);
  });

  return knownDocsPaths;
}

module.exports = {register};
