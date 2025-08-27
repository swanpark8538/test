export interface McpMarketplaceCatalog {
	items: McpMarketplaceItem[]
}

export interface McpMarketplaceItem {
	mcpId: string
	[key: string]: any
}

export interface McpResource {
	[key: string]: any
}

export interface McpResourceTemplate {
	[key: string]: any
}
