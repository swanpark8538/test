import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { EgovTabsStateProvider } from "./context/EgovTabsStateContext"
import { VSCodeThemeProvider } from "./components/ui/VSCodeThemeProvider"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<EgovTabsStateProvider>
				<VSCodeThemeProvider>{children}</VSCodeThemeProvider>
			</EgovTabsStateProvider>
		</ExtensionStateContextProvider>
	)
}
