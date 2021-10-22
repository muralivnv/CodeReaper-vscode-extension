// imports
let navigation = require('./navigation/navigation')
let quickselect = require('./quickselect/quickselect')

// main
function activate(context)
{
	navigation.register(context);
	quickselect.register(context);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}