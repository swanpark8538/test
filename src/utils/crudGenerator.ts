import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs-extra"
import * as fsPromises from "fs/promises"
import { parseDDL } from "./ddlParser"
import { getTemplateContext, renderTemplate, showFileList, getFilePathForOutput } from "./codeGeneratorUtils"

// Template file mapping
interface TemplateFileInfo {
	templateFile: string
	outputPath: string
	fileName: string
}

// Get template files configuration
function getTemplateFilesConfig(context: any): TemplateFileInfo[] {
	const { tableName, packagePath } = context

	return [
		{
			templateFile: "sample-vo-template.hbs",
			outputPath: `src/main/java/${packagePath}/service/${tableName}VO.java`,
			fileName: `${tableName}VO.java`,
		},
		{
			templateFile: "sample-default-vo-template.hbs",
			outputPath: `src/main/java/${packagePath}/service/DefaultVO.java`,
			fileName: "DefaultVO.java",
		},
		{
			templateFile: "sample-mapper-interface-template.hbs",
			outputPath: `src/main/java/${packagePath}/service/impl/${tableName}Mapper.java`,
			fileName: `${tableName}Mapper.java`,
		},
		{
			templateFile: "sample-mapper-template.hbs",
			outputPath: `src/main/resources/egovframework/mapper/${tableName}_SQL.xml`,
			fileName: `${tableName}_SQL.xml`,
		},
		{
			templateFile: "sample-controller-template.hbs",
			outputPath: `src/main/java/${packagePath}/web/${tableName}Controller.java`,
			fileName: `${tableName}Controller.java`,
		},
		{
			templateFile: "sample-service-template.hbs",
			outputPath: `src/main/java/${packagePath}/service/${tableName}Service.java`,
			fileName: `${tableName}Service.java`,
		},
		{
			templateFile: "sample-service-impl-template.hbs",
			outputPath: `src/main/java/${packagePath}/service/impl/${tableName}ServiceImpl.java`,
			fileName: `${tableName}ServiceImpl.java`,
		},
		{
			templateFile: "sample-jsp-list.hbs",
			outputPath: `src/main/webapp/WEB-INF/jsp/egovframework/example/${tableName.toLowerCase()}/${tableName}List.jsp`,
			fileName: `${tableName}List.jsp`,
		},
		{
			templateFile: "sample-jsp-register.hbs",
			outputPath: `src/main/webapp/WEB-INF/jsp/egovframework/example/${tableName.toLowerCase()}/${tableName}Regist.jsp`,
			fileName: `${tableName}Regist.jsp`,
		},
		{
			templateFile: "sample-thymeleaf-list.hbs",
			outputPath: `src/main/resources/templates/${tableName.toLowerCase()}/${tableName}List.html`,
			fileName: `${tableName}List.html`,
		},
		{
			templateFile: "sample-thymeleaf-register.hbs",
			outputPath: `src/main/resources/templates/${tableName.toLowerCase()}/${tableName}Regist.html`,
			fileName: `${tableName}Regist.html`,
		},
		{
			templateFile: "sample-dao-template.hbs",
			outputPath: `src/main/java/${packagePath}/service/impl/${tableName}DAO.java`,
			fileName: `${tableName}DAO.java`,
		},
	]
}

// Read template file content
async function readTemplateFile(extensionContext: vscode.ExtensionContext, templateFileName: string): Promise<string> {
	const templatePath = path.join(extensionContext.extensionPath, "templates", "code", templateFileName)

	try {
		const content = await fs.readFile(templatePath, "utf-8")
		return content
	} catch (error) {
		console.error(`Error reading template file ${templateFileName}:`, error)
		throw new Error(`Failed to read template file: ${templateFileName}`)
	}
}

// 프로젝트 루트 경로를 가져오는 헬퍼 함수
function getWorkspaceRoot(): string | undefined {
	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		return vscode.workspace.workspaceFolders[0].uri.fsPath
	}
	return undefined
}

// 기본 패키지 경로 생성 함수
function createPackagePath(packageName: string): string {
	return packageName.replace(/\./g, "/")
}

