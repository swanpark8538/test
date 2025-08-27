import { Column } from "./ddlParser"

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

export function getTemplateContext(
	tableName: string,
	attributes: Column[],
	pkAttributes: Column[],
	packageName: string = "egovframework.example.sample",
): TemplateContext {
	return {
		namespace: `${packageName}.service.impl.${tableName}Mapper`,
		resultMapId: `${tableName}Result`,
		resultMapType: `${packageName}.service.${tableName}VO`,
		tableName,
		attributes,
		pkAttributes,
		parameterType: `${packageName}.service.${tableName}VO`,
		resultType: "egovMap",
		sortOrder: "SORT_ORDR",
		searchKeyword: "",
		searchCondition: 0,
		packageName,
		className: tableName,
		classNameFirstCharLower: `${tableName[0].toLowerCase()}${tableName.slice(1)}`,
		author: "author",
		date: new Date().toISOString().split("T")[0],
		version: "1.0.0",
	}
}
