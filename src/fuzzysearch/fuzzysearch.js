let vscode = require('vscode');
let { tmpdir, platform, EOL } = require('os');
let {join, sep} = require('path');
let {writeFileSync, watch, rmSync, readFile} = require('fs');

let term = undefined;
let termCWD = "";
let workspaceRootFolder = "";
let rgPath = "rg";
let fzfPath = "fzf";
let fuzzySearchIncludeArgs = undefined;
let fuzzySearchExcludeArgs = undefined;
let fuzzySearchContentRegExp = undefined;
let fuzzySearchTodoContentRegExp = undefined;
let fzfOptions = undefined;

const milliseconds = (new Date()).getTime();
const searchResultOutFile = join(tmpdir(), `vscode_fuzzysearch_${milliseconds.toString()}.tmp`);
const fuzzySearchFileId = "codereaper.fuzzySearchFiles";
const fuzzySearchFileContentId = "codereaper.fuzzySearchFileContents";
const fuzzySearchTodoContentsId = "codereaper.fuzzySearchTodoContents"

function register(context)
{
  context.subscriptions.push(
    vscode.commands.registerCommand(fuzzySearchFileId, fuzzySearchFiles),
    vscode.commands.registerCommand(fuzzySearchFileContentId, fuzzySearchFileContents),
    vscode.commands.registerCommand(fuzzySearchTodoContentsId, fuzzySearchTodoContents),
    vscode.workspace.onDidChangeConfiguration(updateConfig),
    vscode.workspace.onDidChangeWorkspaceFolders(handleWorkspaceFoldersChange)
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
  fuzzySearchIncludeArgs = `--iglob ${codereaper.get("fuzzySearchIncludeGlob")}`;
  fuzzySearchExcludeArgs = `--iglob ${codereaper.get("fuzzySearchExcludeGlob")}`;
  fuzzySearchContentRegExp = codereaper.get("fuzzySearchContentRegExp");
  fuzzySearchTodoContentRegExp = codereaper.get("fuzzySearchTodoContentRegExp");
  fzfOptions = codereaper.get("fzfOptions");

  handleWorkspaceFoldersChange();
}

function handleWorkspaceFoldersChange()
{
  workspaceRootFolder = getCommonWorkspaceFoldersRoot();
  fuzzySearchIncludeArgs = assembleFuzzySearchIncludeArgs();
}

function setupTerminal()
{
  if (   (!term                        )
      || (term.exitStatus !== undefined))
  {
    createTerminal();
  }
  else if (termCWD != workspaceRootFolder)
  {
    term.sendText(`cd ${workspaceRootFolder}`);
    term.show();
    termCWD = workspaceRootFolder;
  }
}

function fuzzySearchFiles()
{
  setupTerminal();

  const fzf_cmd = getFZFCmdFiles();
  const rg_cmd = getRgCmdFiles();
  const errorLevel_cmd = getShellErrorCodeCmd();

  const cmd1 = `${rg_cmd} | ${fzf_cmd} > ${searchResultOutFile}`;
  const cmd2 = `echo ${errorLevel_cmd} >> ${searchResultOutFile}`;
  const finalCmd = concatMultipleShellCommands([cmd1, cmd2]);

  term.sendText(finalCmd);
  term.show();
}

function fuzzySearchFileContents()
{
  setupTerminal();

  const fzf_cmd = getFZFCmdContents();
  const rg_cmd = getRgCmdContents();
  const errorLevel_cmd = getShellErrorCodeCmd();

  const cmd1 = `${rg_cmd} | ${fzf_cmd} > ${searchResultOutFile}`;
  const cmd2 = `echo ${errorLevel_cmd} >> ${searchResultOutFile}`;
  const finalCmd = concatMultipleShellCommands([cmd1, cmd2]);

  term.sendText(finalCmd);
  term.show();
}

function fuzzySearchTodoContents()
{
  setupTerminal();

  const fzf_cmd = getFZFCmdFiles();
  const rg_cmd  = getRgCmdTodoContents();
  const errorLevel_cmd = getShellErrorCodeCmd();

  const cmd1 = `${rg_cmd} | ${fzf_cmd} > ${searchResultOutFile}`;
  const cmd2 = `echo ${errorLevel_cmd} >> ${searchResultOutFile}`;
  const finalCmd = concatMultipleShellCommands([cmd1, cmd2]);
  
  term.sendText(finalCmd);
  term.show();
}

// helper functions
function getRootPath(folders)
{
  if (folders.length == 0)
  { return ''; }

  if (folders.length == 1)
  { return folders[0]; }
 
  var rootPath = new Set(folders[0].split(sep));

  for (var i = 1; i < folders.length; i++)
  {
    const thisPath = new Set(folders[i].split(sep));
    rootPath = new Set([...rootPath].filter(elem => thisPath.has(elem)));
  }
  return [...rootPath].join(sep);
}

function getCommonWorkspaceFoldersRoot()
{
  const wrkspcFolders = vscode.workspace.workspaceFolders.map(function (folder) {
    return folder.uri.fsPath;
  });
  const rootPath = getRootPath(wrkspcFolders);
  return rootPath;
}

function assembleFuzzySearchIncludeArgs()
{
  const wrkspcFolders = vscode.workspace.workspaceFolders.map(function (folder) {
    return folder.uri.fsPath;
  });
  const rootPath = getRootPath(wrkspcFolders);
  workspaceRootFolder = rootPath;

  const relFolderPaths = wrkspcFolders.map(function (folder){
    var temp = folder.replace(rootPath, "");
    if (temp.charAt(0) == sep)
    {
      return temp.substring(1);
    }
    return temp;
  }).filter(function (relFolder) {
    return (relFolder.length > 0);
  });
  var rgArgsMultipleFolders = fuzzySearchIncludeArgs;
  if (relFolderPaths.length > 0)
  {
    const fuzzySearchIncludeGlob = vscode.workspace.getConfiguration("codereaper").get("fuzzySearchIncludeGlob");
    var temp = relFolderPaths.map(function(relFolder) {
      var temp_ = [fuzzySearchIncludeGlob.slice(0, 1), relFolder + "/", fuzzySearchIncludeGlob.slice(1)].join('');
      return `--iglob ${temp_}`;
    });
    rgArgsMultipleFolders = temp.join(" ");
  }
  return rgArgsMultipleFolders;
}

function createTerminal()
{
  const rootPath = getCommonWorkspaceFoldersRoot();
  termCWD = rootPath;
  workspaceRootFolder = rootPath;

  term = vscode.window.createTerminal({
    name: "FuzzySearch", 
    hideFromUser: true,
    shellPath: getShell(),
    cwd: rootPath
  });
}

function getShell()
{
  const curPlatform = platform();
  if (curPlatform == 'win32')
  { return "cmd.exe"; }
  else if (curPlatform == 'linux')
  { return "bash"; }
  else 
  { return undefined; }
}

function getShellErrorCodeCmd()
{
  const curPlatform = platform();
  if (curPlatform == 'win32')
  { return "%ErrorLevel%"; }
  return "$?";
}

function concatMultipleShellCommands(commands)
{
  const curPlatform = platform();
  if (curPlatform == 'win32')
  { return commands.join('&'); }
  return commands.join(';');
}

function getFZFCmdContents()
{ return `${fzfPath} ${fzfOptions} --delimiter : --nth 3..`; }

function getFZFCmdFiles()
{ return `${fzfPath} ${fzfOptions}`; }

function getRgCmdFiles()
{
  return `${rgPath} ${fuzzySearchIncludeArgs} ${fuzzySearchExcludeArgs} --files`;
}

function getRgCmdContents()
{
  return `${rgPath} --line-number --column ${fuzzySearchIncludeArgs} ${fuzzySearchExcludeArgs} --pcre2 ${fuzzySearchContentRegExp}`;
}

function getRgCmdTodoContents()
{
  return `${rgPath} --line-number --column ${fuzzySearchIncludeArgs} ${fuzzySearchExcludeArgs} --pcre2 ${fuzzySearchTodoContentRegExp}`;
}

function handleSelection()
{
  readFile(searchResultOutFile, {encoding: 'utf-8'}, (err, data) => {
    if (err)
    { return; }

    let lines = data.split(EOL).filter(s => s !== '');
    var i = lines.length - 1;

    // try to parse error code if any
    try
    {
      const exitCode = parseInt(lines[i]);
      if  ( (isNaN(exitCode) == false) && (exitCode != 0) )
      {
        i -= 1;
        term?.hide();
      }
    }
    catch (error)
    { console.log(error); }

    // parse rest of the file
    for (; i >= 0; i--)
    {
      const isDataGood = (lines[i].length > 0) && (lines[i][0] != '1');
      if (isDataGood)
      {
        try
        {
          openFiles(lines[i]);
          term?.hide();
        }
        catch (error)
        {  console.error(error);  }
      }
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
        vscode.Uri.file( join(workspaceRootFolder, file) ),
        textDocumentOptions);
  });
}

module.exports = {register, deactivate};
