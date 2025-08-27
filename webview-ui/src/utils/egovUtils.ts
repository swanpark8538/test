import { ProjectConfig } from "./projectUtils"

export interface EgovProjectGenerationRequest {
	config: ProjectConfig
	method: "form" | "command"
}

export interface EgovProjectGenerationResponse {
	success: boolean
	message: string
	projectPath?: string
	error?: string
}

export function createProjectGenerationMessage(config: ProjectConfig, method: string) {
	return {
		type: "generateProject" as const,
		projectConfig: {
			projectName: config.projectName,
			groupID: config.groupID,
			outputPath: config.outputPath,
			template: {
				displayName: config.template.displayName,
				fileName: config.template.fileName,
				pomFile: config.template.pomFile,
			},
		},
		method,
	}
}

export function createSelectOutputPathMessage() {
	return {
		type: "selectOutputPath" as const,
	}
}

export function createGenerateProjectByCommandMessage() {
	return {
		type: "generateProjectByCommand" as const,
	}
}

export function createGetWorkspacePathMessage() {
	return {
		type: "getWorkspacePath" as const,
	}
}

// Helper function to get workspace-relative path
export function getWorkspaceRelativePath(fullPath: string, workspacePath?: string): string {
	if (!workspacePath) {
		return fullPath
	}
	if (fullPath.startsWith(workspacePath)) {
		return fullPath.substring(workspacePath.length).replace(/^[\/\\]/, "")
	}
	return fullPath
}

// Helper function to validate project name for file system
export function validateFileSystemPath(path: string): boolean {
	// Check for invalid characters in file/folder names
	const invalidChars = /[<>:"|?*\x00-\x1f]/
	return !invalidChars.test(path)
}

// Generate unique project name if conflict exists
export function generateUniqueProjectName(baseName: string, existingNames: string[]): string {
	if (!existingNames.includes(baseName)) {
		return baseName
	}

	let counter = 1
	let uniqueName = `${baseName}-${counter}`
	while (existingNames.includes(uniqueName)) {
		counter++
		uniqueName = `${baseName}-${counter}`
	}
	return uniqueName
}
