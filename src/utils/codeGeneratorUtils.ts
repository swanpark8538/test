import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs-extra"
import * as Handlebars from "handlebars"

// 데이터베이스 컬럼의 정보를 담는 인터페이스
export interface Column {
	ccName: string // camelCase name
	columnName: string // original column name
	isPrimaryKey: boolean
	pcName: string // PascalCase name
	dataType: string // SQL data type
	javaType: string // Java type
}

// 템플릿 렌더링에 필요한 컨텍스트 정보를 담는 인터페이스
export interface TemplateContext {
	namespace: string
	resultMapId: string
	resultMapType: string
	tableName: string
	attributes: Column[]
	pkAttributes: Column[]
	parameterType: string
	resultType: string
	sortOrder: string
	searchKeyword: string
	searchCondition: number
	packageName: string
	className: string
	classNameFirstCharLower: string
	author: string
	date: string
	version: string
}

// Register Handlebars helpers
function registerHandlebarsHelpers() {
	Handlebars.registerHelper("error", function (message) {
		console.error(message)
		return new Handlebars.SafeString(`<span class="error">${message}</span>`)
	})

	Handlebars.registerHelper("empty", function (value) {
		return value === null || value === ""
	})

	Handlebars.registerHelper("eq", function (a, b) {
		return a === b
	})

	Handlebars.registerHelper("concat", function (...args) {
		return args.slice(0, -1).join("")
	})

	Handlebars.registerHelper("setVar", function (varName, varValue, options) {
		options.data.root[varName] = varValue
	})

	Handlebars.registerHelper("lowercase", function (str) {
		if (typeof str !== "string") {
			return ""
		}
		return str.toLowerCase()
	})
}

// 데이터베이스의 다양한 데이터 타입을 Java의 데이터 타입으로 매핑하는 기능을 제공하는 클래스
class DatabaseDefinition {
	private readonly predefinedDataTypes: { [key: string]: string }

	constructor() {
		this.predefinedDataTypes = {
			VARCHAR: "java.lang.String",
			VARCHAR2: "java.lang.String",
			CHAR: "java.lang.String",
			TEXT: "java.lang.String",
			INT: "java.lang.Integer",
			INTEGER: "java.lang.Integer",
			NUMBER: "java.lang.Integer",
			BIGINT: "java.lang.Long",
			SMALLINT: "java.lang.Short",
			TINYINT: "java.lang.Byte",
			DECIMAL: "java.math.BigDecimal",
			NUMERIC: "java.math.BigDecimal",
			FLOAT: "java.lang.Float",
			REAL: "java.lang.Double",
			DOUBLE: "java.lang.Double",
			DATE: "java.sql.Date",
			TIME: "java.sql.Time",
			DATETIME: "java.util.Date",
			TIMESTAMP: "java.sql.Timestamp",
			BOOLEAN: "java.lang.Boolean",
			BIT: "java.lang.Boolean",
			MEDIUMTEXT: "java.lang.String",
		}
	}

	public getPredefinedDataTypeDefinition(dataType: string): string {
		return this.predefinedDataTypes[dataType.toUpperCase()] || "java.lang.Object"
	}
}

// renderTemplate 함수는 Handlebars를 사용하여 템플릿을 렌더링한다.
export async function renderTemplate(templateFilePath: string, context: TemplateContext): Promise<string> {
	registerHandlebarsHelpers()
	const template = await fs.readFile(templateFilePath, "utf-8")
	const compiledTemplate = Handlebars.compile(template)
	return compiledTemplate(context)
}

// DatabaseDefinition 클래스를 이용해 데이터베이스 데이터 타입을 Java 타입으로 변환한다.
export function getJavaClassName(dataType: string): string {
	const databaseDefinition = new DatabaseDefinition()
	return databaseDefinition.getPredefinedDataTypeDefinition(dataType)
}

// getFilePathForOutput 함수는 생성된 파일의 경로를 반환한다.
export function getFilePathForOutput(folderPath: string, tableName: string, fileName: string): string {
	const baseJavaPath = path.join(folderPath, "src", "main", "java")
	const defaultPackageName = vscode.workspace
		.getConfiguration("egovframeInitializr")
		.get<string>("defaultPackageName", "egovframework.example.sample")
	const packagePath = defaultPackageName.replace(/\./g, path.sep)
	let outputPath = path.join(folderPath, fileName)

	if (fs.existsSync(baseJavaPath)) {
		if (fileName.endsWith("_Mapper.xml")) {
			outputPath = path.join(folderPath, "src", "main", "resources", "mappers", fileName)
		} else if (fileName.endsWith("Controller.java")) {
			outputPath = path.join(baseJavaPath, packagePath, "web", fileName)
		} else if (fileName.endsWith("Service.java") || fileName.endsWith("VO.java") || fileName.endsWith("DefaultVO.java")) {
			outputPath = path.join(baseJavaPath, packagePath, "service", fileName)
		} else if (fileName.endsWith("ServiceImpl.java") || fileName.endsWith("Mapper.java") || fileName.endsWith("DAO.java")) {
			outputPath = path.join(baseJavaPath, packagePath, "service", "impl", fileName)
		} else if (fileName.endsWith(".jsp")) {
			outputPath = path.join(folderPath, "src", "main", "webapp", "views", fileName)
		} else if (fileName.endsWith(".html")) {
			outputPath = path.join(folderPath, "src", "main", "resources", "templates", "thymeleaf", fileName)
		}
	}

	return outputPath
}

// showFileList 함수는 생성된 파일 목록을 사용자에게 보여주고, 생성할 파일을 선택하도록 한다.
export async function showFileList(files: { filePath: string; content: string }[]) {
	const quickPickItems = files.map((file) => ({
		label: path.basename(file.filePath),
		description: file.filePath.replace(vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "", ""),
		filePath: file.filePath,
		picked: true,
	}))

	const selectedItems = await vscode.window.showQuickPick(quickPickItems, {
		canPickMany: true,
		placeHolder: "Select the files to be generated",
	})

	if (!selectedItems) {
		vscode.window.showErrorMessage("No files selected.")
		return []
	}

	return selectedItems.map((item) => item.filePath)
}

// generates a context object for the template based on the provided tableName, attributes, and pkAttributes
export function getTemplateContext(tableName: string, attributes: Column[], pkAttributes: Column[]): TemplateContext {
	const defaultPackageName = vscode.workspace
		.getConfiguration("egovframeInitializr")
		.get<string>("defaultPackageName", "egovframework.example.sample")

	return {
		namespace: `${defaultPackageName}.service.impl.${tableName}Mapper`,
		resultMapId: `${tableName}Result`,
		resultMapType: `${defaultPackageName}.service.${tableName}VO`,
		tableName,
		attributes,
		pkAttributes,
		parameterType: `${defaultPackageName}.service.${tableName}VO`,
		resultType: "egovMap",
		sortOrder: "SORT_ORDR",
		searchKeyword: "",
		searchCondition: 0,
		packageName: defaultPackageName,
		className: tableName,
		classNameFirstCharLower: `${tableName[0].toLowerCase()}${tableName.slice(1)}`,
		author: "author",
		date: new Date().toISOString().split("T")[0],
		version: "1.0.0",
	}
}
