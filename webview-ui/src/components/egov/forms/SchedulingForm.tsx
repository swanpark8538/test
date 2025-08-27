import React, { useState, useEffect } from "react"
import { Button, TextField, TextArea, Select, RadioGroup, ProgressRing, Link, Divider, Checkbox } from "../../ui"
import { ConfigFormData, ConfigGenerationType, FormComponentProps } from "../types/templates"
import { vscode } from "../../../utils/vscode"

const SchedulingForm: React.FC<FormComponentProps> = ({ onSubmit, onCancel, template, initialData }) => {
	const [formData, setFormData] = useState<ConfigFormData>({
		generationType: ConfigGenerationType.XML,
		txtFileName: "context-scheduling",
		txtJobName: "jobDetail",
		txtServiceClass: "",
		chkProperty: true,
		txtPropertyName: "paramSampleJob",
		txtPropertyValue: "SampleJobValue",
		txtTriggerName: "trigger",
		txtGroup: "group1",
		txtJobGroup: "group1",
		txtCronExpression: "0 0 6 * * ?",
		txtRepeatInterval: "10000",
		txtRepeatCount: "10",
		txtTargetObject: "",
		txtTargetMethod: "",
		txtSchedulerName: "scheduler",
		...initialData,
	})
	const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null)
	const [pendingFormData, setPendingFormData] = useState<ConfigFormData | null>(null)

	// Determine form type based on template webView
	const getFormType = () => {
		if (template.webView.includes("beanJob")) {return "beanJob"}
		if (template.webView.includes("methodJob")) {return "methodJob"}
		if (template.webView.includes("cronTrigger")) {return "cronTrigger"}
		if (template.webView.includes("simpleTrigger")) {return "simpleTrigger"}
		if (template.webView.includes("scheduler")) {return "scheduler"}
		return "beanJob"
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
		switch (type) {
			case ConfigGenerationType.XML:
				return "context-scheduling"
			case ConfigGenerationType.JAVA_CONFIG:
				return "EgovSchedulingConfig"
			default:
				return "context-scheduling"
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

		// Validate required fields based on form type
		const requiredFields = [{ field: "txtFileName" as keyof typeof formData, label: "File Name" }]

		if (formType === "beanJob" || formType === "methodJob") {
			requiredFields.push({ field: "txtJobName" as keyof typeof formData, label: "Job Name" })
		}

		if (formType === "beanJob") {
			requiredFields.push({ field: "txtServiceClass" as keyof typeof formData, label: "Job Class" })
		}

		if (formType === "methodJob") {
			requiredFields.push(
				{ field: "txtTargetObject" as keyof typeof formData, label: "Target Object" },
				{ field: "txtTargetMethod" as keyof typeof formData, label: "Target Method" },
			)
		}

		if (formType === "cronTrigger" || formType === "simpleTrigger") {
			requiredFields.push({ field: "txtTriggerName" as keyof typeof formData, label: "Trigger Name" })
		}

		if (formType === "cronTrigger") {
			requiredFields.push({ field: "txtCronExpression" as keyof typeof formData, label: "Cron Expression" })
		}

		if (formType === "simpleTrigger") {
			requiredFields.push({ field: "txtRepeatInterval" as keyof typeof formData, label: "Repeat Interval" })
		}

		if (formType === "scheduler") {
			requiredFields.push({ field: "txtSchedulerName" as keyof typeof formData, label: "Scheduler Name" })
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
			case "beanJob":
				return "Create Detail Bean Job"
			case "methodJob":
				return "Create Method Invoking Job"
			case "cronTrigger":
				return "Create Cron Trigger"
			case "simpleTrigger":
				return "Create Simple Trigger"
			case "scheduler":
				return "Create Scheduler"
			default:
				return "Create Scheduling Configuration"
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

					{(formType === "beanJob" || formType === "methodJob") && (
						<div style={{ marginBottom: "15px" }}>
							<TextField
								label="Job Name"
								value={formData.txtJobName}
								onChange={(e: any) => handleInputChange("txtJobName", e.target.value)}
								placeholder="Enter job name"
								isRequired
							/>
						</div>
					)}

					{formType === "beanJob" && (
						<div style={{ marginBottom: "15px" }}>
							<TextField
								label="Job Class"
								value={formData.txtServiceClass}
								onChange={(e: any) => handleInputChange("txtServiceClass", e.target.value)}
								placeholder="Enter job class"
								isRequired
							/>
						</div>
					)}

					{formType === "methodJob" && (
						<>
							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Target Object"
									value={formData.txtTargetObject}
									onChange={(e: any) => handleInputChange("txtTargetObject", e.target.value)}
									placeholder="Enter target object"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Target Method"
									value={formData.txtTargetMethod}
									onChange={(e: any) => handleInputChange("txtTargetMethod", e.target.value)}
									placeholder="Enter target method"
									isRequired
								/>
							</div>
						</>
					)}

					{(formType === "beanJob" || formType === "methodJob") && (
						<>
							<div style={{ marginBottom: "15px" }}>
								<Checkbox
									label="Add Property"
									checked={formData.chkProperty}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										handleInputChange("chkProperty", e.target.checked)
									}
								/>
							</div>

							{formData.chkProperty && (
								<>
									<div style={{ marginBottom: "15px" }}>
										<TextField
											label="Property Name"
											value={formData.txtPropertyName}
											onChange={(e: any) => handleInputChange("txtPropertyName", e.target.value)}
										/>
									</div>

									<div style={{ marginBottom: "15px" }}>
										<TextField
											label="Property Value"
											value={formData.txtPropertyValue}
											onChange={(e: any) => handleInputChange("txtPropertyValue", e.target.value)}
										/>
									</div>
								</>
							)}
						</>
					)}

					{(formType === "cronTrigger" || formType === "simpleTrigger") && (
						<>
							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Trigger Name"
									value={formData.txtTriggerName}
									onChange={(e: any) => handleInputChange("txtTriggerName", e.target.value)}
									placeholder="Enter trigger name"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Trigger Group"
									value={formData.txtGroup}
									onChange={(e: any) => handleInputChange("txtGroup", e.target.value)}
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Job Group"
									value={formData.txtJobGroup}
									onChange={(e: any) => handleInputChange("txtJobGroup", e.target.value)}
								/>
							</div>
						</>
					)}

					{formType === "cronTrigger" && (
						<div style={{ marginBottom: "15px" }}>
							<TextField
								label="Cron Expression"
								value={formData.txtCronExpression}
								onChange={(e: any) => handleInputChange("txtCronExpression", e.target.value)}
								placeholder="Enter cron expression"
								isRequired
							/>
						</div>
					)}

					{formType === "simpleTrigger" && (
						<>
							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Repeat Interval"
									value={formData.txtRepeatInterval}
									onChange={(e: any) => handleInputChange("txtRepeatInterval", e.target.value)}
									placeholder="Enter repeat interval"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Repeat Count"
									value={formData.txtRepeatCount}
									onChange={(e: any) => handleInputChange("txtRepeatCount", e.target.value)}
								/>
							</div>
						</>
					)}

					{formType === "scheduler" && (
						<div style={{ marginBottom: "15px" }}>
							<TextField
								label="Scheduler Name"
								value={formData.txtSchedulerName}
								onChange={(e: any) => handleInputChange("txtSchedulerName", e.target.value)}
								placeholder="Enter scheduler name"
								isRequired
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

export default SchedulingForm
