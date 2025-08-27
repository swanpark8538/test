export interface Column {
	ccName: string // camelCase name
	columnName: string // original column name
	isPrimaryKey: boolean
	pcName: string // PascalCase name
	dataType: string // SQL data type
	javaType: string // Java type
}

export interface ParsedDDL {
	tableName: string
	attributes: Column[]
	pkAttributes: Column[]
}

// snake_case를 camelCase로 변환하는 함수
function convertToCamelCase(str: string): string {
	return str.toLowerCase().replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())
}

// camelCase를 PascalCase로 변환하는 함수
function convertCamelcaseToPascalcase(name: string): string {
	if (!name) {
		return name
	}
	return name.charAt(0).toUpperCase() + name.slice(1)
}

// 데이터베이스의 다양한 데이터 타입을 Java의 데이터 타입으로 매핑
const predefinedDataTypes: { [key: string]: string } = {
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

export function getJavaClassName(dataType: string): string {
	return predefinedDataTypes[dataType.toUpperCase()] || "java.lang.Object"
}

// DDL 파싱 함수
export function parseDDL(ddl: string): ParsedDDL {
	// 공백 정규화
	ddl = ddl.replace(/\s+/g, " ").trim()

	// 테이블 이름 추출 (백틱 처리 추가)
	const tableNameMatch = RegExp(/CREATE TABLE [`]?(\w+)[`]?/i).exec(ddl)
	if (!tableNameMatch) {
		throw new Error("Unable to parse table name from DDL")
	}
	const tableName = convertCamelcaseToPascalcase(tableNameMatch[1].toLowerCase())

	// 컬럼 정의 추출
	const columnDefinitionsMatch = RegExp(/\((.*)\)/s).exec(ddl)
	if (!columnDefinitionsMatch) {
		throw new Error("Unable to parse column definitions from DDL")
	}

	// 컬럼 정의를 개별 컬럼으로 분리
	const columnDefinitions = columnDefinitionsMatch[1]
	const columnsArray = columnDefinitions
		.split(/,(?![^(]*\))/)
		.map((column) => column.trim())
		.filter(
			(column) =>
				column && !column.startsWith("UNIQUE KEY") && !column.startsWith("KEY") && !column.startsWith("CONSTRAINT"),
		)

	const attributes: Column[] = []
	const pkAttributes: Column[] = []

	// PRIMARY KEY 제약조건 찾기
	const pkConstraintMatch = RegExp(/PRIMARY KEY\s*\(([^)]+)\)/i).exec(ddl)
	const primaryKeyColumns = pkConstraintMatch
		? pkConstraintMatch[1].split(",").map((col) => col.trim().replace(/[`"']/g, ""))
		: []

	// 각 컬럼 파싱
	columnsArray.forEach((columnDef) => {
		if (columnDef.trim().toUpperCase().startsWith("PRIMARY KEY") || columnDef.trim().toUpperCase().startsWith("COMMENT ON")) {
			return // PRIMARY KEY 정의 줄이나 COMMENT 줄은 건너뛰기
		}

		// 기본 컬럼 정보 추출 (백틱 처리 추가)
		const parts = columnDef.split(" ")
		const columnName = parts[0].replace(/[`"']/g, "") // 백틱과 따옴표 제거
		const rawDataType = parts[1] ? parts[1].toUpperCase() : ""

		// 데이터 타입에서 크기 정보 제거
		const dataType = RegExp(/^\w+/).exec(rawDataType)?.[0] ?? rawDataType

		// PRIMARY KEY 확인
		const isPrimaryKey = primaryKeyColumns.includes(columnName) || columnDef.toUpperCase().includes("PRIMARY KEY")

		// camelCase 이름 생성
		const ccName = convertToCamelCase(columnName)

		// Column 객체 생성
		const column: Column = {
			ccName,
			columnName,
			isPrimaryKey,
			pcName: convertCamelcaseToPascalcase(ccName),
			dataType,
			javaType: getJavaClassName(dataType),
		}

		attributes.push(column)
		if (isPrimaryKey) {
			pkAttributes.push(column)
		}
	})

	// 결과가 비어있는지 확인
	if (attributes.length === 0) {
		throw new Error("No valid columns found in DDL")
	}

	return { tableName, attributes, pkAttributes }
}

// DDL 유효성 검사 함수
export function validateDDL(ddl: string): boolean {
	if (!ddl) {
		return false
	}

	// CREATE TABLE 문법 확인
	if (!ddl.toUpperCase().includes("CREATE TABLE")) {
		return false
	}

	// 괄호 쌍 확인
	const openParens = (ddl.match(/\(/g) || []).length
	const closeParens = (ddl.match(/\)/g) || []).length
	if (openParens !== closeParens) {
		return false
	}

	// 최소한의 컬럼 정의 확인
	const columnRegex = /\((.*)\)/s
	const columnMatch = columnRegex.exec(ddl)
	if (!columnMatch?.[1]?.trim()) {
		return false
	}

	return true
}

// 샘플 DDL 생성 함수
export function generateSampleDDL(): string {
	return `CREATE TABLE SAMPLE_TABLE (
    ID NUMBER(10) PRIMARY KEY,
    NAME VARCHAR2(100) NOT NULL,
    EMAIL VARCHAR2(200),
    PHONE VARCHAR2(20),
    CREATED_DATE DATE DEFAULT SYSDATE,
    UPDATED_DATE DATE
);

-- Add comments
COMMENT ON TABLE SAMPLE_TABLE IS 'Sample table for CRUD generation';
COMMENT ON COLUMN SAMPLE_TABLE.ID IS 'Primary key';
COMMENT ON COLUMN SAMPLE_TABLE.NAME IS 'User name';
COMMENT ON COLUMN SAMPLE_TABLE.EMAIL IS 'Email address';`
}
