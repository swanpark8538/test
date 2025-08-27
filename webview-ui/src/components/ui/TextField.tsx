import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
	error?: string
	hint?: string
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
	isRequired?: boolean
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
	({ label, error, hint, leftIcon, rightIcon, isRequired, className, id, ...props }, ref) => {
		const theme = useVSCodeTheme()
		const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

		const baseInputStyles = [
			"w-full px-3 py-2",
			"border transition-colors duration-200",
			"focus:outline-none focus:ring-2 focus:ring-offset-0",
			"disabled:opacity-50 disabled:cursor-not-allowed",
			"placeholder:opacity-60",
		]

		const getInputStyles = () => ({
			backgroundColor: theme.colors.inputBackground,
			color: theme.colors.inputForeground,
			borderColor: error ? "#f87171" : theme.colors.inputBorder,
			borderRadius: theme.borderRadius.sm,
			fontSize: theme.fontSize.sm,
		})

		const getFocusStyles = () => ({
			borderColor: theme.colors.inputBorderFocus,
		})

		return (
			<div className={cn("space-y-1", className)}>
				{label && (
					<label htmlFor={inputId} className="block text-sm font-medium" style={{ color: theme.colors.foreground }}>
						{label}
						{isRequired && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				<div className="relative">
					{leftIcon && (
						<div
							className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
							style={{ color: theme.colors.descriptionForeground }}>
							{leftIcon}
						</div>
					)}

					<input
						ref={ref}
						id={inputId}
						className={cn(
							baseInputStyles,
							leftIcon && "pl-10",
							rightIcon && "pr-10",
							error && "border-red-500 focus:border-red-500 focus:ring-red-500",
						)}
						style={getInputStyles()}
						{...props}
					/>

					{rightIcon && (
						<div
							className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
							style={{ color: theme.colors.descriptionForeground }}>
							{rightIcon}
						</div>
					)}
				</div>

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

TextField.displayName = "TextField"
