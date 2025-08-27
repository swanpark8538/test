import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface DividerProps {
	orientation?: "horizontal" | "vertical"
	className?: string
	text?: string
}

export const Divider: React.FC<DividerProps> = ({ orientation = "horizontal", className, text }) => {
	const theme = useVSCodeTheme()

	if (text && orientation === "horizontal") {
		return (
			<div className={cn("relative", className)}>
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t" style={{ borderColor: theme.colors.panelBorder }} />
				</div>
				<div className="relative flex justify-center">
					<span
						className="bg-inherit px-2 text-sm"
						style={{
							backgroundColor: theme.colors.background,
							color: theme.colors.descriptionForeground,
						}}>
						{text}
					</span>
				</div>
			</div>
		)
	}

	if (orientation === "vertical") {
		return <div className={cn("border-l h-full", className)} style={{ borderColor: theme.colors.panelBorder }} />
	}

	return <div className={cn("border-t w-full", className)} style={{ borderColor: theme.colors.panelBorder }} />
}

Divider.displayName = "Divider"
