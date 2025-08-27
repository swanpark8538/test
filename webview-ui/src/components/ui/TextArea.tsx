import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	label?: string
	error?: string
	hint?: string
	isRequired?: boolean
	resize?: "none" | "vertical" | "horizontal" | "both"
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
	({ label, error, hint, isRequired, resize = "vertical", className, id, ...props }, ref) => {
		const theme = useVSCodeTheme()
		const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

		const baseTextareaStyles = [
			"w-full px-3 py-2",
			"border transition-colors duration-200",
			"focus:outline-none focus:ring-2 focus:ring-offset-0",
			"disabled:opacity-50 disabled:cursor-not-allowed",
			"placeholder:opacity-60",
			"min-h-[80px]",
		]

		const resizeStyles = {
			none: "resize-none",
			vertical: "resize-y",
			horizontal: "resize-x",
			both: "resize",
		}

		const getTextareaStyles = () => ({
			backgroundColor: "var(--vscode-input-background)",
			color: "var(--vscode-input-foreground)",
			borderColor: error ? "var(--vscode-errorBorder)" : "var(--vscode-input-border)",
			borderRadius: theme.borderRadius.sm,
			fontSize: theme.fontSize.sm,
		})

		const getFocusStyles = () => ({
			borderColor: theme.colors.inputBorderFocus,
		})

		return (
			<div className={cn("space-y-1", className)}>
				{label && (
					<label htmlFor={textareaId} className="block text-sm font-medium" style={{ color: theme.colors.foreground }}>
						{label}
						{isRequired && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				<textarea
					ref={ref}
					id={textareaId}
					className={cn(
						baseTextareaStyles,
						resizeStyles[resize],
						error && "border-red-500 focus:border-red-500 focus:ring-red-500",
					)}
					style={{
						...getTextareaStyles(),
						...props.style,
					}}
					{...props}
				/>

				{error && <p className="text-sm text-red-500">{error}</p>}

				{hint && !error && (
					<p className="text-sm" style={{ color: theme.colors.descriptionForeground }}>
						{hint}
					</p>
				)}
			</div>
		)
	},
)

TextArea.displayName = "TextArea"