// 템플릿 컴파일 함수 개선
function compileTemplate(templateContent: string, context: any): string {
	const Handlebars = require("handlebars")

	// Handlebars 헬퍼 등록
	registerHandlebarsHelpers()

	const template = Handlebars.compile(templateContent)
	return template(context)
}

// Handlebars 헬퍼 등록 함수
function registerHandlebarsHelpers() {
	const Handlebars = require("handlebars")

	Handlebars.registerHelper("error", function (message: any) {
		console.error(message)
		return new Handlebars.SafeString(`<span class="error">${message}</span>`)
	})

	Handlebars.registerHelper("empty", function (value: any) {
		return value === null || value === ""
	})

	Handlebars.registerHelper("eq", function (a: any, b: any) {
		return a === b
	})

	Handlebars.registerHelper("concat", function (...args: any[]) {
		return args.slice(0, -1).join("")
	})

	Handlebars.registerHelper("setVar", function (varName: any, varValue: any, options: any) {
		options.data.root[varName] = varValue
	})

	Handlebars.registerHelper("lowercase", function (str: any) {
		if (typeof str !== "string") {
			return ""
		}
		return str.toLowerCase()
	})

	Handlebars.registerHelper("unless", function (this: any, conditional: any, options: any) {
		if (!conditional) {
			return options.fn(this)
		} else {
			return options.inverse(this)
		}
	})
}

export async function generateCrudFromDDL(
	ddl: string,
	context: vscode.ExtensionContext,
	packageName?: string,
	outputPath?: string,
): Promise<void> {
	try {
		console.log("generateCrudFromDDL called with DDL:", ddl)
		console.log("Provided packageName:", packageName)
		console.log("Provided outputPath:", outputPath)

		let folderPath: string
		let finalPackageName: string

		// Use provided outputPath or prompt user to select
		if (outputPath && outputPath.trim()) {
			folderPath = outputPath.trim()
			console.log("Using provided output path:", folderPath)
		} else {
			// 프로젝트 루트를 기본값으로 설정
			const workspaceRoot = getWorkspaceRoot()
			let defaultFolder = workspaceRoot

			console.log("Workspace root:", workspaceRoot)

			const selectedFolder = await vscode.window.showOpenDialog({
				title: "Select Folder to Save Generated Files",
				canSelectFolders: true,
				canSelectFiles: false,
				canSelectMany: false,
				openLabel: "Select Folder",
				defaultUri: defaultFolder ? vscode.Uri.file(defaultFolder) : undefined,
			})

			if (!selectedFolder || selectedFolder.length === 0) {
				throw new Error("No folder selected.")
			}

			folderPath = selectedFolder[0].fsPath
			console.log("Selected folder:", folderPath)
		}

		// Use provided packageName or prompt user to enter
		if (packageName && packageName.trim()) {
			finalPackageName = packageName.trim()
			console.log("Using provided package name:", finalPackageName)
		} else {
			// 패키지 정보 입력받기
			const inputPackageName = await vscode.window.showInputBox({
				prompt: "Enter package name (e.g., com.example.project)",
				value: "com.example.project",
				validateInput: (value) => {
					if (!value || !value.includes(".")) {
						return "Please enter a valid package name (e.g., com.example.project)"
					}
					return null
				},
			})

			if (!inputPackageName) {
				throw new Error("Package name is required.")
			}
			finalPackageName = inputPackageName
		}

		const { tableName, attributes, pkAttributes } = parseDDL(ddl)
		console.log("Parsed DDL - tableName:", tableName, "attributes:", attributes.length)

		// 템플릿 컨텍스트 생성 (확장된 정보 포함)
		const templateContext = {
			...getTemplateContext(tableName, attributes, pkAttributes),
			packageName: finalPackageName,
			packagePath: createPackagePath(finalPackageName),
			author: "Generated by eGovFrame CRUD Generator",
			date: new Date().toISOString().split("T")[0],
			version: "1.0",
		}

		console.log("Template context:", JSON.stringify(templateContext, null, 2))

		const files: { filePath: string; content: string }[] = []

		// Get template files configuration
		const templateFilesConfig = getTemplateFilesConfig(templateContext)

		for (const templateInfo of templateFilesConfig) {
			try {
				console.log("Processing template:", templateInfo.templateFile)

				// Read template file content
				const templateContent = await readTemplateFile(context, templateInfo.templateFile)

				// 템플릿 컴파일
				const content = compileTemplate(templateContent, templateContext)

				// 파일 경로 생성
				const fullFilePath = path.join(folderPath, templateInfo.outputPath)
				console.log("Generated file path:", fullFilePath)

				files.push({
					filePath: fullFilePath,
					content: content,
				})
			} catch (error) {
				console.error(`Error processing template ${templateInfo.templateFile}:`, error)
			}
		}

		console.log("Generated files count:", files.length)

		// 파일 목록을 보여주고 사용자가 선택한 파일만 저장
		const selectedFilePaths = await showFileList(files)
		console.log("Selected files count:", selectedFilePaths.length)

		// 선택된 파일들 저장
		for (const file of files) {
			if (selectedFilePaths.includes(file.filePath)) {
				console.log("Creating file:", file.filePath)
				await fs.outputFile(file.filePath, file.content)

				// 생성된 파일을 에디터에서 열기 (최대 3개까지만)
				if (selectedFilePaths.indexOf(file.filePath) < 3) {
					const document = await vscode.workspace.openTextDocument(file.filePath)
					await vscode.window.showTextDocument(document)
				}
			}
		}

		if (selectedFilePaths.length > 0) {
			vscode.window.showInformationMessage(`${selectedFilePaths.length} CRUD files generated successfully!`)
		}
	} catch (error) {
		console.error("Error in generateCrudFromDDL:", error)
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
		vscode.window.showErrorMessage(`CRUD generation failed: ${errorMessage}`)
		throw error
	}
}

