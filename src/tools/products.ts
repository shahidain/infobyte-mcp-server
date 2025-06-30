import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ProductService } from "../services/productService.js";


/**
 * FetchProduct tool for the MCP server.
 * This tool fetches a product by its ID from the DummyJSON API.
 * 
 * @param server - The McpServer instance to register the tool with.
 */
export const FetchProduct = (server: McpServer) => {
  server.tool(
    'fetch_product',
    `Fetches a product by its ID from the DummyJSON API. Parameter 'id' (type: number, integer) is required field`,
    {
      id: z.number().describe("The ID of the product to fetch.")
    },
    async ({ id }) => {
      if (typeof id !== 'number') {
        throw new Error('Product ID must be a number.');
      }
      const product = await ProductService.getProductById(id);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(product),
            fommat: 'json'
          }
        ],
        isError: false
      };
    }
  );
};

/**
 * FetchAllProducts tool for the MCP server.
 * This tool fetches all products from the DummyJSON API with optional pagination parameters.
 * 
 * @param server - The McpServer instance to register the tool with.
 */
export const FetchAllProducts = (server: McpServer) => {
  server.tool(
    'fetch_all_products',
    `Fetches all products from the DummyJSON API with optional pagination parameters. Parameter: 'skip' (type: number, integer) - Number of products to skip for pagination. Must be a non-negative integer. Use this to implement pagination by skipping the first N products. Default value is 0 (start from the beginning). Parameter: 'limit' (type: number, integer) - Maximum number of products to return in a single request. Must be a positive integer. Use this to control page size and prevent large response payloads. Default value is 10 products. The API may have its own maximum limit.`,
    {
      skip: z.number().int().default(0).describe("Parameter: 'skip' (type: number, integer) - Number of products to skip for pagination. Must be a non-negative integer. Use this to implement pagination by skipping the first N products. Default value is 0 (start from the beginning)."),
      limit: z.number().int().default(10).describe("Parameter: 'limit' (type: number, integer) - Maximum number of products to return in a single request. Must be a positive integer. Use this to control page size and prevent large response payloads. Default value is 10 products. The API may have its own maximum limit.")
    },
    async ({ skip, limit }) => {
      const products = await ProductService.getProducts(skip, limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(products),
            fommat: 'json'
          }
        ],
        isError: false
      };
    }
  );
};

/**
 * FetchProductsByCategory tool for the MCP server.
 * This tool fetches products by category from the DummyJSON API with optional pagination parameters.
 * 
 * @param server - The McpServer instance to register the tool with.
 */
export const FetchProductsByCategory = (server: McpServer) => {
  server.tool(
    'fetch_products_by_category',
    'Fetches products by category from the DummyJSON API with optional pagination parameters.',
    {
      category: z.string().describe("The category name to filter products by."),
      skip: z.number().int().optional().describe("Number of products to skip for pagination."),
      limit: z.number().int().optional().describe("Maximum number of products to return.")
    },
    async ({ category, skip, limit }) => {
      if (typeof category !== 'string' || category.trim() === '') {
        throw new Error('Category must be a non-empty string.');
      }
      const products = await ProductService.getProductsByCategory(category, skip, limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(products),
            fommat: 'json'
          }
        ],
        isError: false
      };
    }
  );
};