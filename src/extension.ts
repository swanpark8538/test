import * as vscode from "vscode"
import { WebviewProvider } from "./core/webview"
import { Controller } from "./core/controller"

let outputChannel: vscode.OutputChannel

// This method is called when your extension is activated
export async function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel("eGovFrame Initializr")
	context.subscriptions.push(outputChannel)

	outputChannel.appendLine("eGovFrame Initializr extension activated")
	outputChannel.appendLine(`Registering WebviewProvider with ID: ${WebviewProvider.sideBarId}`)

	const sidebarWebview = new WebviewProvider(context, outputChannel)

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(WebviewProvider.sideBarId, sidebarWebview, {
			webviewOptions: { retainContextWhenHidden: true },
		}),
	)

	outputChannel.appendLine("WebviewProvider registered successfully")

	// Register the eGovFrame button command
	context.subscriptions.push(
		vscode.commands.registerCommand("egovframe.egovButtonClicked", async (webview: any) => {
			const openEgov = async (instance?: WebviewProvider) => {
				await instance?.controller.postMessageToWebview({
					type: "action",
					action: "egovButtonClicked",
				})

				// Send current workspace path as default output path
				const workspaceFolders = vscode.workspace.workspaceFolders
				if (workspaceFolders && workspaceFolders.length > 0) {
					const workspacePath = workspaceFolders[0].uri.fsPath
					await instance?.controller.postMessageToWebview({
						type: "currentWorkspacePath",
						text: workspacePath,
					})
				}
			}

			const isSidebar = !webview
			if (isSidebar) {
				await openEgov(WebviewProvider.getSidebarInstance())
			} else {
				for (const instance of WebviewProvider.getTabInstances()) {
					await openEgov(instance)
				}
			}
		}),
	)

	// Register the new tab command
	const openEgovInNewTab = async () => {
		const tabWebview = new WebviewProvider(context, outputChannel)
		const lastCol = Math.max(...vscode.window.visibleTextEditors.map((editor) => editor.viewColumn || 0))

		// Check if there are any visible text editors, otherwise open a new group to the right
		const hasVisibleEditors = vscode.window.visibleTextEditors.length > 0
		if (!hasVisibleEditors) {
			await vscode.commands.executeCommand("workbench.action.newGroupRight")
		}
		const targetCol = hasVisibleEditors ? Math.max(lastCol + 1, 1) : vscode.ViewColumn.Two

		const panel = vscode.window.createWebviewPanel(WebviewProvider.tabPanelId, "eGovFrame Initializr", targetCol, {
			enableScripts: true,
			retainContextWhenHidden: true,
			localResourceRoots: [context.extensionUri],
		})

		panel.iconPath = {
			light: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "egovframe.svg"),
			dark: vscode.Uri.joinPath(context.extensionUri, "assets", "icons", "egovframe.svg"),
		}

		tabWebview.resolveWebviewView(panel)
	}

	context.subscriptions.push(vscode.commands.registerCommand("egovframe.openInNewTab", openEgovInNewTab))
}

// This method is called when your extension is deactivated
export async function deactivate() {
	outputChannel.appendLine("eGovFrame Initializr extension deactivated")
}
