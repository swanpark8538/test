import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface ProgressRingProps {
	size?: "sm" | "md" | "lg"
	className?: string
}

export const ProgressRing: React.FC<ProgressRingProps> = ({ size = "md", className }) => {
	const theme = useVSCodeTheme()

	const sizeStyles = {
		sm: "h-4 w-4 border-2",
		md: "h-6 w-6 border-2",
		lg: "h-8 w-8 border-2",
	}

	return (
		<div
			className={cn("animate-spin rounded-full border-t-transparent", sizeStyles[size], className)}
			style={{
				borderColor: theme.colors.buttonBackground,
				borderTopColor: "transparent",
			}}
		/>
	)
}

ProgressRing.displayName = "ProgressRing"
