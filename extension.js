// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

function jsonToBean(obj,name){
	let upName = name.replace(/^\S/, s => s.toUpperCase());
	let result = `class ${upName} extends BaseBean { \n`;
	let subClasses = [];
	let initName = `   ${upName}(Map<String,dynamic> json) : super(json){\n`;
	let jsonFunc = "   Map<String, dynamic> get json {\n      var result = Map<String, dynamic>();\n";
	for (const key in obj) {
		if (obj.hasOwnProperty(key)) {
			const element = obj[key];
			if (element.constructor === String){
				result += `   String ${key};\n`;
				initName += `      this.${key}=json["${key}"];\n`
				jsonFunc += `      result["${key}"]=this.${key};\n`;
			}else if (element.constructor === Number) {
				result += `   int ${key};\n`;
				initName += `      this.${key}=json["${key}"];\n`
				jsonFunc += `      result["${key}"]=this.${key};\n`;
			}else if (element.constructor === Object) {
				let subName = upName + key.replace(/^\S/, s => s.toUpperCase());
				result += `   ${subName} ${key};\n`;
				initName += `      this.${key}=${subName}(json["${key}"]);\n`
				jsonFunc += `      result["${key}"]=this.${key}.json;\n`;
				let temp = jsonToBean(element,subName);
				subClasses.push(temp);
			}else if (element.constructor === Array && element.length > 0){
				let one = element[0];
				if (one.constructor === Object) {
					let subName = upName + key.replace(/^\S/, s => s.toUpperCase());
					let temp = jsonToBean(one,subName);
					subClasses.push(temp);
					result += `   List<${subName}> ${key};\n`
					initName += `      this.${key}=json["${key}"].map((e)=>${subName}(e)).toList();\n`
					jsonFunc += `      result["${key}"]=this.${key}.map((e)=>e.json).toList();\n`;
				}else{
					result += `   List ${key};\n`
					initName += `      this.${key}=json["${key}"]);\n`
					jsonFunc += `      result["${key}"]=this.${key};\n`;
				}
			}
		}
	}
	initName += "   }\n";
	result += initName;
	jsonFunc += "      return result;\n   }\n";
	result += jsonFunc;
	result += "}\n";
	for (let index = 0; index < subClasses.length; index++) {
		const element = subClasses[index];
		result += element;
	}
	return result;
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "decemberDartJsonBean" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('decemberDartJsonBean.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from dart-json-bean!');
		let old = vscode.window.activeTextEditor.document.getText();
		let obj = JSON.parse(old);
		let thePath = vscode.window.activeTextEditor.document.fileName;
		let name = thePath.substring(thePath.lastIndexOf('/') + 1);
		name = name.substring(0,name.lastIndexOf('.'));
		let result = "import '../lib/net/base_bean.dart';\n";
		result += jsonToBean(obj,name);
		vscode.window.activeTextEditor.edit(editBuilder => {
			// 从开始到结束，全量替换
			const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
			editBuilder.replace(new vscode.Range(new vscode.Position(0, 0), end), result);
		});
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
