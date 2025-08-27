export interface ProjectTemplate {
	displayName: string
	fileName: string
	pomFile: string
	description?: string
	category?: string
}

export interface ProjectConfig {
	projectName: string
	groupID: string
	outputPath: string
	template: ProjectTemplate
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
	{
		displayName: "eGovFrame Web Project",
		fileName: "example-web.zip",
		pomFile: "example-web-pom.xml",
		description: "Basic eGovFrame web application project",
		category: "Web",
	},
	{
		displayName: "eGovFrame Template Project > Simple Homepage",
		fileName: "example-template-simple.zip",
		pomFile: "example-template-simple-pom.xml",
		description: "Simple homepage template with basic functionalities",
		category: "Template",
	},
	{
		displayName: "eGovFrame Template Project > Portal Site",
		fileName: "example-template-portal.zip",
		pomFile: "example-template-portal-pom.xml",
		description: "Portal site template for enterprise applications",
		category: "Template",
	},
	{
		displayName: "eGovFrame Template Project > Enterprise Business",
		fileName: "example-template-enterprise.zip",
		pomFile: "example-template-enterprise-pom.xml",
		description: "Enterprise business application template",
		category: "Template",
	},
	{
		displayName: "eGovFrame Template Project > Common All-in-one",
		fileName: "egovframework-all-in-oneAllNew_wizard.zip",
		pomFile: "egovframework-all-in-oneAllNew_wizard-pom.xml",
		description: "Comprehensive all-in-one project template",
		category: "Template",
	},
	{
		displayName: "eGovFrame Mobile Project",
		fileName: "example-mbl-web.zip",
		pomFile: "mobile-web-pom.xml",
		description: "Mobile web application project",
		category: "Mobile",
	},
	{
		displayName: "eGovFrame Mobile Template Project",
		fileName: "egovframework-all-in-one-mobile-4.3.0.zip",
		pomFile: "mobile-template-pom.xml",
		description: "Mobile template project with hybrid app support",
		category: "Mobile",
	},
	{
		displayName: "eGovFrame DeviceAPI Web Project",
		fileName: "DeviceAPI_WEBService_Guide_V4.3.0.zip",
		pomFile: "",
		description: "Device API integration web project",
		category: "Mobile",
	},
	{
		displayName: "eGovFrame Boot Web Project",
		fileName: "example-boot-web.zip",
		pomFile: "example-boot-web-pom.xml",
		description: "Spring Boot based web project",
		category: "Boot",
	},
	{
		displayName: "eGovFrame Boot Template Project > Simple Homepage (Backend)",
		fileName: "template-Web-Boot-Simple-Homepage.zip",
		pomFile: "template-Web-Boot-Simple-Homepage-pom.xml",
		description: "Spring Boot simple homepage backend",
		category: "Boot",
	},
	{
		displayName: "eGovFrame Boot Template Project > Simple Homepage (Frontend)",
		fileName: "example-template-simple-react.zip",
		pomFile: "",
		description: "React-based frontend for simple homepage",
		category: "Boot",
	},
	{
		displayName: "eGovFrame MSA Boot Template Project > Common Components (KRDS)",
		fileName: "egovframe-common-components-msa-krds.zip",
		pomFile: "",
		description: "MSA common components with KRDS integration",
		category: "MSA",
	},
	{
		displayName: "eGovFrame MSA Boot Template Project > Portal (Backend)",
		fileName: "egovframe-msa-portal-backend.zip",
		pomFile: "",
		description: "MSA portal backend services",
		category: "MSA",
	},
	{
		displayName: "eGovFrame MSA Boot Template Project > Portal (Frontend)",
		fileName: "egovframe-msa-portal-frontend.zip",
		pomFile: "",
		description: "MSA portal frontend application",
		category: "MSA",
	},
	{
		displayName: "eGovFrame Boot Batch Template Project > Scheduler (File)",
		fileName: "egovframework.rte.bat.template.sam.scheduler.zip",
		pomFile: "batch-sam-scheduler-pom.xml",
		description: "File-based batch scheduler project",
		category: "Batch",
	},
	{
		displayName: "eGovFrame Boot Batch Template Project > CommandLine (File)",
		fileName: "egovframework.rte.bat.template.sam.commandline.zip",
		pomFile: "batch-sam-commandline-pom.xml",
		description: "File-based command line batch project",
		category: "Batch",
	},
	{
		displayName: "eGovFrame Boot Batch Template Project > Web (File)",
		fileName: "egovframework.rte.bat.template.sam.web.zip",
		pomFile: "batch-sam-web-pom.xml",
		description: "File-based web batch project",
		category: "Batch",
	},
	{
		displayName: "eGovFrame Boot Batch Template Project > Scheduler (DB)",
		fileName: "egovframework.rte.bat.template.db.scheduler.zip",
		pomFile: "batch-db-scheduler-pom.xml",
		description: "Database-based batch scheduler project",
		category: "Batch",
	},
	{
		displayName: "eGovFrame Boot Batch Template Project > CommandLine (DB)",
		fileName: "egovframework.rte.bat.template.db.commandline.zip",
		pomFile: "batch-db-commandline-pom.xml",
		description: "Database-based command line batch project",
		category: "Batch",
	},
	{
		displayName: "eGovFrame Boot Batch Template Project > Web (DB)",
		fileName: "egovframework.rte.bat.template.db.web.zip",
		pomFile: "batch-db-web-pom.xml",
		description: "Database-based web batch project",
		category: "Batch",
	},
]

export const PROJECT_CATEGORIES = ["All", "Web", "Template", "Mobile", "Boot", "MSA", "Batch"]

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
	if (category === "All") {
		return PROJECT_TEMPLATES
	}
	return PROJECT_TEMPLATES.filter((template) => template.category === category)
}

export function validateProjectConfig(config: Partial<ProjectConfig>): string[] {
	const errors: string[] = []

	if (!config.projectName || config.projectName.trim() === "") {
		errors.push("Project name is required")
	} else if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(config.projectName)) {
		errors.push("Project name must start with a letter and contain only letters, numbers, hyphens, and underscores")
	}

	if (config.template?.pomFile && (!config.groupID || config.groupID.trim() === "")) {
		errors.push("Group ID is required for this template")
	} else if (config.groupID && !/^[a-zA-Z][a-zA-Z0-9._-]*$/.test(config.groupID)) {
		errors.push("Group ID must be a valid Java package name")
	}

	if (!config.outputPath || config.outputPath.trim() === "") {
		errors.push("Output path is required")
	}

	if (!config.template) {
		errors.push("Template selection is required")
	}

	return errors
}

export function getDefaultGroupId(): string {
	return "egovframework.example.sample"
}

export function generateSampleProjectName(): string {
	const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
	return `egov-project-${timestamp}`
}
