import { useState, useEffect } from "react"
import { Button, TextField, TextArea, Select, RadioGroup, ProgressRing, Link, Divider } from "../../ui"
import { ConfigGenerationType, ConfigFormData } from "../types/templates"
import { vscode } from "../../../utils/vscode"

interface LoggingFormProps {
	onSubmit: (data: ConfigFormData) => void
	onCancel: () => void
	loggingType?: "console" | "file" | "rollingFile"
}

const LoggingForm: React.FC<LoggingFormProps> = ({ onSubmit, onCancel, loggingType = "console" }) => {
	const getDefaultFileName = (type: ConfigGenerationType) => {
		switch (loggingType) {
			case "console":
				return type === ConfigGenerationType.XML ? "logback-console" : "EgovLoggingConsoleConfig"
			case "file":
				return type === ConfigGenerationType.XML ? "logback-file" : "EgovLoggingFileConfig"
			case "rollingFile":
				return type === ConfigGenerationType.XML ? "logback-rollingFile" : "EgovLoggingRollingFileConfig"
			default:
				return "logback-console"
		}
	}

	const [formData, setFormData] = useState({
		generationType: ConfigGenerationType.XML,
		txtFileName: getDefaultFileName(ConfigGenerationType.XML),
		txtAppenderName: "CONSOLE",
		txtLevel: "INFO",
		txtPattern: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n",
		txtLoggerName: "egovframework",
		txtLoggerLevel: "DEBUG",
	})
	const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null)
	const [pendingFormData, setPendingFormData] = useState<ConfigFormData | null>(null)

	// Message listener for folder selection response
	useEffect(() => {
		console.log("LoggingForm: Setting up message listener")

		const handleMessage = (event: any) => {
			console.log("LoggingForm: Received message:", event.data)
			const message = event.data
			if (message.type === "selectedOutputFolder") {
				console.log("LoggingForm: Received selectedOutputFolder:", message.text)
				setSelectedOutputFolder(message.text)
				// If we have pending form data, submit it now
				if (pendingFormData) {
					console.log("LoggingForm: Submitting with pending data:", pendingFormData)
					onSubmit({
						...pendingFormData,
						outputFolder: message.text,
					})
					setPendingFormData(null)
				} else {
					console.log("LoggingForm: No pending form data")
				}
			}
		}

		window.addEventListener("message", handleMessage)
		return () => {
			console.log("LoggingForm: Cleaning up message listener")
			window.removeEventListener("message", handleMessage)
		}
	}, [pendingFormData, onSubmit])

	const handleGenerationTypeChange = (type: ConfigGenerationType) => {
		setFormData((prev) => ({
			...prev,
			generationType: type,
			txtFileName: getDefaultFileName(type),
		}))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log("LoggingForm handleSubmit called")
		console.log("Form data:", formData)

		// Validate required fields
		const requiredFields = [
			{ field: "txtFileName" as keyof typeof formData, label: "File Name" },
			{ field: "txtAppenderName" as keyof typeof formData, label: "Appender Name" },
			{ field: "txtPattern" as keyof typeof formData, label: "Log Pattern" },
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

	const getFormTitle = () => {
		switch (loggingType) {
			case "console":
				return "Create Console Appender"
			case "file":
				return "Create File Appender"
			case "rollingFile":
				return "Create Rolling File Appender"
			default:
				return "Create Logging Configuration"
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
							{ value: ConfigGenerationType.YAML, label: "YAML" },
							{ value: ConfigGenerationType.PROPERTIES, label: "Properties" },
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
							label="Appender Name"
							value={formData.txtAppenderName}
							placeholder="Enter appender name"
							onChange={(e: any) => handleInputChange("txtAppenderName", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<Select
							label="Log Level"
							value={formData.txtLevel}
							onChange={(e: any) => handleInputChange("txtLevel", e.target.value)}
							options={[
								{ value: "TRACE", label: "TRACE" },
								{ value: "DEBUG", label: "DEBUG" },
								{ value: "INFO", label: "INFO" },
								{ value: "WARN", label: "WARN" },
								{ value: "ERROR", label: "ERROR" },
							]}
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="Log Pattern"
							value={formData.txtPattern}
							placeholder="Enter log pattern"
							onChange={(e: any) => handleInputChange("txtPattern", e.target.value)}
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="Logger Name"
							value={formData.txtLoggerName}
							placeholder="Enter logger name"
							onChange={(e: any) => handleInputChange("txtLoggerName", e.target.value)}
						/>
					</div>

					<div style={{ marginBottom: "20px" }}>
						<Select
							label="Logger Level"
							value={formData.txtLoggerLevel}
							onChange={(e: any) => handleInputChange("txtLoggerLevel", e.target.value)}
							options={[
								{ value: "TRACE", label: "TRACE" },
								{ value: "DEBUG", label: "DEBUG" },
								{ value: "INFO", label: "INFO" },
								{ value: "WARN", label: "WARN" },
								{ value: "ERROR", label: "ERROR" },
							]}
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

export default LoggingForm
