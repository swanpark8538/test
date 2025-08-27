import React, { useState, useEffect } from "react"
import { Button, TextField, TextArea, Select, RadioGroup, ProgressRing, Link, Divider } from "../../ui"
import { TemplateConfig, GroupedTemplates, ConfigFormData } from "../types/templates"
import { loadTemplates } from "../utils/templateUtils"
import FormFactory from "../forms/FormFactory"
import { vscode } from "../../../utils/vscode"

const ConfigView: React.FC = () => {
	const [templates, setTemplates] = useState<TemplateConfig[]>([])
	const [groupedTemplates, setGroupedTemplates] = useState<GroupedTemplates>({})
	const [selectedCategory, setSelectedCategory] = useState<string>("")
	const [selectedSubcategory, setSelectedSubcategory] = useState<string>("")
	const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null)
	const [currentView, setCurrentView] = useState<"list" | "form">("list")
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const initializeTemplates = () => {
			try {
				setLoading(true)
				const loadedTemplates = loadTemplates()
				console.log("Loaded templates:", loadedTemplates)
				setTemplates(loadedTemplates)

				// Group templates by category and subcategory
				const grouped: GroupedTemplates = {}
				loadedTemplates.forEach((template) => {
					const [category, subcategory] = template.displayName.split(" > ")
					if (category && subcategory) {
						if (!grouped[category]) {
							grouped[category] = {}
						}
						grouped[category][subcategory] = template
					}
				})

				console.log("Grouped templates:", grouped)
				setGroupedTemplates(grouped)
				setError(null)
			} catch (err) {
				console.error("Failed to load templates:", err)
				setError("Failed to load templates. Please try again.")
			} finally {
				setLoading(false)
			}
		}

		initializeTemplates()
	}, [])

	const handleCategoryChange = (category: string) => {
		console.log("Category selected:", category)
		setSelectedCategory(category)
		setSelectedSubcategory("")
		setSelectedTemplate(null)
	}

	const handleSubcategoryChange = (subcategory: string) => {
		console.log("Subcategory selected:", subcategory)
		setSelectedSubcategory(subcategory)

		if (selectedCategory && subcategory && groupedTemplates[selectedCategory]) {
			const template = groupedTemplates[selectedCategory][subcategory]
			if (template) {
				setSelectedTemplate(template)
				console.log("Template selected:", template)
			}
		}
	}

	const handleConfigureClick = () => {
		if (selectedTemplate) {
			console.log("Opening form for template:", selectedTemplate)
			setCurrentView("form")
		}
	}

	const handleFormSubmit = (formData: ConfigFormData) => {
		console.log("Form submitted with data:", formData)
		console.log("Selected template:", selectedTemplate)

		if (!selectedTemplate) {
			console.error("No template selected")
			return
		}

		// Post message to generate config
		try {
			vscode.postMessage({
				type: "generateConfig",
				template: selectedTemplate,
				formData: formData,
			})
		} catch (error) {
			console.error("Error sending message:", error)
		}

		// Return to list view
		setCurrentView("list")
	}

	const handleFormCancel = () => {
		console.log("Form cancelled")
		setCurrentView("list")
	}

	if (loading) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<p style={{ color: "var(--vscode-foreground)" }}>Loading templates...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<p style={{ color: "var(--vscode-errorForeground)" }}>{error}</p>
				<Button onClick={() => window.location.reload()}>Retry</Button>
			</div>
		)
	}

	if (currentView === "form" && selectedTemplate) {
		return <FormFactory template={selectedTemplate} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
	}

	const categories = Object.keys(groupedTemplates)
	const subcategories = selectedCategory ? Object.keys(groupedTemplates[selectedCategory] || {}) : []

	return (
		<div style={{ padding: "20px", maxWidth: "800px" }}>
			{/* Header */}
			<div style={{ marginBottom: "20px" }}>
				<h3 style={{ color: "var(--vscode-foreground)", marginTop: 0, marginBottom: "8px" }}>
					Generate eGovFrame Configurations
				</h3>
				<p
					style={{
						fontSize: "12px",
						color: "var(--vscode-descriptionForeground)",
						margin: 0,
						marginTop: "5px",
					}}>
					Generate configuration files for eGovFrame projects. Learn more at{" "}
					<Link href="https://github.com/chris-yoon/egovframe-pack" style={{ display: "inline" }}>
						GitHub
					</Link>
				</p>
			</div>

			<div style={{ marginBottom: "20px" }}>
				<div style={{ marginBottom: "15px" }}>
					<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
						Select Category
					</label>
					<select
						value={selectedCategory}
						onChange={(e) => handleCategoryChange(e.target.value)}
						style={{
							width: "100%",
							padding: "8px 12px",
							backgroundColor: "var(--vscode-input-background)",
							color: "var(--vscode-input-foreground)",
							border: "1px solid var(--vscode-input-border)",
							borderRadius: "4px",
							fontSize: "13px",
							fontFamily: "inherit",
							outline: "none",
							appearance: "none",
							WebkitAppearance: "none",
							MozAppearance: "none",
						}}
						onFocus={(e) => {
							;(e.target as HTMLSelectElement).style.borderColor = "var(--vscode-focusBorder)"
						}}
						onBlur={(e) => {
							;(e.target as HTMLSelectElement).style.borderColor = "var(--vscode-input-border)"
						}}>
						<option value="">Choose a category...</option>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>

				{selectedCategory && (
					<div style={{ marginBottom: "15px" }}>
						<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
							Select Configuration Type
						</label>
						<select
							value={selectedSubcategory}
							onChange={(e) => handleSubcategoryChange(e.target.value)}
							style={{
								width: "100%",
								padding: "8px 12px",
								backgroundColor: "var(--vscode-input-background)",
								color: "var(--vscode-input-foreground)",
								border: "1px solid var(--vscode-input-border)",
								borderRadius: "4px",
								fontSize: "13px",
								fontFamily: "inherit",
								outline: "none",
								appearance: "none",
								WebkitAppearance: "none",
								MozAppearance: "none",
							}}
							onFocus={(e) => {
								;(e.target as HTMLSelectElement).style.borderColor = "var(--vscode-focusBorder)"
							}}
							onBlur={(e) => {
								;(e.target as HTMLSelectElement).style.borderColor = "var(--vscode-input-border)"
							}}>
							<option value="">Choose a configuration type...</option>
							{subcategories.map((subcategory) => (
								<option key={subcategory} value={subcategory}>
									{subcategory}
								</option>
							))}
						</select>
					</div>
				)}

				{selectedTemplate && (
					<div style={{ marginTop: "20px" }}>
						<Divider />
						<div
							style={{
								marginTop: "20px",
								padding: "15px",
								border: "1px solid var(--vscode-panel-border)",
								borderRadius: "4px",
							}}>
							<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Selected Configuration</h3>
							<p style={{ color: "var(--vscode-foreground)", marginBottom: "15px" }}>
								<strong>Name:</strong> {selectedTemplate.displayName}
							</p>
							<p style={{ color: "var(--vscode-foreground)", marginBottom: "15px" }}>
								<strong>Template:</strong> {selectedTemplate.templateFile}
							</p>
							<p style={{ color: "var(--vscode-foreground)", marginBottom: "15px" }}>
								<strong>Folder:</strong> {selectedTemplate.templateFolder}
							</p>
							<Button onClick={handleConfigureClick} variant="primary">
								Configure
							</Button>
						</div>
					</div>
				)}
			</div>

			{templates.length === 0 && !loading && (
				<div style={{ textAlign: "center", padding: "40px" }}>
					<p style={{ color: "var(--vscode-foreground)" }}>No templates available</p>
				</div>
			)}
		</div>
	)
}

export default ConfigView
