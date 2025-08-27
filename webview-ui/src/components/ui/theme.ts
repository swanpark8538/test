/**
 * VSCode Theme System
 * Maps VSCode CSS variables to a structured theme object
 */

export interface VSCodeTheme {
	colors: {
		// Background colors
		background: string
		sidebarBackground: string
		editorBackground: string
		quickInputBackground: string

		// Foreground colors
		foreground: string
		editorForeground: string
		descriptionForeground: string
		placeholderForeground: string
		titlebarInactiveForeground: string

		// Button colors
		buttonBackground: string
		buttonForeground: string
		buttonHoverBackground: string
		buttonSecondaryBackground: string
		buttonSecondaryForeground: string

		// Input colors
		inputBackground: string
		inputForeground: string
		inputBorder: string
		inputBorderFocus: string

		// Interactive colors
		focusBorder: string
		listSelectionBackground: string
		listActiveForeground: string
		toolbarHoverBackground: string

		// Badge colors
		badgeBackground: string
		badgeForeground: string

		// Border colors
		sidebarBorder: string
		panelBorder: string

		// Diff colors
		diffRemovedLineBackground: string
		diffInsertedLineBackground: string
		inactiveSelectionBackground: string
	}
	spacing: {
		xs: string
		sm: string
		md: string
		lg: string
		xl: string
		xxl: string
	}
	borderRadius: {
		none: string
		sm: string
		md: string
		lg: string
	}
	fontSize: {
		xs: string
		sm: string
		md: string
		lg: string
		xl: string
	}
}

export const createVSCodeTheme = (): VSCodeTheme => ({
	colors: {
		// Background colors
		background: "var(--vscode-editor-background)",
		sidebarBackground: "var(--vscode-sideBar-background)",
		editorBackground: "var(--vscode-editor-background)",
		quickInputBackground: "var(--vscode-quickInput-background)",

		// Foreground colors
		foreground: "var(--vscode-foreground)",
		editorForeground: "var(--vscode-editor-foreground)",
		descriptionForeground: "var(--vscode-descriptionForeground)",
		placeholderForeground: "var(--vscode-input-placeholderForeground)",
		titlebarInactiveForeground: "var(--vscode-titleBar-inactiveForeground)",

		// Button colors
		buttonBackground: "var(--vscode-button-background)",
		buttonForeground: "var(--vscode-button-foreground)",
		buttonHoverBackground: "var(--vscode-button-hoverBackground)",
		buttonSecondaryBackground: "var(--vscode-button-secondaryBackground)",
		buttonSecondaryForeground: "var(--vscode-button-secondaryForeground)",

		// Input colors
		inputBackground: "var(--vscode-input-background)",
		inputForeground: "var(--vscode-input-foreground)",
		inputBorder: "var(--vscode-input-border)",
		inputBorderFocus: "var(--vscode-focusBorder)",

		// Interactive colors
		focusBorder: "var(--vscode-focusBorder)",
		listSelectionBackground: "var(--vscode-list-activeSelectionBackground)",
		listActiveForeground: "var(--vscode-quickInputList-focusForeground)",
		toolbarHoverBackground: "var(--vscode-toolbar-hoverBackground)",

		// Badge colors
		badgeBackground: "var(--vscode-badge-background)",
		badgeForeground: "var(--vscode-badge-foreground)",

		// Border colors
		sidebarBorder: "var(--vscode-sideBar-border)",
		panelBorder: "var(--vscode-panel-border)",

		// Diff colors
		diffRemovedLineBackground: "var(--vscode-diffEditor-removedLineBackground)",
		diffInsertedLineBackground: "var(--vscode-diffEditor-insertedLineBackground)",
		inactiveSelectionBackground: "var(--vscode-editor-inactiveSelectionBackground)",
	},
	spacing: {
		xs: "4px",
		sm: "8px",
		md: "12px",
		lg: "16px",
		xl: "20px",
		xxl: "24px",
	},
	borderRadius: {
		none: "0",
		sm: "2px",
		md: "4px",
		lg: "6px",
	},
	fontSize: {
		xs: "11px",
		sm: "13px",
		md: "14px",
		lg: "16px",
		xl: "18px",
	},
})

// Theme context and hook
import { createContext, useContext } from "react"

export const VSCodeThemeContext = createContext<VSCodeTheme>(createVSCodeTheme())

export const useVSCodeTheme = () => {
	const theme = useContext(VSCodeThemeContext)
	if (!theme) {
		throw new Error("useVSCodeTheme must be used within a VSCodeThemeProvider")
	}
	return theme
}
