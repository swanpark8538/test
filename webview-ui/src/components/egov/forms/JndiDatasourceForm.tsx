import React, { useState, useEffect } from "react"
import { Button, TextField, RadioGroup } from "../../ui"
import { ConfigFormData, ConfigGenerationType, FormComponentProps } from "../types/templates"
import { vscode } from "../../../utils/vscode"

const JndiDatasourceForm: React.FC<FormComponentProps> = ({ onSubmit, onCancel, template, initialData }) => {
	const [formData, setFormData] = useState<ConfigFormData>({
		generationType: ConfigGenerationType.XML,
		txtFileName: "context-jndi-datasource",
		txtDatasourceName: "dataSource",
		txtJndiName: "java:comp/env/jdbc/myDataSource",
		...initialData,
	})
	const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null)
	const [pendingFormData, setPendingFormData] = useState<ConfigFormData | null>(null)

	// Message listener for folder selection response
	useEffect(() => {
		const handleMessage = (event: any) => {
			const message = event.data
			if (message.type === "selectedOutputFolder") {
				setSelectedOutputFolder(message.text)
				if (pendingFormData) {
					onSubmit({
						...pendingFormData,
						outputFolder: message.text,
					})
					setPendingFormData(null)
				}
			}
		}

		window.addEventListener("message", handleMessage)
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [pendingFormData, onSubmit])

	const getDefaultFileName = (type: ConfigGenerationType) => {
		switch (type) {
			case ConfigGenerationType.XML:
				return "context-jndi-datasource"
			case ConfigGenerationType.JAVA_CONFIG:
				return "EgovJndiDatasourceConfig"
			default:
				return "context-jndi-datasource"
		}
	}

	const handleGenerationTypeChange = (type: ConfigGenerationType) => {
		setFormData((prev) => ({
			...prev,
			generationType: type,
			txtFileName: getDefaultFileName(type),
		}))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()

		// Validate required fields
		const requiredFields = [
			{ field: "txtFileName" as keyof typeof formData, label: "File Name" },
			{ field: "txtDatasourceName" as keyof typeof formData, label: "DataSource Name" },
			{ field: "txtJndiName" as keyof typeof formData, label: "JNDI Name" },
		]

		const missingFields = requiredFields.filter(({ field }) => !formData[field]?.toString().trim())

		if (missingFields.length > 0) {
			const fieldNames = missingFields.map(({ label }) => label).join(", ")
			alert(`Please fill in the following required fields: ${fieldNames}`)
			return
		}

		if (!vscode) {
			console.error("VSCode API is not available")
			return
		}

		setPendingFormData(formData)

		try {
			vscode.postMessage({
				type: "selectOutputFolder",
			})
		} catch (error) {
			console.error("Error sending message:", error)
		}
	}

	const handleInputChange = (field: string, value: string | boolean) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<div style={{ padding: "20px", maxWidth: "600px" }}>
			<h2 style={{ color: "var(--vscode-foreground)", marginBottom: "20px" }}>Create JNDI DataSource</h2>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "20px" }}>
					<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Generation Type</h3>
					<RadioGroup
						label="Generation Type"
						name="generationType"
						value={formData.generationType}
						onChange={(value: string) => handleGenerationTypeChange(value as ConfigGenerationType)}
						orientation="horizontal"
						options={[
							{ value: ConfigGenerationType.XML, label: "XML" },
							{ value: ConfigGenerationType.JAVA_CONFIG, label: "JavaConfig" },
						]}
					/>
				</div>

				<div style={{ marginBottom: "20px" }}>
					<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Generation File</h3>
					<TextField
						label="File Name"
						value={formData.txtFileName}
						onChange={(e: any) => handleInputChange("txtFileName", e.target.value)}
						placeholder="Enter file name"
						isRequired
					/>
				</div>

				<div style={{ marginBottom: "20px" }}>
					<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Configuration</h3>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="DataSource Name"
							value={formData.txtDatasourceName}
							onChange={(e: any) => handleInputChange("txtDatasourceName", e.target.value)}
							placeholder="Enter datasource name"
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="JNDI Name"
							value={formData.txtJndiName}
							onChange={(e: any) => handleInputChange("txtJndiName", e.target.value)}
							placeholder="Enter jndi name"
							isRequired
						/>
					</div>
				</div>

				<div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
					<Button variant="secondary" onClick={onCancel}>
						Cancel
					</Button>
					<Button type="submit" variant="primary">
						Generate
					</Button>
				</div>
			</form>
		</div>
	)
}

export default JndiDatasourceForm
