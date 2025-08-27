export enum ConfigGenerationType {
	XML = "xml",
	YAML = "yaml",
	PROPERTIES = "properties",
	JAVA_CONFIG = "javaConfig",
}

export interface TemplateConfig {
	displayName: string
	templateFolder: string
	templateFile: string
	webView: string
	fileNameProperty: string
	javaConfigTemplate: string
	yamlTemplate: string
	propertiesTemplate: string
}

export interface GroupedTemplates {
	[category: string]: {
		[subcategory: string]: TemplateConfig
	}
}

export interface FormComponentProps {
	template: TemplateConfig
	onSubmit: (formData: ConfigFormData) => void
	onCancel: () => void
	initialData?: Partial<ConfigFormData>
}

// 확장된 ConfigFormData 인터페이스 - 모든 폼 필드 포함
export interface ConfigFormData {
	// 공통 필드
	generationType: ConfigGenerationType
	txtFileName: string
	outputFolder?: string

	// Datasource 관련
	txtDatasourceName?: string
	rdoType?: string
	txtDriver?: string
	txtUrl?: string
	txtUser?: string
	txtPasswd?: string

	// Logging 관련
	txtAppenderName?: string
	txtLevel?: string
	txtPattern?: string
	txtLoggerName?: string
	txtLoggerLevel?: string
	txtLogFileName?: string
	cboAppend?: string
	txtConversionPattern?: string

	// Cache 관련
	txtDiskStore?: string
	txtDftMaxElements?: string
	txtDftEternal?: string
	txtDftIdelTime?: string
	txtDftLiveTime?: string
	txtDftOverfow?: string
	txtDftDiskPersistence?: string
	txtDftDiskExpiry?: string
	txtCacheName?: string
	txtMaxElements?: string
	txtEternal?: string
	txtIdleTime?: string
	txtLiveTime?: string
	txtOverflowToDisk?: string
	txtDiskPersistent?: string
	cboMemoryPolicy?: string

	// Property 관련
	txtPropertyServiceName?: string
	rdoPropertyType?: string
	txtKey?: string
	txtValue?: string
	cboEncoding?: string
	txtPropertyFile?: string

	// ID Generation 관련
	txtIdServiceName?: string
	txtQuery?: string
	rdoIdType?: string
	txtTableName?: string
	txtNextIdColumnName?: string
	txtBlockSize?: string

	// Scheduling 관련
	txtJobName?: string
	txtServiceClass?: string
	chkProperty?: boolean
	txtPropertyName?: string
	txtPropertyValue?: string
	txtTriggerName?: string
	txtGroup?: string
	txtJobGroup?: string
	txtCronExpression?: string
	txtRepeatInterval?: string
	txtRepeatCount?: string
	txtTargetObject?: string
	txtTargetMethod?: string
	txtSchedulerName?: string

	// Transaction 관련
	txtTransactionName?: string
	txtDataSourceName?: string
	txtEttMgrFactory?: string
	txtEntityPackages?: string
	cmbDialect?: string
	txtRepositoryPackage?: string
	txtPointCutName?: string
	txtPointCutExpression?: string
	txtAdviceName?: string
	txtMethodName?: string
	chkReadOnly?: boolean
	chkRollbackFor?: boolean
	txtRollbackFor?: string
	chkNoRollbackFor?: boolean
	txtNoRollbackFor?: string
	chkTimeout?: boolean
	txtTimeout?: string
	cmbPropagation?: string
	cmbIsolation?: string

	// JNDI Datasource 관련
	txtJndiName?: string

	// 기타 추가 필드들
	[key: string]: any
}
