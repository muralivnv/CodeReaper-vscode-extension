let vscode = require('vscode');
let { tmpdir, platform } = require('os');
let {join} = require('path');
let {writeFileSync, watch, rmSync, readFile} = require('fs');

let term = undefined;
let rgPath = "rg";
let fzfPath = "fzf";
let fuzzySearchIncludeGlob = undefined;
let fuzzySearchExcludeGlob = undefined;
let fuzzySearchContentRegExp = undefined;
let fzfOptions = undefined;

const milliseconds = (new Date()).getTime();
const searchResultOutFile = join(tmpdir(), `vscode_fuzzysearch_${milliseconds.toString()}.tmp`);
const fuzzySearchFileId = "codereaper.fuzzySearchFiles";
const fuzzySearchFileContentId = "codereaper.fuzzySearchFileContents";

function register(context)
{
  context.subscriptions.push(
    vscode.commands.registerCommand(fuzzySearchFileId, fuzzySearchFiles),
    vscode.commands.registerCommand(fuzzySearchFileContentId, fuzzySearchFileContents),
    vscode.workspace.onDidChangeConfiguration(updateConfig)
  );

  writeFileSync(searchResultOutFile, '');
  watch(searchResultOutFile, (eventType) => {
    if (eventType == 'change')
    { handleSelection(); }
    else if (eventType == 'rename')
    { vscode.window.showErrorMessage("fuzzy search output file has been renamed\n"); }
  });

  updateConfig();
}

function deactivate()
{ rmSync(searchResultOutFile); }

function updateConfig()
{
  const codereaper = vscode.workspace.getConfiguration("codereaper");

  rgPath = codereaper.get("ripgrepPath");
  fzfPath = codereaper.get("fzfPath");
  fuzzySearchIncludeGlob = codereaper.get("fuzzySearchIncludeGlob");
  fuzzySearchExcludeGlob = codereaper.get("fuzzySearchExcludeGlob");
  fuzzySearchContentRegExp = codereaper.get("fuzzySearchContentRegExp");
  fzfOptions = codereaper.get("fzfOptions");
}

function fuzzySearchFiles()
{
  if (   (!term                        )
      || (term.exitStatus !== undefined))
  {
    createTerminal();
  }

  const fzf_cmd = getFZFCmdFiles();
  const rg_cmd = getRgCmdFiles();

  term.sendText(`${rg_cmd} | ${fzf_cmd} > ${searchResultOutFile}`);
  term.show();
}

function fuzzySearchFileContents()
{
  if (   (!term                        )
      || (term.exitStatus !== undefined))
  {
    createTerminal();
  }

  const fzf_cmd = getFZFCmdContents();
  const rg_cmd = getRgCmdContents();

  term.sendText(`${rg_cmd} | ${fzf_cmd} > ${searchResultOutFile}`);
  term.show();
}

// helper functions
function createTerminal()
{
  term = vscode.window.createTerminal({
    name: "FuzzySearch", 
    hideFromUser: true,
    shellPath: getShell(),
    cwd: vscode.workspace.workspaceFolders[0].uri.fsPath
  });
}

function getShell()
{
  const curPlatform = platform();
  if (platform() == 'win32')
  { return "cmd.exe"; }
  else if (curPlatform == 'linux')
  { return "bash"; }
  else 
  { return undefined; }
}

function getFZFCmdContents()
{ return `${fzfPath} ${fzfOptions} --delimiter : --nth 3..`; }

function getFZFCmdFiles()
{ return `${fzfPath} ${fzfOptions}`; }

function getRgCmdFiles()
{ return `${rgPath} --iglob ${fuzzySearchIncludeGlob} --iglob ${fuzzySearchExcludeGlob} --files`; }

function getRgCmdContents()
{ return `${rgPath} --line-number --column --iglob ${fuzzySearchIncludeGlob} --iglob ${fuzzySearchExcludeGlob} --pcre2 ${fuzzySearchContentRegExp}`; }

function handleSelection()
{
  readFile(searchResultOutFile, {encoding: 'utf-8'}, (err, data) => {
    if (err)
    { return; }
    
    const isDataGood = (data.length > 0) && (data[0] != '1');
    if (isDataGood)
    {
      try
      {  openFiles(data);  }
      catch (error)
      {  console.error(error);  }
      term?.hide();
    }
  });
}

function openFiles(data)
{
  const filePaths = data.split('\n').filter(s => s !== '');
  filePaths.forEach(p => {
    const [file, lineTmp, charTmp] = p.split(':', 3);
    let line = undefined, char = 0;
    // let range = new vscode.Range(0, 0, 0, 0);
    if (lineTmp !== undefined) {
        if (charTmp !== undefined) {
            char = parseInt(charTmp) - 1;  // 1 based in rg, 0 based in VS Code
        }
        line = parseInt(lineTmp) - 1;  // 1 based in rg, 0 based in VS Code
    }

    const textDocumentOptions = {
      preview: false,
      selection: line?new vscode.Range(line, char, line, char):undefined
    };

    vscode.window.showTextDocument(
        vscode.Uri.file( join(vscode.workspace.workspaceFolders[0].uri.fsPath, file) ),
        textDocumentOptions);
  });
}

module.exports = {register, deactivate};
