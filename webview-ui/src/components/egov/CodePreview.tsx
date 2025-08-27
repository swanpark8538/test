import React from "react"

// CSS 애니메이션 스타일
const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`

interface CodePreviewProps {
	previews: { [key: string]: string } | null
	selectedTemplate: string
	onTemplateChange: (template: string) => void
	isLoading: boolean
	error: string
	packageName: string
	onRequestPreview?: () => void
	isValid: boolean
	autoUpdatePreview?: boolean
	onAutoUpdateChange?: (enabled: boolean) => void
}

const CodePreview: React.FC<CodePreviewProps> = ({
	previews,
	selectedTemplate,
	onTemplateChange,
	isLoading,
	error,
	packageName,
	onRequestPreview,
	isValid,
	autoUpdatePreview,
	onAutoUpdateChange,
}) => {
	const templateOptions = [
		{ value: "vo", label: "VO 클래스" },
		{ value: "defaultVo", label: "Default VO 클래스" },
		{ value: "controller", label: "Controller 클래스" },
		{ value: "service", label: "Service 인터페이스" },
		{ value: "serviceImpl", label: "ServiceImpl 클래스" },
		{ value: "mapper", label: "MyBatis Mapper XML" },
		{ value: "mapperInterface", label: "Mapper 인터페이스" },
		{ value: "dao", label: "DAO 클래스" },
		{ value: "jspList", label: "JSP 목록 페이지" },
		{ value: "jspRegister", label: "JSP 등록 페이지" },
		{ value: "thymeleafList", label: "Thymeleaf 목록 페이지" },
		{ value: "thymeleafRegister", label: "Thymeleaf 등록 페이지" },
	]

	// 미리보기가 없고 유효한 DDL이 있는 경우 미리보기 요청 버튼 표시
	if (!previews && isValid) {
		return (
			<>
				<style>{spinAnimation}</style>
				<div
					style={{
						backgroundColor: "var(--vscode-editor-inactiveSelectionBackground)",
						padding: "15px",
						borderRadius: "4px",
						marginBottom: "20px",
					}}>
					<div style={{ marginBottom: "10px" }}>
						<h4 style={{ color: "var(--vscode-foreground)", marginBottom: "10px", marginTop: 0 }}>템플릿 미리보기</h4>
						<p
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								marginBottom: "15px",
							}}>
							미리보기를 생성하려면 아래 버튼을 클릭하세요.
						</p>

						{/* 자동 업데이트 옵션 */}
						{onAutoUpdateChange && (
							<div
								style={{
									marginBottom: "15px",
									display: "flex",
									alignItems: "center",
									gap: "8px",
								}}>
								<input
									type="checkbox"
									id="autoUpdatePreview"
									checked={autoUpdatePreview || false}
									onChange={(e) => onAutoUpdateChange(e.target.checked)}
									style={{
										margin: 0,
										cursor: "pointer",
									}}
								/>
								<label
									htmlFor="autoUpdatePreview"
									style={{
										fontSize: "12px",
										color: "var(--vscode-foreground)",
										cursor: "pointer",
										userSelect: "none",
									}}>
									DDL 변경시 자동으로 미리보기 업데이트
								</label>
							</div>
						)}

						<button
							onClick={onRequestPreview}
							style={{
								backgroundColor: "var(--vscode-button-background)",
								color: "var(--vscode-button-foreground)",
								border: "1px solid var(--vscode-button-border)",
								borderRadius: "4px",
								padding: "8px 16px",
								cursor: "pointer",
								fontSize: "13px",
								outline: "none",
							}}
							onMouseOver={(e) => {
								;(e.target as HTMLButtonElement).style.backgroundColor = "var(--vscode-button-hoverBackground)"
							}}
							onMouseOut={(e) => {
								;(e.target as HTMLButtonElement).style.backgroundColor = "var(--vscode-button-background)"
							}}>
							미리보기 생성
						</button>
					</div>
				</div>
			</>
		)
	}

	if (!previews) {
		return null
	}

	const currentPreview = previews[selectedTemplate] || ""

	return (
		<>
			<style>{spinAnimation}</style>
			<div
				style={{
					backgroundColor: "var(--vscode-editor-inactiveSelectionBackground)",
					padding: "15px",
					borderRadius: "4px",
					marginBottom: "20px",
				}}>
				<div style={{ marginBottom: "10px" }}>
					<h4 style={{ color: "var(--vscode-foreground)", marginBottom: "10px", marginTop: 0 }}>
						템플릿 미리보기
						{packageName && (
							<span
								style={{
									fontSize: "12px",
									color: "var(--vscode-descriptionForeground)",
									marginLeft: "10px",
									fontWeight: "normal",
								}}>
								(패키지: {packageName})
							</span>
						)}
					</h4>

					<select
						value={selectedTemplate}
						onChange={(e) => onTemplateChange(e.target.value)}
						style={{
							width: "100%",
							padding: "8px 12px",
							backgroundColor: "var(--vscode-input-background)",
							color: "var(--vscode-input-foreground)",
							border: "1px solid var(--vscode-input-border)",
							borderRadius: "4px",
							fontSize: "13px",
							outline: "none",
						}}
						onFocus={(e) => {
							e.target.style.borderColor = "var(--vscode-focusBorder)"
						}}
						onBlur={(e) => {
							e.target.style.borderColor = "var(--vscode-input-border)"
						}}>
						{templateOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>

				{isLoading && (
					<div
						style={{
							textAlign: "center",
							padding: "20px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						<div
							style={{
								display: "inline-block",
								width: "20px",
								height: "20px",
								border: "2px solid var(--vscode-descriptionForeground)",
								borderTop: "2px solid transparent",
								borderRadius: "50%",
								animation: "spin 1s linear infinite",
							}}></div>
						<div style={{ marginTop: "10px" }}>미리보기 생성 중...</div>
					</div>
				)}

				{error && (
					<div
						style={{
							color: "var(--vscode-errorForeground)",
							fontSize: "12px",
							padding: "10px",
							backgroundColor: "var(--vscode-inputValidation-errorBackground)",
							border: "1px solid var(--vscode-errorBorder)",
							borderRadius: "4px",
							marginBottom: "10px",
						}}>
						{error}
					</div>
				)}

				{!isLoading && currentPreview && (
					<div
						style={{
							backgroundColor: "var(--vscode-editor-background)",
							border: "1px solid var(--vscode-input-border)",
							borderRadius: "4px",
							padding: "12px",
							maxHeight: "400px",
							overflow: "auto",
						}}>
						<pre
							style={{
								margin: 0,
								fontSize: "12px",
								fontFamily: "'Consolas', 'Monaco', 'Courier New', monospace",
								color: "var(--vscode-editor-foreground)",
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
							}}>
							{currentPreview}
						</pre>
					</div>
				)}
			</div>
		</>
	)
}

export default CodePreview
