let vscode = require('vscode');
let path   = require('path');
const Fuse = require('fuse.js');

// constants
const nMRUTabs = 20;
const hintCharList = "fjdkghsla;ruvmeic,tybnwox.qpz";
const fileSearchIncludeGlob = "**/*.{c,py,txt,cpp,h,cc,hpp,json,yaml}"
const fileSearchExcludeGlob = "**/{node_modules,Core}/**"

// configuration
const jumpToTabId = 'codereaper.jumpToTab';
const jumpToFileId = 'codereaper.jumpToFile';

// global variables
class MRUTabs 
{

  constructor()
  {
    this.docs = new Map();
    this.mruTabs  = [];
  }
  
  add(docURI)
  {
    if (docURI in this.docs)
    { 
      // get the index in the array
      const docIndex = this.docs[docURI];
      
      // remove this document from the list
      this.mruTabs.splice(docIndex, 1);
    }

    // add this do at the beginning of the array
    this.docs[docURI] = 0;
    this.mruTabs.unshift(docURI);

    this.clampBuffer();
    this.updateMapIndex();
  }

  remove(docURI)
  {
    if (docURI in this.docs)
    {
      // get the index in the array
      const docIndex = this.docs[docURI];
      
      // remove this document from the list
      this.mruTabs.splice(docIndex, 1);
      delete this.docs[docURI];
      this.updateMapIndex();
    }
  }

  clampBuffer()
  {
    while (this.mruTabs.length > nMRUTabs)
    {
      const lruDoc = this.mruTabs.pop();
      delete this.docs[lruDoc];
    }
  }

  updateMapIndex()
  {
    for (let i = 0; i < this.mruTabs.length; i++)
    { this.docs[this.mruTabs[i]] = i; }
  }

  getMRUTabs()
  { return this.mruTabs; }
}

let mruTabsList = new MRUTabs();

function register(context)
{
  context.subscriptions.push(
    vscode.commands.registerCommand(jumpToTabId, jumpToTab),
    vscode.commands.registerCommand(jumpToFileId, jumpToFile)
  );

  // register listeners to maintain MRU Tabs List
  vscode.window.onDidChangeActiveTextEditor(e => {
    mruTabsList.add(e.document.uri.fsPath);
  });

  vscode.workspace.onDidCloseTextDocument(d => {
    mruTabsList.remove(d.uri.fsPath);
  });
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
  const options = { includeScore: true, keys: ['label', 'description'] };
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
      let dirname = e.description;
      let filename = (e.label.split('~')[1]).trimStart();
      vscode.workspace.openTextDocument(path.join(dirname, filename)).then(doc => vscode.window.showTextDocument(doc, { preview: false }));
    })
  });
  
  quickPick.onDidHide(() => quickPick.dispose());
  quickPick.show();
}

async function jumpToFile()
{
  const files = await vscode.workspace.findFiles(fileSearchIncludeGlob, fileSearchExcludeGlob);

  // set up fuzzy search
  const options = { includeScore: true, 
                    keys: ['fsPath'], 
                    threshold: 0.8,
                    ignoreLocation: true, 
                    findAllMatches: true, 
                    useExtendedSearch: true
                  };
  // @ts-ignore
  const fuse = new Fuse(files, options);

  // set up quick-pick
  let quickPick = vscode.window.createQuickPick();

  quickPick.onDidChangeValue(e => {
    let items = {};
    if (e.length >= 3)
    {
      const results = fuse.search(e);
      items = [];
      for (let i in results)
      { items.push(results[i].item.fsPath); }
    }
    quickPick.items = Object.keys(items).map(label => ({label: `${path.basename(items[label])}`, 
                                                        description: `${vscode.workspace.asRelativePath(path.dirname(items[label]))}`, 
                                                        alwaysShow: true}));
  });

  quickPick.onDidAccept(()=>{
    quickPick.selectedItems.forEach(e => {
      let dirname = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, e.description);
      let filename = e.label;
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
