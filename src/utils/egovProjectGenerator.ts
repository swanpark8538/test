import * as vscode from "vscode"
import * as fs from "fs-extra"
import * as path from "path"
import archiver from "archiver"
import extractZip from "extract-zip"

export interface EgovProjectTemplate {
	id: string
	name: string
	description: string
	fileName: string
	pomFile?: string
	category?: string
	tags?: string[]
	version?: string
	frameworkVersion?: string
	dependencies?: string[]
}

export interface EgovProjectConfig {
	projectName: string
	outputPath: string
	packageName: string
	template: EgovProjectTemplate
	includeSpringBoot?: boolean
	includeJPA?: boolean
	includeMyBatis?: boolean
	includeThymeleaf?: boolean
	author?: string
	description?: string
}

export interface ProjectGenerationResult {
	success: boolean
	message: string
	projectPath?: string
	error?: string
}

export async function generateEgovProject(
	config: EgovProjectConfig,
	extensionPath: string,
	progressCallback?: (message: string) => void,
): Promise<ProjectGenerationResult> {
	try {
		// Validate config
		if (!config.projectName?.trim()) {
			throw new Error("Project name is required")
		}

		if (!config.outputPath?.trim()) {
			throw new Error("Output path is required")
		}

		if (!config.template?.fileName) {
			throw new Error("Template file name is required")
		}

		// Setup paths
		const zipFilePath = path.join(extensionPath, "templates", "projects", "examples", config.template.fileName)
		const projectRoot = path.join(config.outputPath, config.projectName)

		progressCallback?.("📁 Creating project directory...")

		// Check if project directory already exists
		if (await fs.pathExists(projectRoot)) {
			throw new Error(`Project directory already exists: ${projectRoot}`)
		}

		// Check if template file exists
		if (!(await fs.pathExists(zipFilePath))) {
			throw new Error(`Template file not found: ${zipFilePath}`)
		}

		progressCallback?.("📦 Extracting template...")

		// Extract template ZIP
		await extractZip(zipFilePath, { dir: projectRoot })

		progressCallback?.("📝 Processing template files...")

		// Process template files (replace placeholders)
		await processTemplateFiles(projectRoot, config)

		// Generate POM file if needed
		if (config.template.pomFile) {
			await generatePomFile(config, projectRoot, extensionPath, progressCallback)
		}

		// Update package names in Java files
		await updatePackageNames(projectRoot, config.packageName, progressCallback)

		progressCallback?.("✅ Project generated successfully!")

		// Notify completion
		vscode.window
			.showInformationMessage(`eGovFrame project '${config.projectName}' created successfully!`, "Open Project")
			.then((selection) => {
				if (selection === "Open Project") {
					vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectRoot), true)
				}
			})

		return {
			success: true,
			message: "Project generated successfully",
			projectPath: projectRoot,
		}
	} catch (error) {
		console.error("Error generating eGovFrame project:", error)
		const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
		return {
			success: false,
			message: "Project generation failed",
			error: errorMessage,
		}
	}
}

async function processTemplateFiles(projectRoot: string, config: EgovProjectConfig): Promise<void> {
	const placeholders = {
		"{{PROJECT_NAME}}": config.projectName,
		"{{PACKAGE_NAME}}": config.packageName,
		"{{AUTHOR}}": config.author || "eGovFrame Developer",
		"{{DESCRIPTION}}": config.description || `eGovFrame project: ${config.projectName}`,
		"{{FRAMEWORK_VERSION}}": config.template.frameworkVersion || "4.3.0",
	}

	// Find all text files to process
	const textFileExtensions = [".java", ".xml", ".jsp", ".html", ".js", ".css", ".properties", ".yml", ".yaml", ".md", ".txt"]

	await processFilesRecursively(projectRoot, placeholders, textFileExtensions)
}

