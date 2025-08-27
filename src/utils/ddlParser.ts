import { Column, getJavaClassName } from "./codeGeneratorUtils"

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
