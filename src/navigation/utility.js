// function to generate tree of key shortcuts
function getKeymapTree(keymap)
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
module.exports = { getKeymapTree };
