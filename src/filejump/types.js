class MRUTabs 
{
  constructor(maxSize)
  {
    this.mruTabs_ = new Map(); // map remembers the order of insertion
    this.maxSize_ = maxSize;
  }
  
  add(docURI, value)
  {
    this.remove(docURI);
    this.mruTabs_.set(docURI, value);
    this.clampBuffer();
  }

  remove(docURI)
  {
    if (this.mruTabs_.has(docURI))
    { this.mruTabs_.delete(docURI); }
  }

  get(docURI)
  {  return this.mruTabs_.get(docURI);  }

  clampBuffer()
  {
    if (this.mruTabs_.size <= this.maxSize_)
    { return; }
    
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