import React, { createContext, useContext, useState, ReactNode } from "react"
import { ParsedDDL } from "../utils/ddlParser"

// CodeView 상태
interface CodeViewState {
	ddlContent: string
	parsedDDL: ParsedDDL | null
	isValid: boolean
	isLoading: boolean
	error: string
	outputPath: string
	packageName: string
	// 미리보기 관련 상태 추가
	previews: { [key: string]: string } | null
	selectedPreviewTemplate: string
	isPreviewLoading: boolean
	previewError: string
	// 자동 미리보기 업데이트 옵션
	autoUpdatePreview: boolean
}

// ProjectsView 상태
interface ProjectsViewState {
	selectedCategory: string
	selectedTemplate: any | null // ProjectTemplate from utils/projectUtils
	projectName: string
	outputPath: string
	packageName: string
	groupId: string
	artifactId: string
	version: string
	description: string
	generationMode: "form" | "command"
}

// ConfigView 상태
interface ConfigViewState {
	selectedCategory: string
	selectedTemplate: any | null
	loading: boolean
}

// 전체 탭 상태
interface EgovTabsState {
	codeView: CodeViewState
	projectsView: ProjectsViewState
	configView: ConfigViewState
}

// Context 타입
interface EgovTabsStateContextType {
	state: EgovTabsState
	updateCodeViewState: (updates: Partial<CodeViewState>) => void
	updateProjectsViewState: (updates: Partial<ProjectsViewState>) => void
	updateConfigViewState: (updates: Partial<ConfigViewState>) => void
	resetCodeViewState: () => void
	resetProjectsViewState: () => void
	resetConfigViewState: () => void
}

// 초기 상태
const initialCodeViewState: CodeViewState = {
	ddlContent: `
CREATE TABLE board (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '게시글 번호',
  title VARCHAR(200) NOT NULL COMMENT '제목',
  content TEXT COMMENT '내용',
  author VARCHAR(100) NOT NULL COMMENT '작성자',
  view_count INT DEFAULT 0 COMMENT '조회수',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '작성일시',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일시'
) COMMENT '게시판 테이블';`,
	parsedDDL: null,
	isValid: false,
	isLoading: false,
	error: "",
	outputPath: "",
	packageName: "com.example.project",
	// 미리보기 관련 초기 상태
	previews: null,
	selectedPreviewTemplate: "vo",
	isPreviewLoading: false,
	previewError: "",
	// 자동 미리보기 업데이트 옵션 (기본값: false)
	autoUpdatePreview: false,
}

const initialProjectsViewState: ProjectsViewState = {
	selectedCategory: "All",
	selectedTemplate: null,
	projectName: "",
	outputPath: "",
	packageName: "com.example",
	groupId: "com.example",
	artifactId: "demo",
	version: "1.0.0",
	description: "",
	generationMode: "form",
}

const initialConfigViewState: ConfigViewState = {
	selectedCategory: "",
	selectedTemplate: null,
	loading: false,
}

const initialState: EgovTabsState = {
	codeView: initialCodeViewState,
	projectsView: initialProjectsViewState,
	configView: initialConfigViewState,
}

// Context 생성
const EgovTabsStateContext = createContext<EgovTabsStateContextType | undefined>(undefined)

// Provider 컴포넌트
export const EgovTabsStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [state, setState] = useState<EgovTabsState>(initialState)

	const updateCodeViewState = (updates: Partial<CodeViewState>) => {
		setState((prev) => ({
			...prev,
			codeView: { ...prev.codeView, ...updates },
		}))
	}

	const updateProjectsViewState = (updates: Partial<ProjectsViewState>) => {
		setState((prev) => ({
			...prev,
			projectsView: { ...prev.projectsView, ...updates },
		}))
	}

	const updateConfigViewState = (updates: Partial<ConfigViewState>) => {
		setState((prev) => ({
			...prev,
			configView: { ...prev.configView, ...updates },
		}))
	}

	const resetCodeViewState = () => {
		setState((prev) => ({
			...prev,
			codeView: initialCodeViewState,
		}))
	}

	const resetProjectsViewState = () => {
		setState((prev) => ({
			...prev,
			projectsView: initialProjectsViewState,
		}))
	}

	const resetConfigViewState = () => {
		setState((prev) => ({
			...prev,
			configView: initialConfigViewState,
		}))
	}

	const contextValue: EgovTabsStateContextType = {
		state,
		updateCodeViewState,
		updateProjectsViewState,
		updateConfigViewState,
		resetCodeViewState,
		resetProjectsViewState,
		resetConfigViewState,
	}

	return <EgovTabsStateContext.Provider value={contextValue}>{children}</EgovTabsStateContext.Provider>
}

// Hook
export const useEgovTabsState = () => {
	const context = useContext(EgovTabsStateContext)
	if (context === undefined) {
		throw new Error("useEgovTabsState must be used within an EgovTabsStateProvider")
	}
	return context
}

// 개별 탭별 훅들
export const useCodeViewState = () => {
	const { state, updateCodeViewState, resetCodeViewState } = useEgovTabsState()
	return {
		state: state.codeView,
		updateState: updateCodeViewState,
		resetState: resetCodeViewState,
	}
}

export const useProjectsViewState = () => {
	const { state, updateProjectsViewState, resetProjectsViewState } = useEgovTabsState()
	return {
		state: state.projectsView,
		updateState: updateProjectsViewState,
		resetState: resetProjectsViewState,
	}
}

export const useConfigViewState = () => {
	const { state, updateConfigViewState, resetConfigViewState } = useEgovTabsState()
	return {
		state: state.configView,
		updateState: updateConfigViewState,
		resetState: resetConfigViewState,
	}
}
