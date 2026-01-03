/**
 * App Proxy Route Handler
 * 
 * This file handles all requests proxied through Shopify's app proxy.
 * The app proxy allows the theme extension (liquid) to communicate with
 * the app's backend without exposing API endpoints directly.
 * 
 * Endpoint: /apps/proxy (configured in shopify.app.toml)
 * 
 * Supported request types (via ?type= query param):
 * - load-image: Fetch all SVG images for a shop
 * - load-selected-image: Fetch a specific image by ID
 * - determine-render-context: Check connection status and load images/selection
 * - connect-email: Initiate email connection flow
 * - verify-email: Verify OTP code to complete connection
 */

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { connectEmail, verifyEmail } from '../server/connect.server';

/**
 * Loader - handles GET requests from the theme extension
 * Routes to different handlers based on the 'type' query parameter
 */
export const loader = async ({ request }) => {
    // Authenticate the request using Shopify's app proxy authentication
    await authenticate.public.appProxy(request);

    // Parse URL to extract shop and request type parameters
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");  // Shop domain added by Shopify
    const requestType = url.searchParams.get("type");  // Custom param to determine action

    // Route: Load all images for the shop
    if (requestType === "load-image") {
        const images = await loadImages(shop);
        return { images };

    // Route: Load a specific image by ID (for rendering saved selections)
    } else if (requestType === "load-selected-image") {
        const imageId = url.searchParams.get("id");
        const images = await prisma.image.findMany({
            where: {
                id: imageId,
            },
            select: {
                id: true,
                title: true,
                svgHtml: true,
                previewHtml: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        // Return single image (should only match one)
        return { image: images[0] };

    // Route: Determine render context - check auth and load available data
    } else if (requestType === 'determine-render-context') {
        const shopId = url.searchParams.get("shopId");
        const blockId = url.searchParams.get("blockId");
        
        // Check if this shop has an activated connection
        const connectedResult = await prisma.connectedStores.findMany({
            where: {
                shop: shopId,
                activated: true
            },
            select: {
                shop: true,
                email: true
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        console.log(JSON.stringify(connectedResult));
        const isConnected = connectedResult.length === 1;
        
        // Load images only if the shop is connected
        let images = undefined;
        if (isConnected) {
            images = await loadImages();
        }

        // Load currently selected image for this block (if any)
        let selectedImage = undefined;
        if (images && images.length > 0) {
            const potentialImages = await prisma.imageRegistry.findMany({
                where: {
                    shop: shop,
                    blockId: blockId,
                },
                select: {
                    imageId: true,
                },
            });
            // TODO: handle selected image lookup
        }
        return {
            isConnected: isConnected,
            images: images,
            selectedImage: selectedImage
        };

    // Route: Initiate email connection - stores pending connection with OTP
    } else if (requestType === 'connect-email') {
        const email = url.searchParams.get("email");
        const shopId = url.searchParams.get("shopId");
        await connectEmail(shopId, email);
        return { success: true };

    // Route: Verify OTP to activate the connection
    } else if (requestType === 'verify-email') {
        const shopId = url.searchParams.get("shopId");
        const otp = url.searchParams.get("otp");
        return verifyEmail(shopId, otp);
    }

    // Default: return empty response for unknown request types
    return {};
};

/**
 * Action - handles POST requests for saving image selections
 * Called when a merchant selects an image in the theme editor
 * 
 * Saves selection in two places:
 * 1. Local database (imageRegistry) - for app's internal tracking
 * 2. Shopify metafields - so Liquid can access the selection
 */
export const action = async ({ request }) => {
    // Authenticate and get admin API access
    const { admin } = await authenticate.public.appProxy(request);

    // Step 1: Save selection to local database
    // This allows the app to track which image is assigned to which block
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");
    const body = await request.json();

    // Build registration object from request body
    const imageRegistration = {
        imageId: body.imageId,
        blockId: body.blockId,
        blockLabel: body.blockLabel,
        shop: shop
    };

    // Upsert: Update existing registration or create new one
    const result = await prisma.imageRegistry.upsert({
        where: {
            shop_blockId: {
                shop: shop,
                blockId: body.blockId,
            },
        },
        update: imageRegistration,
        create: imageRegistration
    });

    // Step 2: Save selection to Shopify metafields
    // This allows Liquid templates to read the selection via app.metafields
    
    // First, get the app installation ID (owner for metafields)
    const response = await admin.graphql(
        `#graphql
  query AccessScopeList {
    currentAppInstallation {
      id
    }
  }`,
    );
    const json = await response.json();
    const appInstallationId = json.data.currentAppInstallation.id;

    // Create/update metafield with image selection
    // Key: block ID, Value: image ID
    // Liquid accesses this via: app.metafields.image_selections[block.id]
    const uploadImageSelectionResponse = await admin.graphql(`#graphql
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          namespace
          key
          type
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
        {
            variables: {
                "metafields": [
                    {
                        "ownerId": appInstallationId,
                        "namespace": "image_selections",
                        "key": body.blockId,
                        "type": "single_line_text_field",
                        "value": body.imageId
                    }
                ]
            }
        });

    const jsonResponse = await uploadImageSelectionResponse.json();

    return {};
}

/**
 * Helper function to load all images for a shop
 * @param {string} shop - The shop domain
 * @returns {Promise<Array>} Array of image objects with id, title, svgHtml, previewHtml
 */
async function loadImages(shop) {
    return await prisma.image.findMany({
        where: {
            shop: shop,
        },
        select: {
            id: true,
            title: true,
            svgHtml: true,
            previewHtml: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
    });
}
