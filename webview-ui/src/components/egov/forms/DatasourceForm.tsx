import { useState, useEffect } from "react"
import { Button, TextField, Select, RadioGroup } from "../../ui"
import { ConfigGenerationType, ConfigFormData } from "../types/templates"
import { vscode } from "../../../utils/vscode"

interface DatasourceFormProps {
	onSubmit: (data: ConfigFormData) => void
	onCancel: () => void
}

const DatasourceForm: React.FC<DatasourceFormProps> = ({ onSubmit, onCancel }) => {
	const [formData, setFormData] = useState({
		generationType: ConfigGenerationType.XML,
		txtFileName: "context-datasource",
		txtDatasourceName: "dataSource",
		rdoType: "DBCP",
		txtDriver: "",
		txtUrl: "",
		txtUser: "",
		txtPasswd: "",
	})
	const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null)
	const [pendingFormData, setPendingFormData] = useState<ConfigFormData | null>(null)

	// Message listener for folder selection response
	useEffect(() => {
		console.log("DatasourceForm: Setting up message listener")

		const handleMessage = (event: any) => {
			console.log("DatasourceForm: Received message:", event.data)
			const message = event.data
			if (message.type === "selectedOutputFolder") {
				console.log("DatasourceForm: Received selectedOutputFolder:", message.text)
				setSelectedOutputFolder(message.text)
				// If we have pending form data, submit it now
				if (pendingFormData) {
					console.log("DatasourceForm: Submitting with pending data:", pendingFormData)
					onSubmit({
						...pendingFormData,
						outputFolder: message.text,
					})
					setPendingFormData(null)
				} else {
					console.log("DatasourceForm: No pending form data")
				}
			}
		}

		window.addEventListener("message", handleMessage)
		return () => {
			console.log("DatasourceForm: Cleaning up message listener")
			window.removeEventListener("message", handleMessage)
		}
	}, [pendingFormData, onSubmit])

	const handleGenerationTypeChange = (type: ConfigGenerationType) => {
		setFormData((prev) => ({
			...prev,
			generationType: type,
			txtFileName: type === ConfigGenerationType.XML ? "context-datasource" : "EgovDataSourceConfig",
		}))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("DatasourceForm handleSubmit called")
		console.log("Form data:", formData)

		// Validate required fields
		const requiredFields = [
			{ field: "txtFileName" as keyof typeof formData, label: "File Name" },
			{ field: "txtDatasourceName" as keyof typeof formData, label: "DataSource Name" },
			{ field: "rdoType" as keyof typeof formData, label: "Driver Type" },
			{ field: "txtDriver" as keyof typeof formData, label: "Driver" },
			{ field: "txtUrl" as keyof typeof formData, label: "URL" },
			{ field: "txtUser" as keyof typeof formData, label: "User" },
		]

		const missingFields = requiredFields.filter(({ field }) => !formData[field]?.trim())

		if (missingFields.length > 0) {
			const fieldNames = missingFields.map(({ label }) => label).join(", ")
			alert(`Please fill in the following required fields: ${fieldNames}`)
			return
		}

		// Check if vscode API is available
		if (!vscode) {
			console.error("VSCode API is not available")
			return
		}

		// Store form data and request folder selection
		setPendingFormData(formData)
		console.log("Pending form data set:", formData)
		console.log("Requesting folder selection...")

		try {
			vscode.postMessage({
				type: "selectOutputFolder",
			})
			console.log("Message sent successfully")
		} catch (error) {
			console.error("Error sending message:", error)
		}
	}

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }))
	}

	return (
		<div style={{ padding: "20px", maxWidth: "600px" }}>
			<h2 style={{ color: "var(--vscode-foreground)", marginBottom: "20px" }}>Create DataSource</h2>

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
							label="DataSource Name"
							value={formData.txtDatasourceName}
							placeholder="Enter datasource name"
							onChange={(e) => handleInputChange("txtDatasourceName", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<Select
							label="Driver Type"
							value={formData.rdoType}
							onChange={(e) => handleInputChange("rdoType", e.target.value)}
							isRequired
							options={[
								{ value: "DBCP", label: "DBCP" },
								{ value: "C3P0", label: "C3P0" },
								{ value: "JDBC", label: "JDBC" },
							]}
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="Driver"
							value={formData.txtDriver}
							placeholder="Enter driver class name"
							onChange={(e) => handleInputChange("txtDriver", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="URL"
							value={formData.txtUrl}
							placeholder="Enter database URL"
							onChange={(e) => handleInputChange("txtUrl", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="User"
							value={formData.txtUser}
							placeholder="Enter username"
							onChange={(e) => handleInputChange("txtUser", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<TextField
							label="Password"
							type="password"
							value={formData.txtPasswd}
							placeholder="Enter password"
							onChange={(e) => handleInputChange("txtPasswd", e.target.value)}
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

export default DatasourceForm
