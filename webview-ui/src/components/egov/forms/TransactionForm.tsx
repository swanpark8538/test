import React, { useState, useEffect } from "react"
import { Button, TextField, RadioGroup, Select, Checkbox } from "../../ui"
import { ConfigFormData, ConfigGenerationType, FormComponentProps } from "../types/templates"
import { vscode } from "../../../utils/vscode"

const TransactionForm: React.FC<FormComponentProps> = ({ onSubmit, onCancel, template, initialData }) => {
	const [formData, setFormData] = useState<ConfigFormData>({
		generationType: ConfigGenerationType.XML,
		txtFileName: "context-transaction",
		txtTransactionName: "transactionManager",
		txtDataSourceName: "dataSource",
		txtEttMgrFactory: "entityManagerFactory",
		txtEntityPackages: "",
		cmbDialect: "org.hibernate.dialect.H2Dialect",
		txtRepositoryPackage: "",
		txtPointCutName: "requiredTx",
		txtPointCutExpression: "execution(* egovframework.sample..*Impl.*(..))",
		txtAdviceName: "txAdvice",
		txtMethodName: "*",
		chkReadOnly: false,
		chkRollbackFor: true,
		txtRollbackFor: "Exception",
		chkNoRollbackFor: false,
		txtNoRollbackFor: "RuntimeException",
		chkTimeout: false,
		txtTimeout: "20",
		cmbPropagation: "REQUIRED",
		cmbIsolation: "DEFAULT",
		...initialData,
	})
	const [selectedOutputFolder, setSelectedOutputFolder] = useState<string | null>(null)
	const [pendingFormData, setPendingFormData] = useState<ConfigFormData | null>(null)

	// Determine form type based on template webView
	const getFormType = () => {
		if (template.webView.includes("jpa")) {return "jpa"}
		if (template.webView.includes("jta")) {return "jta"}
		return "datasource"
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
			datasource: { xml: "context-transaction-datasource", java: "EgovTransactionDatasourceConfig" },
			jpa: { xml: "context-transaction-jpa", java: "EgovTransactionJpaConfig" },
			jta: { xml: "context-transaction-jta", java: "EgovTransactionJtaConfig" },
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
			{ field: "txtTransactionName" as keyof typeof formData, label: "Transaction Manager Name" },
			{ field: "txtDataSourceName" as keyof typeof formData, label: "Data Source Name" },
		]

		if (formType === "jpa") {
			requiredFields.push(
				{ field: "txtEttMgrFactory" as keyof typeof formData, label: "Entity Manager Factory Name" },
				{ field: "txtEntityPackages" as keyof typeof formData, label: "Entity Packages to Scan" },
				{ field: "txtRepositoryPackage" as keyof typeof formData, label: "Repository Package" },
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
			case "jpa":
				return "Create JPA Transaction"
			case "jta":
				return "Create JTA Transaction"
			default:
				return "Create Datasource Transaction"
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
							label="Transaction Manager Name"
							value={formData.txtTransactionName}
							onChange={(e: any) => handleInputChange("txtTransactionName", e.target.value)}
							placeholder="Enter transaction manager name"
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="Data Source Name"
							value={formData.txtDataSourceName}
							onChange={(e: any) => handleInputChange("txtDataSourceName", e.target.value)}
							placeholder="Enter data source name"
							isRequired
						/>
					</div>

					{formType === "jpa" && (
						<>
							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Entity Manager Factory Name"
									value={formData.txtEttMgrFactory}
									onChange={(e: any) => handleInputChange("txtEttMgrFactory", e.target.value)}
									placeholder="Enter entity manager factory name"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Entity Packages to Scan"
									value={formData.txtEntityPackages}
									onChange={(e: any) => handleInputChange("txtEntityPackages", e.target.value)}
									placeholder="Enter entity packages to scan"
									isRequired
								/>
							</div>

							<div style={{ marginBottom: "15px" }}>
								<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
									Dialect Name <span style={{ color: "var(--vscode-errorForeground)" }}>*</span>
								</label>
								<Select options={[]} />
							</div>

							<div style={{ marginBottom: "15px" }}>
								<TextField
									label="Repository Package"
									value={formData.txtRepositoryPackage}
									onChange={(e: any) => handleInputChange("txtRepositoryPackage", e.target.value)}
									placeholder="Enter repository package"
									isRequired
								/>
							</div>
						</>
					)}
				</div>

				<div style={{ marginBottom: "20px" }}>
					<h3 style={{ color: "var(--vscode-foreground)", marginBottom: "10px" }}>Transaction Attributes</h3>

					<div style={{ marginBottom: "15px" }}>
						<TextField
							label="Pointcut Name"
							value={formData.txtPointCutName}
							onChange={(e: any) => handleInputChange("txtPointCutName", e.target.value)}
							placeholder="Enter pointcut name"
							isRequired
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField label="Field" placeholder="Enter value" />
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField label="Field" placeholder="Enter value" />
					</div>

					<div style={{ marginBottom: "15px" }}>
						<TextField label="Field" placeholder="Enter value" />
					</div>

					<div style={{ marginBottom: "15px" }}>
						<Checkbox
							label="Read-Only"
							checked={formData.chkReadOnly}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleInputChange("chkReadOnly", e.target.checked)
							}
						/>
					</div>

					<div style={{ marginBottom: "15px" }}>
						<Checkbox
							label="Rollback For Exception"
							checked={formData.chkRollbackFor}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleInputChange("chkRollbackFor", e.target.checked)
							}
						/>
					</div>

					{formData.chkRollbackFor && (
						<div style={{ marginBottom: "15px" }}>
							<TextField label="Field" placeholder="Enter value" />
						</div>
					)}

					<div style={{ marginBottom: "15px" }}>
						<Checkbox
							label="No Rollback For Exception"
							checked={formData.chkNoRollbackFor}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleInputChange("chkNoRollbackFor", e.target.checked)
							}
						/>
					</div>

					{formData.chkNoRollbackFor && (
						<div style={{ marginBottom: "15px" }}>
							<TextField label="Field" placeholder="Enter value" />
						</div>
					)}

					<div style={{ marginBottom: "15px" }}>
						<Checkbox
							label="Set Timeout"
							checked={formData.chkTimeout}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								handleInputChange("chkTimeout", e.target.checked)
							}
						/>
					</div>

					{formData.chkTimeout && (
						<div style={{ marginBottom: "15px" }}>
							<TextField label="Field" placeholder="Enter value" />
						</div>
					)}

					<div style={{ marginBottom: "15px" }}>
						<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
							Propagation
						</label>
						<Select options={[]} />
					</div>

					<div style={{ marginBottom: "15px" }}>
						<label style={{ display: "block", marginBottom: "5px", color: "var(--vscode-foreground)" }}>
							Isolation
						</label>
						<Select options={[]} />
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

export default TransactionForm
