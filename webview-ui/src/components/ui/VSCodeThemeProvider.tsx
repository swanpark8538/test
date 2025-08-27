import React, { ReactNode } from "react"
import { VSCodeThemeContext, createVSCodeTheme } from "./theme"

export interface VSCodeThemeProviderProps {
	children: ReactNode
}

export const VSCodeThemeProvider: React.FC<VSCodeThemeProviderProps> = ({ children }) => {
	const theme = createVSCodeTheme()

	return (
		<VSCodeThemeContext.Provider value={theme}>
			<div
				className="min-h-screen transition-colors"
				style={{
					backgroundColor: theme.colors.background,
					color: theme.colors.foreground,
				}}>
				{children}
			</div>
		</VSCodeThemeContext.Provider>
	)
}
