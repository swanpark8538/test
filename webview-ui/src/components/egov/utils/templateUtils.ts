import { TemplateConfig, GroupedTemplates } from "../types/templates"

export function loadTemplates(): TemplateConfig[] {
	// Static template data - in a real implementation, this could be loaded from a JSON file
	const templatesData: TemplateConfig[] = [
		{
			displayName: "Cache > New Cache",
			templateFolder: "cache",
			templateFile: "cache.hbs",
			webView: "cache-cache-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "cache-java.hbs",
			yamlTemplate: "",
			propertiesTemplate: "",
		},
		{
			displayName: "Datasource > New Datasource",
			templateFolder: "datasource",
			templateFile: "datasource.hbs",
			webView: "datasource-datasource-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "datasource-java.hbs",
			yamlTemplate: "",
			propertiesTemplate: "",
		},
		{
			displayName: "Transaction > New Datasource Transaction",
			templateFolder: "transaction",
			templateFile: "datasource.hbs",
			webView: "transaction-datasource-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "datasource-java.hbs",
			yamlTemplate: "",
			propertiesTemplate: "",
		},
		{
			displayName: "Transaction > New JPA Transaction",
			templateFolder: "transaction",
			templateFile: "jpa.hbs",
			webView: "transaction-jpa-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "jpa-java.hbs",
			yamlTemplate: "",
			propertiesTemplate: "",
		},
		{
			displayName: "Logging > New Console Appender",
			templateFolder: "logging",
			templateFile: "console.hbs",
			webView: "logging-console-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "console-java.hbs",
			yamlTemplate: "console-yaml.hbs",
			propertiesTemplate: "console-properties.hbs",
		},
		{
			displayName: "Logging > New File Appender",
			templateFolder: "logging",
			templateFile: "file.hbs",
			webView: "logging-file-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "file-java.hbs",
			yamlTemplate: "file-yaml.hbs",
			propertiesTemplate: "file-properties.hbs",
		},
		{
			displayName: "Logging > New Rolling File Appender",
			templateFolder: "logging",
			templateFile: "rollingFile.hbs",
			webView: "logging-rollingFile-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "rollingFile-java.hbs",
			yamlTemplate: "rollingFile-yaml.hbs",
			propertiesTemplate: "rollingFile-properties.hbs",
		},
		{
			displayName: "Property > New Property",
			templateFolder: "property",
			templateFile: "property.hbs",
			webView: "property-property-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "property-java.hbs",
			yamlTemplate: "",
			propertiesTemplate: "",
		},
		{
			displayName: "Scheduling > New Detail Bean Job",
			templateFolder: "scheduling",
			templateFile: "beanJob.hbs",
			webView: "scheduling-beanJob-form.html",
			fileNameProperty: "txtFileName",
			javaConfigTemplate: "beanJob-java.hbs",
			yamlTemplate: "",
			propertiesTemplate: "",
		},
	]

	return templatesData
}

export function groupTemplates(templates: TemplateConfig[]): GroupedTemplates {
	const grouped: GroupedTemplates = {}

	templates.forEach((template) => {
		const parts = template.displayName.split(" > ")
		if (parts.length >= 2) {
			const category = parts[0]
			const subcategory = parts[1]

			if (!grouped[category]) {
				grouped[category] = {}
			}

			grouped[category][subcategory] = template
		}
	})

	return grouped
}

export function getTemplatesByCategory(category: string): TemplateConfig[] {
	const templates = loadTemplates()
	return templates.filter((template) => template.displayName.toLowerCase().includes(category.toLowerCase()))
}
