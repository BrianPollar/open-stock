/**
 * Defines the routes for creating, retrieving, updating and deleting receipts.
 * @remarks
 * This file contains the following routes:
 * - POST /create - creates a new receipt
 * - GET /one/:urId - retrieves a single receipt by its unique identifier (urId)
 * - GET /all/:offset/:limit - retrieves all receipts with pagination
 * - PUT /delete/one - deletes a single receipt and its related documents
 * - POST /filter/:offset/:limit - searches for receipts based on a search term and key
 */
/**
 * Router for handling receipt routes.
 */
export declare const receiptRoutes: import("express-serve-static-core").Router;