async function processFilesRecursively(dir: string, placeholders: Record<string, string>, extensions: string[]): Promise<void> {
	const entries = await fs.readdir(dir, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			await processFilesRecursively(fullPath, placeholders, extensions)
		} else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
			try {
				let content = await fs.readFile(fullPath, "utf8")

				// Replace placeholders
				for (const [placeholder, value] of Object.entries(placeholders)) {
					content = content.replace(new RegExp(placeholder, "g"), value)
				}

				await fs.writeFile(fullPath, content, "utf8")
			} catch (error) {
				console.warn(`Warning: Could not process file ${fullPath}:`, error)
			}
		}
	}
}

async function generatePomFile(
	config: EgovProjectConfig,
	projectRoot: string,
	extensionPath: string,
	progressCallback?: (message: string) => void,
): Promise<void> {
	try {
		progressCallback?.("📝 Generating Maven POM file...")

		const templatePath = path.join(extensionPath, "templates", "projects", "pom", config.template.pomFile!)
		const outputPath = path.join(projectRoot, "pom.xml")

		// Check if POM template exists
		if (!(await fs.pathExists(templatePath))) {
			throw new Error(`POM template not found: ${templatePath}`)
		}

		// Read POM template
		let pomContent = await fs.readFile(templatePath, "utf8")

		// Replace placeholders
		const placeholders = {
			"{{PROJECT_NAME}}": config.projectName,
			"{{PACKAGE_NAME}}": config.packageName,
			"{{DESCRIPTION}}": config.description || `eGovFrame project: ${config.projectName}`,
			"{{FRAMEWORK_VERSION}}": config.template.frameworkVersion || "4.3.0",
			"{{VERSION}}": "1.0.0",
		}

		for (const [placeholder, value] of Object.entries(placeholders)) {
			pomContent = pomContent.replace(new RegExp(placeholder, "g"), value)
		}

		// Write POM file
		await fs.writeFile(outputPath, pomContent, "utf8")

		progressCallback?.("📝 Maven POM file generated successfully!")
	} catch (error) {
		console.error("Error generating POM file:", error)
		throw error
	}
}

async function updatePackageNames(
	projectRoot: string,
	packageName: string,
	progressCallback?: (message: string) => void,
): Promise<void> {
	try {
		progressCallback?.("📦 Updating package names...")

		// Find all Java files
		const javaFiles = await findFilesByExtension(projectRoot, ".java")

		for (const javaFile of javaFiles) {
			try {
				let content = await fs.readFile(javaFile, "utf8")

				// Update package declaration
				content = content.replace(/^package\s+[\w.]+;/m, `package ${packageName};`)

				// Update import statements (if they reference the same base package)
				const packageParts = packageName.split(".")
				const basePackage = packageParts.slice(0, -1).join(".")
				content = content.replace(/import\s+egovframework\.[\w.]+;/g, (match) => {
					const importPath = match.match(/import\s+([\w.]+);/)?.[1]
					if (importPath) {
						const className = importPath.split(".").pop()
						return `import ${basePackage}.${className};`
					}
					return match
				})

				await fs.writeFile(javaFile, content, "utf8")
			} catch (error) {
				console.warn(`Warning: Could not update package in ${javaFile}:`, error)
			}
		}

		// Update directory structure to match package name
		await updateDirectoryStructure(projectRoot, packageName)

		progressCallback?.("📦 Package names updated successfully!")
	} catch (error) {
		console.error("Error updating package names:", error)
		throw error
	}
}

async function findFilesByExtension(dir: string, extension: string): Promise<string[]> {
	const files: string[] = []
	const entries = await fs.readdir(dir, { withFileTypes: true })

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name)

		if (entry.isDirectory()) {
			files.push(...(await findFilesByExtension(fullPath, extension)))
		} else if (entry.isFile() && path.extname(entry.name) === extension) {
			files.push(fullPath)
		}
	}

	return files
}

