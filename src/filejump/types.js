class MRUTabs 
{
  constructor(maxSize)
  {
    this.mruTabs_ = new Map(); // map remembers the order of insertion
    this.maxSize_ = maxSize;
  }
  
  add(docURI)
  {
    this.remove(docURI);
    this.mruTabs_.set(docURI, undefined);
    this.clampBuffer();
  }

  remove(docURI)
  {
    if (docURI in this.mruTabs_)
    {  this.mruTabs_.delete(docURI);  }
  }

  clampBuffer()
  {
    const keys = [...this.mruTabs_.keys()];
    while (this.mruTabs_.size > this.maxSize_)
    {
      const lruDoc = keys.shift();
      this.mruTabs_.delete(lruDoc);
    }
  }

  getMRUTabs()
  { return [...this.mruTabs_.keys()].reverse(); }
}

module.exports = { MRUTabs };