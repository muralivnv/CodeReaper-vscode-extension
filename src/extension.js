// imports
let navigation = require('./navigation/navigation')
let quickselect = require('./quickselect/quickselect')
let filejump = require('./filejump/filejump')

// main
function activate(context)
{
	navigation.register(context);
	quickselect.register(context);
	filejump.register(context);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
