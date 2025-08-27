import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost" | "destructive"
	size?: "sm" | "md" | "lg"
	isLoading?: boolean
	leftIcon?: React.ReactNode
	rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	(
		{ variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon, className, children, disabled, ...props },
		ref,
	) => {
		const theme = useVSCodeTheme()

		const baseStyles = [
			"inline-flex items-center justify-center gap-2",
			"font-medium transition-all duration-200",
			"border border-transparent",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
			"disabled:opacity-50 disabled:pointer-events-none",
			"cursor-pointer",
		]

		const variantStyles = {
			primary: ["text-white", "hover:opacity-90 active:opacity-95"],
			secondary: [
				"border-gray-300 dark:border-gray-600",
				"hover:border-gray-400 dark:hover:border-gray-500",
				"active:bg-gray-50 dark:active:bg-gray-800",
			],
			ghost: ["hover:opacity-80", "active:opacity-90"],
			destructive: ["bg-red-600 text-white", "hover:bg-red-700 active:bg-red-800"],
		}

		const sizeStyles = {
			sm: ["h-8 px-3 text-sm", theme.borderRadius.sm],
			md: ["h-9 px-4 text-sm", theme.borderRadius.sm],
			lg: ["h-10 px-6 text-base", theme.borderRadius.md],
		}

		return (
			<button
				ref={ref}
				className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
				style={{
					backgroundColor:
						variant === "primary"
							? theme.colors.buttonBackground
							: variant === "secondary"
								? theme.colors.buttonSecondaryBackground
								: variant === "ghost"
									? "transparent"
									: undefined,
					color:
						variant === "primary"
							? theme.colors.buttonForeground
							: variant === "secondary"
								? theme.colors.buttonSecondaryForeground
								: variant === "ghost"
									? theme.colors.foreground
									: undefined,
					borderRadius: theme.borderRadius.sm,
					fontSize: size === "lg" ? theme.fontSize.md : theme.fontSize.sm,
				}}
				disabled={disabled || isLoading}
				{...props}>
				{isLoading ? (
					<div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
				) : (
					<>
						{leftIcon && <span className="flex items-center">{leftIcon}</span>}
						{children}
						{rightIcon && <span className="flex items-center">{rightIcon}</span>}
					</>
				)}
			</button>
		)
	},
)

Button.displayName = "Button"