export async function uploadTemplates(ddl: string): Promise<void> {
	const selectedFiles = await vscode.window.showOpenDialog({
		title: "Select HBS Template Files to Upload",
		canSelectFolders: false,
		canSelectFiles: true,
		canSelectMany: true,
		filters: { "Handlebars Templates": ["hbs"], "All Files": ["*"] },
	})

	if (!selectedFiles || selectedFiles.length === 0) {
		vscode.window.showErrorMessage("No files selected.")
		return
	}

	const selectedFolderPath = path.dirname(selectedFiles[0].fsPath)

	for (const file of selectedFiles) {
		const templatePath = file.fsPath
		const outputPath = path.join(selectedFolderPath, path.basename(file.fsPath, ".hbs") + ".generated")

		try {
			const { tableName, attributes, pkAttributes } = parseDDL(ddl)
			const context = getTemplateContext(tableName, attributes, pkAttributes)
			const renderedContent = await renderTemplate(templatePath, context)
			await fs.writeFile(outputPath, renderedContent)
			vscode.window.showInformationMessage(`Custom template saved successfully to ${outputPath}`)

			// Open the newly created file in the editor
			const document = await vscode.workspace.openTextDocument(outputPath)
			await vscode.window.showTextDocument(document)
		} catch (error) {
			throw error
		}
	}
}

export async function downloadTemplateContext(ddl: string, context: any): Promise<void> {
	const selectedFolder = await vscode.window.showOpenDialog({
		title: "Select Folder to Save JSON",
		canSelectFolders: true,
		canSelectFiles: false,
		canSelectMany: false,
		openLabel: "Select Folder",
	})

	if (!selectedFolder || selectedFolder.length === 0) {
		vscode.window.showErrorMessage("No folder selected.")
		return
	}

	const folderPath = selectedFolder[0].fsPath

	try {
		const { tableName } = parseDDL(ddl)
		const jsonContent = JSON.stringify(context, null, 2)
		const outputPath = path.join(folderPath, `${tableName}_TemplateContext.json`)
		await fs.writeFile(outputPath, jsonContent)
		vscode.window.showInformationMessage(`TemplateContext JSON saved successfully to ${outputPath}`)

		// Open the newly created file in the editor
		const document = await vscode.workspace.openTextDocument(outputPath)
		await vscode.window.showTextDocument(document)
	} catch (error) {
		throw error
	}
}
