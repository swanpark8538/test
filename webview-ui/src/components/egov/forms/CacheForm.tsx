import React, { useState, useEffect } from "react"
import { Button, TextField, RadioGroup, Select, Checkbox } from "../../ui"
import { ConfigFormData, ConfigGenerationType, FormComponentProps } from "../types/templates"
import { vscode } from "../../../utils/vscode"

const CacheForm: React.FC<FormComponentProps> = ({ onSubmit, onCancel, template, initialData }) => {
	const [currentPage, setCurrentPage] = useState(1)
	const [formData, setFormData] = useState<ConfigFormData>({
		generationType: ConfigGenerationType.XML,
		txtFileName: "ehcache-default",
		txtDiskStore: "user.dir/second",
		txtDftMaxElements: "10000",
		txtDftEternal: "false",
		txtDftIdelTime: "120",
		txtDftLiveTime: "120",
		txtDftOverfow: "true",
		txtDftDiskPersistence: "true",
		txtDftDiskExpiry: "120",
		txtCacheName: "",
		txtMaxElements: "100",
		txtEternal: "false",
		txtIdleTime: "360",
		txtLiveTime: "1000",
		txtOverflowToDisk: "false",
		txtDiskPersistent: "false",
		cboMemoryPolicy: "LRU",
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
				// If we have pending form data, submit it now
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
				return "context-ehcache"
			case ConfigGenerationType.JAVA_CONFIG:
				return "EgovEhcacheConfig"
			default:
				return "ehcache-default"
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
			{ field: "txtDiskStore" as keyof typeof formData, label: "Disk Store Path" },
			{ field: "txtDftMaxElements" as keyof typeof formData, label: "Default Cache Max Elements" },
			{ field: "txtDftIdelTime" as keyof typeof formData, label: "Default Cache Idle Time" },
			{ field: "txtDftLiveTime" as keyof typeof formData, label: "Default Cache Live Time" },
			{ field: "txtDftDiskExpiry" as keyof typeof formData, label: "Default Cache Disk Expiry" },
		]

		if (currentPage === 2) {
			requiredFields.push(
				{ field: "txtCacheName" as keyof typeof formData, label: "Cache Name" },
				{ field: "txtMaxElements" as keyof typeof formData, label: "Max Elements" },
				{ field: "txtIdleTime" as keyof typeof formData, label: "Idle Time" },
				{ field: "txtLiveTime" as keyof typeof formData, label: "Live Time" },
			)
		}

		const missingFields = requiredFields.filter(({ field }) => !formData[field]?.toString().trim())

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
			<h2 style={{ color: "var(--vscode-foreground)", marginBottom: "20px" }}>Set Default Cache</h2>

			<form onSubmit={handleSubmit}>
				{currentPage === 1 && (
					<div>
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
							<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Generation File</h3>
							<TextField
								label="File Name"
								value={formData.txtFileName}
								onChange={(e) => handleInputChange("txtFileName", e.target.value)}
								placeholder="Enter file name"
								isRequired
							/>
						</div>

						<div style={{ marginBottom: "20px" }}>
							<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Configuration</h3>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Disk Store Path"
									value={formData.txtDiskStore}
									onChange={(e) => handleInputChange("txtDiskStore", e.target.value)}
									placeholder="Enter disk store path"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Default Cache Max Elements"
									value={formData.txtDftMaxElements}
									onChange={(e) => handleInputChange("txtDftMaxElements", e.target.value)}
									placeholder="Enter default cache max elements"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Default Cache Eternal <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Default Cache Idle Time (sec)"
									value={formData.txtDftIdelTime}
									onChange={(e) => handleInputChange("txtDftIdelTime", e.target.value)}
									placeholder="Enter default cache idle time (sec)"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Default Cache Live Time (sec)"
									value={formData.txtDftLiveTime}
									onChange={(e) => handleInputChange("txtDftLiveTime", e.target.value)}
									placeholder="Enter default cache live time (sec)"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Default Cache Overflow to Disk{" "}
									<span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Default Cache Disk Persistent{" "}
									<span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "20px" }}>
								<TextField
									label="Default Cache Disk Expiry (sec)"
									value={formData.txtDftDiskExpiry}
									onChange={(e) => handleInputChange("txtDftDiskExpiry", e.target.value)}
									placeholder="Enter default cache disk expiry (sec)"
									isRequired
								/>
							</div>
						</div>

						<div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
							<Button variant="secondary" onClick={onCancel}>
								Cancel
							</Button>
							<Button onClick={() => setCurrentPage(2)}>Next</Button>
						</div>
					</div>
				)}

				{currentPage === 2 && (
					<div>
						<div style={{ marginBottom: "20px" }}>
							<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Set Custom Cache</h3>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Cache Name"
									value={formData.txtCacheName}
									onChange={(e) => handleInputChange("txtCacheName", e.target.value)}
									placeholder="Enter cache name"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Max Elements"
									value={formData.txtMaxElements}
									onChange={(e) => handleInputChange("txtMaxElements", e.target.value)}
									placeholder="Enter max elements"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Eternal <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Idle Time (sec)"
									value={formData.txtIdleTime}
									onChange={(e) => handleInputChange("txtIdleTime", e.target.value)}
									placeholder="Enter idle time (sec)"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Live Time (sec)"
									value={formData.txtLiveTime}
									onChange={(e) => handleInputChange("txtLiveTime", e.target.value)}
									placeholder="Enter live time (sec)"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Overflow to Disk <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Disk Persistent <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "20px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Memory Store Eviction Policy <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>
						</div>

						<div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
							<Button variant="secondary" onClick={() => setCurrentPage(1)}>
								Previous
							</Button>
							<Button variant="secondary" onClick={onCancel}>
								Cancel
							</Button>
							<Button type="submit" variant="primary">
								Generate
							</Button>
						</div>
					</div>
				)}
			</form>
		</div>
	)
}

export default CacheForm
