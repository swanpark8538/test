import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface RadioOption {
	value: string
	label: string
	disabled?: boolean
	description?: string
}

export interface RadioGroupProps {
	label?: string
	error?: string
	hint?: string
	options: RadioOption[]
	value?: string
	onChange?: (value: string) => void
	name: string
	isRequired?: boolean
	orientation?: "horizontal" | "vertical"
	className?: string
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
	label,
	error,
	hint,
	options,
	value,
	onChange,
	name,
	isRequired,
	orientation = "vertical",
	className,
}) => {
	const theme = useVSCodeTheme()

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange?.(event.target.value)
	}

	return (
		<div className={cn("space-y-2", className)}>
			{label && (
				<label className="block text-sm font-medium" style={{ color: theme.colors.foreground }}>
					{label}
					{isRequired && <span className="text-red-500 ml-1">*</span>}
				</label>
			)}

			<div className={cn("space-y-2", orientation === "horizontal" && "flex space-x-4 space-y-0")}>
				{options.map((option) => {
					const radioId = `${name}-${option.value}`

					return (
						<div key={option.value} className="flex items-start space-x-2">
							<div className="flex items-center h-5">
								<input
									id={radioId}
									name={name}
									type="radio"
									value={option.value}
									checked={value === option.value}
									onChange={handleChange}
									disabled={option.disabled}
									className={cn(
										"h-4 w-4 border-2 rounded-full transition-colors duration-200",
										"focus:outline-none focus:ring-2 focus:ring-offset-2",
										"disabled:opacity-50 disabled:cursor-not-allowed",
										"cursor-pointer",
									)}
									style={
										{
											borderColor: theme.colors.inputBorder,
											backgroundColor:
												value === option.value
													? theme.colors.buttonBackground
													: theme.colors.inputBackground,
										} as React.CSSProperties
									}
								/>
							</div>
							<div className="flex-1">
								<label
									htmlFor={radioId}
									className={cn(
										"text-sm font-medium cursor-pointer",
										option.disabled && "opacity-50 cursor-not-allowed",
									)}
									style={{ color: theme.colors.foreground }}>
									{option.label}
								</label>
								{option.description && (
									<p className="text-sm mt-1" style={{ color: theme.colors.descriptionForeground }}>
										{option.description}
									</p>
								)}
							</div>
						</div>
					)
				})}
			</div>

			{error && <p className="text-sm text-red-500">{error}</p>}

			{hint && !error && (
				<p className="text-sm" style={{ color: theme.colors.descriptionForeground }}>
					{hint}
				</p>
			)}
		</div>
	)
}

RadioGroup.displayName = "RadioGroup"
