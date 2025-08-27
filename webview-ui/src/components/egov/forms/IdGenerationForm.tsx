import React, { useState, useEffect } from "react"
import { Button, TextField, TextArea, Select, RadioGroup, ProgressRing, Link, Divider } from "../../ui"
import { ConfigFormData, ConfigGenerationType, FormComponentProps } from "../types/templates"
import { vscode } from "../../../utils/vscode"

const IdGenerationForm: React.FC<FormComponentProps> = ({ onSubmit, onCancel, template, initialData }) => {
	const [formData, setFormData] = useState<ConfigFormData>({
		generationType: ConfigGenerationType.XML,
		txtFileName: "context-idgn-sequence",
		txtIdServiceName: "sequenceIdGnrService",
		txtDataSourceName: "dataSource",
		txtQuery: "SELECT SEQ_NO.NEXTVAL FROM DUAL",
		rdoIdType: "Base",
		txtTableName: "COMTECOPSEQ",
		txtNextIdColumnName: "NEXT_ID",
		txtBlockSize: "10",
		...initialData,
	})
	const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null)
	const [pendingFormData, setPendingFormData] = useState<ConfigFormData | null>(null)

	// Determine form type based on template webView
	const getFormType = () => {
		if (template.webView.includes("sequence")) {return "sequence"}
		if (template.webView.includes("table")) {return "table"}
		if (template.webView.includes("uuid")) {return "uuid"}
		return "sequence"
	}

	const formType = getFormType()

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
		const baseNames = {
			sequence: { xml: "context-idgn-sequence", java: "EgovIdgnSequenceConfig" },
			table: { xml: "context-idgn-table", java: "EgovIdgnTableConfig" },
			uuid: { xml: "context-idgn-uuid", java: "EgovIdgnUuidConfig" },
		}

		const names = baseNames[formType as keyof typeof baseNames]
		switch (type) {
			case ConfigGenerationType.XML:
				return names.xml
			case ConfigGenerationType.JAVA_CONFIG:
				return names.java
			default:
				return names.xml
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
			{ field: "txtIdServiceName" as keyof typeof formData, label: "Bean Name" },
		]

		if (formType === "sequence" || formType === "table") {
			requiredFields.push({ field: "txtDataSourceName" as keyof typeof formData, label: "Data Source Name" })
		}

		if (formType === "sequence") {
			requiredFields.push({ field: "txtQuery" as keyof typeof formData, label: "Query" })
		}

		if (formType === "table") {
			requiredFields.push(
				{ field: "txtTableName" as keyof typeof formData, label: "Table Name" },
				{ field: "txtNextIdColumnName" as keyof typeof formData, label: "Next ID Column Name" },
				{ field: "txtBlockSize" as keyof typeof formData, label: "Block Size" },
			)
		}

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

	const getFormTitle = () => {
		switch (formType) {
			case "sequence":
				return "Create Sequence ID Generation"
			case "table":
				return "Create Table ID Generation"
			case "uuid":
				return "Create UUID Generation"
			default:
				return "Create ID Generation"
		}
	}

	return (
		<div style={{ padding: "20px", maxWidth: "600px" }}>
			<h2 style={{ color: "var(--vscode-foreground)", marginBottom: "20px" }}>{getFormTitle()}</h2>

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
							label="Bean Name"
							value={formData.txtIdServiceName}
							onChange={(e: any) => handleInputChange("txtIdServiceName", e.target.value)}
							placeholder="Enter bean name"
							isRequired
						/>
					</div>

					{(formType === "sequence" || formType === "table") && (
						<div style={{ marginBottom: "15px" }}>
							<TextField
								label="Data Source Name"
								value={formData.txtDataSourceName}
								onChange={(e: any) => handleInputChange("txtDataSourceName", e.target.value)}
								placeholder="Enter data source name"
								isRequired
							/>
						</div>
					)}

					{formType === "sequence" && (
						<div style={{ marginBottom: "15px" }}>
							<TextField
								label="Query"
								value={formData.txtQuery}
								onChange={(e: any) => handleInputChange("txtQuery", e.target.value)}
								placeholder="Enter query"
								isRequired
							/>
						</div>
					)}

					{formType === "table" && (
						<>
							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Table Name"
									value={formData.txtTableName}
									onChange={(e: any) => handleInputChange("txtTableName", e.target.value)}
									placeholder="Enter table name"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Next ID Column Name"
									value={formData.txtNextIdColumnName}
									onChange={(e: any) => handleInputChange("txtNextIdColumnName", e.target.value)}
									placeholder="Enter next id column name"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Block Size"
									value={formData.txtBlockSize}
									onChange={(e: any) => handleInputChange("txtBlockSize", e.target.value)}
									placeholder="Enter block size"
									isRequired
								/>
							</div>
						</>
					)}

					{(formType === "sequence" || formType === "table") && (
						<div style={{ marginBottom: "15px" }}>
							<RadioGroup
								label="Type"
								name="idType"
								value={formData.rdoIdType}
								onChange={(value: string) => handleInputChange("rdoIdType", value)}
								options={[
									{ value: "BigDecimal", label: "BigDecimal" },
									{ value: "Base", label: "Default" },
								]}
							/>
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

export default IdGenerationForm
