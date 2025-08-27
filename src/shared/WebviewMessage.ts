export interface WebviewMessage {
	type: string
	value?: any
	template?: any
	formData?: any
	outputFolder?: string
	ddl?: string
	context?: any
	packageName?: string
	outputPath?: string
	projectConfig?: any
	method?: string
	telemetrySetting?: string
	user?: any
	grpc_request?: any
	grpc_request_cancel?: any
}
