import React, { useState, useEffect } from "react"
import { Button, TextField, TextArea, Select, RadioGroup, ProgressRing, Link, Divider } from "../../ui"
import { ConfigFormData, ConfigGenerationType, FormComponentProps } from "../types/templates"
import { vscode } from "../../../utils/vscode"

const PropertyForm: React.FC<FormComponentProps> = ({ onSubmit, onCancel, template, initialData }) => {
	const [formData, setFormData] = useState<ConfigFormData>({
		generationType: ConfigGenerationType.XML,
		txtFileName: "context-properties",
		txtPropertyServiceName: "propertiesService",
		rdoPropertyType: "Internal Properties",
		txtKey: "pageUnit",
		txtValue: "20",
		cboEncoding: "UTF-8",
		txtPropertyFile: "classpath*:/egovframework/egovProps/conf/config.properties",
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
				return "context-properties"
			case ConfigGenerationType.JAVA_CONFIG:
				return "EgovPropertiesConfig"
			default:
				return "context-properties"
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
			{ field: "txtPropertyServiceName" as keyof typeof formData, label: "Property Service Name" },
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

	const isInternalProperties = formData.rdoPropertyType === "Internal Properties"

	return (
		<div style={{ padding: "20px", maxWidth: "600px" }}>
			<h2 style={{ color: "var(--vscode-foreground)", marginBottom: "20px" }}>Create Property</h2>

			<form onSubmit={handleSubmit}>
				<div style={{ marginBottom: "20px" }}>
					<RadioGroup
						label="Generation Type"
						name="generationType"
						value={formData.generationType}
						onChange={(value) => handleGenerationTypeChange(value as ConfigGenerationType)}
						orientation="horizontal"
						options={[
							{ value: ConfigGenerationType.XML, label: "XML" },
							{ value: ConfigGenerationType.JAVA_CONFIG, label: "JavaConfig" },
						]}
					/>
				</div>

				<div style={{ marginBottom: "20px" }}>
					<TextField
						label="File Name"
						value={formData.txtFileName}
						placeholder="Enter file name"
						onChange={(e) => handleInputChange("txtFileName", e.target.value)}
						isRequired
					/>
				</div>

				<div style={{ marginBottom: "20px" }}>
					<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Configuration</h3>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="Property Service Name"
							value={formData.txtPropertyServiceName}
							placeholder="Enter property service name"
							onChange={(e) => handleInputChange("txtPropertyServiceName", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<RadioGroup
							label="Type"
							name="propertyType"
							value={formData.rdoPropertyType}
							onChange={(value) => handleInputChange("rdoPropertyType", value)}
							orientation="vertical"
							isRequired
							options={[
								{ value: "Internal Properties", label: "Internal Properties" },
								{ value: "External File", label: "External File" },
							]}
						/>
					</div>

					{isInternalProperties && (
						<div>
							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Key"
									value={formData.txtKey}
									placeholder="Enter key"
									onChange={(e) => handleInputChange("txtKey", e.target.value)}
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Value"
									value={formData.txtValue}
									placeholder="Enter value"
									onChange={(e) => handleInputChange("txtValue", e.target.value)}
								/>
							</div>
						</div>
					)}

					{!isInternalProperties && (
						<div>
							<div style={{ marginBottom: "15px" }}>
								<Select
									label="Encoding"
									value={formData.cboEncoding}
									onChange={(e) => handleInputChange("cboEncoding", e.target.value)}
									options={[
										{ value: "UTF-8", label: "UTF-8" },
										{ value: "ISO-8859-1", label: "ISO-8859-1" },
										{ value: "Windows-1252", label: "Windows-1252" },
									]}
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Property File Name"
									value={formData.txtPropertyFile}
									placeholder="Enter property file name"
									onChange={(e) => handleInputChange("txtPropertyFile", e.target.value)}
								/>
							</div>
						</div>
					)}
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

export default PropertyForm
