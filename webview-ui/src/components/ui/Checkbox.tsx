import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
	label?: string
	description?: string
	error?: string
	hint?: string
	isRequired?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ label, description, error, hint, isRequired, className, id, children, ...props }, ref) => {
		const theme = useVSCodeTheme()
		const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

		const baseCheckboxStyles = [
			"h-4 w-4 border-2 rounded transition-colors duration-200",
			"focus:outline-none focus:ring-2 focus:ring-offset-2",
			"disabled:opacity-50 disabled:cursor-not-allowed",
			"cursor-pointer",
		]

		const getCheckboxStyles = () => ({
			borderColor: error ? "#f87171" : theme.colors.inputBorder,
			backgroundColor: props.checked ? theme.colors.buttonBackground : theme.colors.inputBackground,
		})

		return (
			<div className={cn("space-y-1", className)}>
				<div className="flex items-start space-x-2">
					<div className="flex items-center h-5">
						<input
							ref={ref}
							id={checkboxId}
							type="checkbox"
							className={cn(baseCheckboxStyles, error && "border-red-500 focus:border-red-500 focus:ring-red-500")}
							style={getCheckboxStyles()}
							{...props}
						/>
					</div>
					<div className="flex-1">
						{label && (
							<label
								htmlFor={checkboxId}
								className={cn(
									"text-sm font-medium cursor-pointer",
									props.disabled && "opacity-50 cursor-not-allowed",
								)}
								style={{ color: theme.colors.foreground }}>
								{label}
								{isRequired && <span className="text-red-500 ml-1">*</span>}
							</label>
						)}
						{children && (
							<label
								htmlFor={checkboxId}
								className={cn(
									"text-sm font-medium cursor-pointer",
									props.disabled && "opacity-50 cursor-not-allowed",
								)}
								style={{ color: theme.colors.foreground }}>
								{children}
								{isRequired && <span className="text-red-500 ml-1">*</span>}
							</label>
						)}
						{description && (
							<p className="text-sm mt-1" style={{ color: theme.colors.descriptionForeground }}>
								{description}
							</p>
						)}
					</div>
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

Checkbox.displayName = "Checkbox"
