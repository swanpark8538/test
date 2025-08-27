import React from "react"
import { cn } from "../../utils/cn"
import { useVSCodeTheme } from "./theme"

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
	variant?: "default" | "muted"
	size?: "sm" | "md" | "lg"
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
	({ variant = "default", size = "md", className, children, ...props }, ref) => {
		const theme = useVSCodeTheme()

		const baseStyles = [
			"transition-colors duration-200",
			"hover:underline",
			"focus:outline-none focus:ring-2 focus:ring-offset-2",
			"cursor-pointer",
		]

		const sizeStyles = {
			sm: "text-sm",
			md: "text-base",
			lg: "text-lg",
		}

		const getVariantStyles = () => {
			if (variant === "muted") {
				return {
					color: theme.colors.descriptionForeground,
				}
			}
			return {
				color: theme.colors.buttonBackground,
			}
		}

		return (
			<a
				ref={ref}
				className={cn(baseStyles, sizeStyles[size], className)}
				style={
					{
						...getVariantStyles(),
					} as React.CSSProperties
				}
				{...props}>
				{children}
			</a>
		)
	},
)

Link.displayName = "Link"
