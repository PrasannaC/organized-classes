// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cheerio from 'cheerio'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('organized-classes.oc', (): void => {

		let documentText: string
		let activeEditor = vscode.window.activeTextEditor

		if (activeEditor) {
			// check if anything is selected
			let selectionCount = activeEditor.selections[0].start.compareTo(activeEditor.selections[0].end)

			// if not, select entire document
			if (selectionCount == 0) {
				const lastline = activeEditor.document.lineCount - 1;
				const lastCharInLastLine = activeEditor.document.lineAt(lastline).text.length;
				const anchor = new vscode.Position(0, 0);
				const active = new vscode.Position(lastline, lastCharInLastLine);
				const wholeDocumentSelection = new vscode.Selection(anchor, active);
				activeEditor.selection = wholeDocumentSelection;
			}

			// get the document text
			documentText = activeEditor.document.getText(activeEditor.selection)
			// parse the document using cheerio for easier manipulation
			const $ = cheerio.load(documentText)

			// get all HTMLElements with a class attribute
			const nodes = $('*[class]')
			nodes.each((index: number, el: cheerio.Element) => {
				// split the class attribute to get an array
				const classAttr = $(el).attr('class')
				if (classAttr) {
					let classNames = classAttr.trim().split(' ')
					classNames.sort()
					$(el).attr('class', classNames.join(' ').trimStart())
				}
			})

			activeEditor.edit((editBuilder) => {
				if (activeEditor)
					editBuilder.replace(activeEditor.selection, $.html())
			})
		}

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