async function updateDirectoryStructure(projectRoot: string, packageName: string): Promise<void> {
	const srcMainJava = path.join(projectRoot, "src", "main", "java")

	if (!(await fs.pathExists(srcMainJava))) {
		return
	}

	// Create new package directory structure
	const packageDirs = packageName.split(".")
	const newPackageDir = path.join(srcMainJava, ...packageDirs)

	await fs.ensureDir(newPackageDir)

	// Move Java files to new package directory
	const javaFiles = await findFilesByExtension(srcMainJava, ".java")

	for (const javaFile of javaFiles) {
		const fileName = path.basename(javaFile)
		const newFilePath = path.join(newPackageDir, fileName)

		// Skip if file is already in the correct location
		if (javaFile === newFilePath) {
			continue
		}

		await fs.move(javaFile, newFilePath, { overwrite: true })
	}
}

/**
 * Open project in VSCode
 */
export async function openProjectInVSCode(projectPath: string): Promise<void> {
	try {
		await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(projectPath), true)
	} catch (error) {
		console.error("Error opening project in VSCode:", error)
		throw error
	}
}

/**
 * Start interactive project generation
 */
export async function startInteractiveProjectGeneration(context: vscode.ExtensionContext): Promise<void> {
	try {
		// Get available templates
		const templates = await getAvailableTemplates(context.extensionPath)

		if (templates.length === 0) {
			vscode.window.showErrorMessage("No project templates found")
			return
		}

		// Step 1: Select template
		const templateItems = templates.map((template) => ({
			label: template.name,
			description: template.description,
			detail: `Category: ${template.category || "General"} | File: ${template.fileName}`,
			template,
		}))

		const selectedTemplateItem = await vscode.window.showQuickPick(templateItems, {
			placeHolder: "Select a project template",
			matchOnDescription: true,
			matchOnDetail: true,
		})

		if (!selectedTemplateItem) {
			return
		}

		// Step 2: Enter project name
		const projectName = await vscode.window.showInputBox({
			prompt: "Enter project name",
			validateInput: (value) => {
				if (!value || !value.trim()) {
					return "Project name is required"
				}
				if (!/^[a-zA-Z0-9_-]+$/.test(value.trim())) {
					return "Project name can only contain letters, numbers, hyphens, and underscores"
				}
				return null
			},
		})

		if (!projectName) {
			return
		}

		// Step 3: Enter package name (if template has POM file)
		let packageName = "egovframework.example.sample"
		if (selectedTemplateItem.template.pomFile) {
			const inputPackageName = await vscode.window.showInputBox({
				prompt: "Enter Java package name (e.g., com.company.project)",
				value: packageName,
				validateInput: (value) => {
					if (!value || !value.includes(".")) {
						return "Please enter a valid package name (e.g., com.company.project)"
					}
					return null
				},
			})

			if (!inputPackageName) {
				return
			}
			packageName = inputPackageName
		}

		// Step 4: Select output directory
		const folderOptions = await vscode.window.showOpenDialog({
			canSelectFolders: true,
			canSelectFiles: false,
			canSelectMany: false,
			openLabel: "Select Output Directory",
		})

		if (!folderOptions || folderOptions.length === 0) {
			return
		}

		const outputPath = folderOptions[0].fsPath

		// Step 5: Generate project
		const config: EgovProjectConfig = {
			projectName: projectName.trim(),
			outputPath,
			packageName,
			template: selectedTemplateItem.template,
		}

		vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: "Generating eGovFrame project...",
				cancellable: false,
			},
			async (progress) => {
				const result = await generateEgovProject(config, context.extensionPath, (message) => {
					progress.report({ message })
				})

				if (result.success) {
					const selection = await vscode.window.showInformationMessage(
						`Project '${projectName}' generated successfully!`,
						"Open Project",
						"Open in New Window",
					)

					if (selection === "Open Project") {
						await openProjectInVSCode(result.projectPath!)
					} else if (selection === "Open in New Window") {
						await vscode.commands.executeCommand("vscode.openFolder", vscode.Uri.file(result.projectPath!), true)
					}
				} else {
					vscode.window.showErrorMessage(`Failed to generate project: ${result.error}`)
				}
			},
		)
	} catch (error) {
		console.error("Error in interactive project generation:", error)
		vscode.window.showErrorMessage(`Interactive generation failed: ${error}`)
	}
}

