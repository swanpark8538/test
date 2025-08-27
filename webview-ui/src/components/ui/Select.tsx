import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface SelectOption {
	value: string
	label: string
	disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
	label?: string
	error?: string
	hint?: string
	options: SelectOption[]
	placeholder?: string
	isRequired?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	({ label, error, hint, options, placeholder, isRequired, className, id, ...props }, ref) => {
		const theme = useVSCodeTheme()
		const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`

		const baseSelectStyles = [
			"w-full px-3 py-2 pr-8",
			"border transition-colors duration-200",
			"focus:outline-none focus:ring-2 focus:ring-offset-0",
			"disabled:opacity-50 disabled:cursor-not-allowed",
			"appearance-none cursor-pointer",
		]

		const getSelectStyles = () => ({
			backgroundColor: theme.colors.inputBackground,
			color: theme.colors.inputForeground,
			borderColor: error ? "#f87171" : theme.colors.inputBorder,
			borderRadius: theme.borderRadius.sm,
			fontSize: theme.fontSize.sm,
		})

		const getFocusStyles = () => ({
			"--tw-ring-color": theme.colors.focusBorder,
			borderColor: theme.colors.inputBorderFocus,
		})

		return (
			<div className={cn("space-y-1", className)}>
				{label && (
					<label htmlFor={selectId} className="block text-sm font-medium" style={{ color: theme.colors.foreground }}>
						{label}
						{isRequired && <span className="text-red-500 ml-1">*</span>}
					</label>
				)}

				<div className="relative">
					<select
						ref={ref}
						id={selectId}
						className={cn(baseSelectStyles, error && "border-red-500 focus:border-red-500 focus:ring-red-500")}
						style={{
							...getSelectStyles(),
							backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
							backgroundPosition: "right 8px center",
							backgroundRepeat: "no-repeat",
							backgroundSize: "16px",
						}}
						{...props}>
						{placeholder && (
							<option value="" disabled>
								{placeholder}
							</option>
						)}
						{options.map((option) => (
							<option key={option.value} value={option.value} disabled={option.disabled}>
								{option.label}
							</option>
						))}
					</select>
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

Select.displayName = "Select"
