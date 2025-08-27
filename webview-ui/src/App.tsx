import EgovView from "./components/egov/EgovView"
import { useExtensionState } from "./context/ExtensionStateContext"
import { Providers } from "./Providers"

const AppContent = () => {
	const { showEgov, egovTab, hideEgov } = useExtensionState()

	// Always show EgovView as the main and only interface
	return <EgovView initialTab={egovTab} onDone={hideEgov} />
}

const App = () => {
	return (
		<Providers>
			<AppContent />
		</Providers>
	)
}

export default App
