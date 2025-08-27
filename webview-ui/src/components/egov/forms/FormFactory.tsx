import React from "react"
import { TemplateConfig, FormComponentProps } from "../types/templates"
import DatasourceForm from "./DatasourceForm"
import LoggingForm from "./LoggingForm"
import CacheForm from "./CacheForm"
import PropertyForm from "./PropertyForm"
import IdGenerationForm from "./IdGenerationForm"
import SchedulingForm from "./SchedulingForm"
import TransactionForm from "./TransactionForm"
import JndiDatasourceForm from "./JndiDatasourceForm"
import EhcacheForm from "./EhcacheForm"

interface FormFactoryProps extends Omit<FormComponentProps, "template"> {
	template: TemplateConfig
}

const FormFactory: React.FC<FormFactoryProps> = ({ template, onSubmit, onCancel, initialData }) => {
	const getFormComponent = () => {
		const webView = template.webView

		// Cache forms
		if (webView.includes("cache-cache")) {
			return <CacheForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}
		if (webView.includes("cache-ehcacheConfig")) {
			return <EhcacheForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}

		// Datasource forms
		if (webView.includes("datasource-datasource")) {
			return <DatasourceForm onSubmit={onSubmit} onCancel={onCancel} />
		}
		if (webView.includes("datasource-jndiDatasource")) {
			return <JndiDatasourceForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}

		// Transaction forms
		if (webView.includes("transaction-")) {
			return <TransactionForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}

		// ID Generation forms
		if (webView.includes("id-gnr-")) {
			return <IdGenerationForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}

		// Logging forms
		if (webView.includes("logging-")) {
			const loggingType = webView.includes("console")
				? "console"
				: webView.includes("file")
					? "file"
					: webView.includes("rolling")
						? "rollingFile"
						: "console"
			return <LoggingForm loggingType={loggingType} onSubmit={onSubmit} onCancel={onCancel} />
		}

		// Property forms
		if (webView.includes("property-")) {
			return <PropertyForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}

		// Scheduling forms
		if (webView.includes("scheduling-")) {
			return <SchedulingForm template={template} onSubmit={onSubmit} onCancel={onCancel} initialData={initialData} />
		}

		// Default fallback - use Datasource form as a base
		return <DatasourceForm onSubmit={onSubmit} onCancel={onCancel} />
	}

	return <div>{getFormComponent()}</div>
}

export default FormFactory
