import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs-extra"
import * as Handlebars from "handlebars"

// Template configuration interface
export interface TemplateConfig {
	displayName: string
	templateFolder: string
	templateFile: string
	webView: string
	fileNameProperty: string
	javaConfigTemplate?: string
	yamlTemplate?: string
	propertiesTemplate?: string
}

// Form data interface
export interface ConfigFormData {
	[key: string]: any
	txtFileName: string
	generationType: string
}

// Register basic Handlebars helpers
Handlebars.registerHelper("eq", function (a: any, b: any) {
	return a === b
})

Handlebars.registerHelper("ne", function (a: any, b: any) {
	return a !== b
})

Handlebars.registerHelper("capitalize", function (str: string) {
	if (!str) {
		return ""
	}
	return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Render template with context data
 */
export async function renderTemplate(templateFilePath: string, context: any): Promise<string> {
	// Get default package name from settings
	const defaultPackageName = vscode.workspace
		.getConfiguration("egovframe")
		.get<string>("defaultPackageName", "egovframework.example.sample")

	// Enrich context with default values
	const enrichedContext = {
		...context,
		defaultPackageName,
	}

	try {
		let template = await fs.readFile(templateFilePath, "utf-8")

		// Handle #parse directives (simple include mechanism)
		const parseRegex = /#parse\("(.+)"\)/g
		let match
		while ((match = parseRegex.exec(template)) !== null) {
			const includeFilePath = path.join(path.dirname(templateFilePath), match[1])
			if (await fs.pathExists(includeFilePath)) {
				const includeTemplate = await fs.readFile(includeFilePath, "utf-8")
				template = template.replace(match[0], includeTemplate)
			}
		}

		const compiledTemplate = Handlebars.compile(template)
		return compiledTemplate(enrichedContext)
	} catch (error) {
		console.error("Error rendering template:", error)
		throw new Error(`Failed to render template: ${error instanceof Error ? error.message : String(error)}`)
	}
}

/**
 * Generate configuration file
 */
export async function generateFile(
	data: ConfigFormData,
	context: vscode.ExtensionContext,
	templateFolder: string,
	templateFile: string,
	outputFolderPath: string,
	fileNameProperty: string,
	fileExtension: string,
): Promise<void> {
	try {
		console.log("generateFile called with:")
		console.log("- templateFolder:", templateFolder)
		console.log("- templateFile:", templateFile)
		console.log("- fileNameProperty:", fileNameProperty)
		console.log("- data:", data)

		// Build template path - use only templates path
		const templatePath = path.join(context.extensionPath, "templates", "config", templateFolder, templateFile)

		console.log("- using templates path:", templatePath)
		console.log("- templates path exists:", await fs.pathExists(templatePath))

		if (!(await fs.pathExists(templatePath))) {
			console.error("Template file not found")
			throw new Error(`Template file not found: ${templateFile} in folder ${templateFolder}`)
		}

		console.log("- using template path:", templatePath)

		const content = await renderTemplate(templatePath, data)
		console.log("- template rendered, content length:", content.length)

		let fileName = data[fileNameProperty] || "default_filename"
		if (!fileName.endsWith(`.${fileExtension}`)) {
			fileName += `.${fileExtension}`
		}

		const outputPath = path.join(outputFolderPath, fileName)
		console.log("- output path:", outputPath)

		// Ensure output directory exists
		await fs.ensureDir(path.dirname(outputPath))

		await fs.writeFile(outputPath, content, "utf-8")
		console.log("- file written successfully")

		vscode.window.showInformationMessage(`${fileExtension.toUpperCase()} file created: ${outputPath}`)

		// Open the generated file
		try {
			const document = await vscode.workspace.openTextDocument(outputPath)
			await vscode.window.showTextDocument(document)
			console.log("- file opened in editor")
		} catch (error) {
			console.warn("Could not open generated file:", error)
		}
	} catch (error) {
		console.error("Error generating file:", error)
		throw error
	}
}

/**
 * Get output folder path
 */
async function getOutputPath(): Promise<string> {
	// Try to get current workspace folder
	const workspaceFolders = vscode.workspace.workspaceFolders
	if (workspaceFolders && workspaceFolders.length > 0) {
		return workspaceFolders[0].uri.fsPath
	}

	// If no workspace, prompt user to select folder
	const folderUri = await vscode.window.showOpenDialog({
		canSelectFolders: true,
		canSelectFiles: false,
		canSelectMany: false,
		openLabel: "Select folder to generate config files",
	})

	if (!folderUri || folderUri.length === 0) {
		throw new Error("No output folder selected")
	}

	return folderUri[0].fsPath
}

/**
 * Main function to generate configuration file
 */
export async function generateConfigFile(
	template: TemplateConfig,
	formData: ConfigFormData,
	context: vscode.ExtensionContext,
	outputFolderPath?: string,
): Promise<void> {
	try {
		console.log("generateConfigFile called with:")
		console.log("- template:", template)
		console.log("- formData:", formData)
		console.log("- context.extensionPath:", context.extensionPath)
		console.log("- outputFolderPath:", outputFolderPath)

		const finalOutputPath = outputFolderPath || (await getOutputPath())
		console.log("- finalOutputPath:", finalOutputPath)

		// Determine which template and extension to use based on generation type
		let templateFile: string
		let fileExtension: string

		console.log("- generationType:", formData.generationType)

		switch (formData.generationType) {
			case "xml":
				templateFile = template.templateFile
				fileExtension = "xml"
				break
			case "javaConfig":
				if (!template.javaConfigTemplate) {
					throw new Error("Java config template not available for this configuration type")
				}
				templateFile = template.javaConfigTemplate
				fileExtension = "java"
				break
			case "yaml":
				if (!template.yamlTemplate) {
					throw new Error("YAML template not available for this configuration type")
				}
				templateFile = template.yamlTemplate
				fileExtension = "yaml"
				break
			case "properties":
				if (!template.propertiesTemplate) {
					throw new Error("Properties template not available for this configuration type")
				}
				templateFile = template.propertiesTemplate
				fileExtension = "properties"
				break
			default:
				templateFile = template.templateFile
				fileExtension = "xml"
		}

		console.log("- templateFile:", templateFile)
		console.log("- fileExtension:", fileExtension)

		await generateFile(
			formData,
			context,
			template.templateFolder,
			templateFile,
			finalOutputPath,
			template.fileNameProperty,
			fileExtension,
		)
	} catch (error) {
		console.error("Config generation failed:", error)
		throw error
	}
}
