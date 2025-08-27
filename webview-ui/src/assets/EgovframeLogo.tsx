import React from "react"

interface EgovCodeLogoProps {
	className?: string
	style?: React.CSSProperties
}

const EgovCodeLogo: React.FC<EgovCodeLogoProps> = ({ className, style }) => (
	<svg className={className} style={style} viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
		{/* 왼쪽 중괄호 */}
		<text
			x="19"
			y="117"
			textAnchor="middle"
			fontWeight="normal"
			fontSize="117"
			fill="white"
			fontFamily="Menlo, Consolas, 'Liberation Mono', monospace"
			dominantBaseline="middle">
			{"{"}
		</text>
		{/* 오른쪽 중괄호 */}
		<text
			x="197"
			y="117"
			textAnchor="middle"
			fontWeight="normal"
			fontSize="117"
			fill="white"
			fontFamily="Menlo, Consolas, 'Liberation Mono', monospace"
			dominantBaseline="middle">
			{"}"}
		</text>
		{/* eGov 텍스트 */}
		<text
			x="110"
			y="90"
			textAnchor="middle"
			fontWeight="bold"
			fontSize="44"
			fill="white"
			fontFamily="Arial, Helvetica, sans-serif">
			eGov
		</text>
		{/* Code 텍스트 */}
		<text
			x="110"
			y="155"
			textAnchor="middle"
			fontWeight="bold"
			fontSize="44"
			fill="white"
			fontFamily="Arial, Helvetica, sans-serif">
			Code
		</text>
	</svg>
)

export default EgovCodeLogo
