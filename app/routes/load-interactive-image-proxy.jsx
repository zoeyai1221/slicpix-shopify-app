
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  console.log('server received');
  // Use the authentication API from the React Router template
  await authenticate.public.appProxy(request);
  
  // Read URL parameters added by Shopify when proxying
  const url = new URL(request.url);

  const shop = url.searchParams.get("shop");
  
  const images = await prisma.image.findMany({
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

  return {
    images
  };
};

