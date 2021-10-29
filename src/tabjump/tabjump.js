let vscode = require('vscode');
let path   = require('path');
const Fuse = require('fuse.js');

let { MRUTabs } = require('./types');

// constants
let maxMRUTabs = 10; // default, will be updated later based on user-configuration
let hintCharList = "fjdkghsla;ruvmeic,tybnwox.qpz"; // default, will be updated later based on user-configuration

// configuration
const jumpToTabId = 'codereaper.jumpToTab';

// global variables
let mruTabsList = new MRUTabs(maxMRUTabs);
let lastTab = undefined;

function register(context)
{
  context.subscriptions.push(
    vscode.commands.registerCommand(jumpToTabId, jumpToTab),
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
    mruTabsList.remove(file);
    
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
}

function jumpToTab()
{
  // get list of known text docs
  let knownDocs = mruTabsList.getMRUTabs() ;
  let docHints = generateFixedLenHints(knownDocs.length, Math.ceil(knownDocs.length/10.0));

  // combine hints and docs together
  let searcheable = Object.keys(knownDocs).map(label => ({label: `${docHints[label]} ~ ${path.basename(knownDocs[label])}`, 
                                                          description: `${vscode.workspace.asRelativePath(path.dirname(knownDocs[label]))}`, 
                                                          alwaysShow: true}));
  // set up fuzzy search
  const options = { includeScore: false, keys: ['label', 'description'] };
  // @ts-ignore
  const fuse = new Fuse(searcheable, options);

  // set up quick-pick
  let quickPick = vscode.window.createQuickPick();

  quickPick.matchOnDescription = true;
  quickPick.items = searcheable;
  quickPick.onDidChangeValue(e => {
    let items = searcheable;
    if (e != '')
    {
      const results = fuse.search(e);
      items = [];
      for (let i in results)
      { items.push(results[i].item); }
    }
    quickPick.items = items; 
  });

  quickPick.onDidAccept(()=>{
    quickPick.selectedItems.forEach(e => {
      const dirname = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, e.description);
      const filename = (e.label.split('~')[1]).trimStart();
      vscode.workspace.openTextDocument(path.join(dirname, filename)).then(doc => vscode.window.showTextDocument(doc, { preview: false }));
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
