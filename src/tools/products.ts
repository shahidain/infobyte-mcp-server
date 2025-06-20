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
    'Fetches a product by its ID from the DummyJSON API.',
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
        ]
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
    'Fetches all products from the DummyJSON API with optional pagination parameters.',
    {
      skip: z.number().int().optional().describe("Number of products to skip for pagination."),
      limit: z.number().int().optional().describe("Maximum number of products to return.")
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
        ]
      };
    }
  );
};