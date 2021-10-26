// imports
let navigation = require('./navigation/navigation')
let quickselect = require('./quickselect/quickselect')
let tabjump = require('./tabjump/tabjump')
let fuzzysearch = require('./fuzzysearch/fuzzysearch')

// main
function activate(context)
{
	navigation.register(context);
	quickselect.register(context);
	tabjump.register(context);
	fuzzysearch.register(context);
}

function deactivate() 
{ fuzzysearch.deactivate(); }

module.exports = {
	activate,
	deactivate
}
