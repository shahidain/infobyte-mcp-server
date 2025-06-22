import dotenv from 'dotenv';
import axios from 'axios';
import { Product, ProductsResponse } from '../models/product.js';
dotenv.config();

const API_BASE_URL = process.env.DUMMY_JSON_API_URL;

export class ProductService {
  
  /**
   * Fetch all products with optional limit and skip parameters
  */
  static async getProducts(skip: number | null | undefined, limit: number | null | undefined): Promise<ProductsResponse> {
    const url = `${API_BASE_URL}/products`;
    const response = await axios.get<ProductsResponse>(url, { 
      params: { skip, limit }
    });
    return response.data;
  };

  /**
   * Get a specific product by ID
   */
  static async getProductById(id: number): Promise<Product> {
    const url = `${API_BASE_URL}/products/${id}`;
    const response = await axios.get<Product>(url);
    return response.data;
  };

  /**
   * Search products by query term
   */
  static async searchProducts(query: string | null | undefined): Promise<ProductsResponse> {
    const url = `${API_BASE_URL}/products/search`;
    const response = await axios.get<ProductsResponse>(url, {
      params: { q: query }
    });
    return response.data;
  };

  /**
   * Get all product categories
   */
  static async getCategories(): Promise<any[]> {
    const url = `${API_BASE_URL}/products/categories`;
    const response = await axios.get<any[]>(url);
    return response.data;
  };

  /**
   * Get products by category with pagination
   */
  static async getProductsByCategory(category: string, skip: number = 0, limit: number = 10): Promise<ProductsResponse> {
    const url = `${API_BASE_URL}/products/category/${category}`;
    const response = await axios.get<ProductsResponse>(url, {
      params: { skip, limit }
    });
    return response.data;
  };
}