/**
 * Get available eGovFrame project templates
 */
export async function getAvailableTemplates(extensionPath: string): Promise<EgovProjectTemplate[]> {
	try {
		const templatesConfigPath = path.join(extensionPath, "templates", "templates-projects.json")

		if (await fs.pathExists(templatesConfigPath)) {
			const templatesData = await fs.readJSON(templatesConfigPath)
			return templatesData
		} else {
			// Fallback to default templates if config file not found
			return getDefaultTemplates()
		}
	} catch (error) {
		console.error("Error loading templates:", error)
		return getDefaultTemplates()
	}
}

function getDefaultTemplates(): EgovProjectTemplate[] {
	return [
		{
			id: "simple-web",
			name: "Simple Web Application",
			description: "Basic eGovFrame web application template",
			fileName: "example-template-simple.zip",
			pomFile: "simple-pom.xml",
			category: "Web Application",
			tags: ["web", "mvc", "basic"],
			frameworkVersion: "4.3.0",
		},
		{
			id: "enterprise",
			name: "Enterprise Application",
			description: "Full-featured enterprise application template",
			fileName: "example-template-enterprise.zip",
			pomFile: "enterprise-pom.xml",
			category: "Enterprise",
			tags: ["enterprise", "full-stack", "advanced"],
			frameworkVersion: "4.3.0",
		},
		{
			id: "mobile-hybrid",
			name: "Mobile Hybrid Application",
			description: "Mobile hybrid application template",
			fileName: "egovframework-all-in-one-mobile-4.3.0.zip",
			pomFile: "mobile-pom.xml",
			category: "Mobile",
			tags: ["mobile", "hybrid", "cordova"],
			frameworkVersion: "4.3.0",
		},
		{
			id: "msa-portal",
			name: "MSA Portal",
			description: "Microservices architecture portal template",
			fileName: "egovframe-msa-portal-backend.zip",
			pomFile: "msa-pom.xml",
			category: "Microservices",
			tags: ["msa", "microservices", "portal"],
			frameworkVersion: "4.3.0",
		},
		{
			id: "spring-boot",
			name: "Spring Boot Web",
			description: "Spring Boot based web application",
			fileName: "example-boot-web.zip",
			pomFile: "boot-pom.xml",
			category: "Spring Boot",
			tags: ["spring-boot", "web", "modern"],
			frameworkVersion: "4.3.0",
		},
	]
}

/**
 * Get project size information
 */
export async function getProjectSize(projectPath: string): Promise<{ files: number; size: number }> {
	try {
		const getFolderSize = require("get-folder-size")
		const size = await new Promise<number>((resolve, reject) => {
			getFolderSize(projectPath, (err: Error | null, size: number) => {
				if (err) {reject(err)}
				else {resolve(size)}
			})
		})

		const files = await countFiles(projectPath)
		return { files, size }
	} catch (error) {
		console.error("Error getting project size:", error)
		return { files: 0, size: 0 }
	}
}

async function countFiles(dir: string): Promise<number> {
	let count = 0
	try {
		const entries = await fs.readdir(dir, { withFileTypes: true })

		for (const entry of entries) {
			const fullPath = path.join(dir, entry.name)

			if (entry.isDirectory()) {
				count += await countFiles(fullPath)
			} else if (entry.isFile()) {
				count++
			}
		}
	} catch (error) {
		console.warn(`Warning: Could not read directory ${dir}:`, error)
	}

	return count
}
