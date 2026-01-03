import { InteractiveSvg } from "app/assets/svg/svg-provider";
import prisma from "../db.server";

export async function storeSvgImageInDatabase(session: any, svgs: InteractiveSvg[]) {
    const uploadedImages = await Promise.all(svgs.map(async (svg: InteractiveSvg) => await prisma.image.upsert({
        where: {
            externalId_shop: {
                externalId: svg.externalId,
                shop: session.shop
            }
        },
        update: {
            title: svg.title,
            svgHtml: svg.svgHtml,
            previewHtml: svg.previewHtml,
            updatedAt: new Date()
        },
        create: {
            shop: session.shop,
            externalId: svg.externalId,
            title: svg.title,
            svgHtml: svg.svgHtml,
            previewHtml: svg.previewHtml,
        }
    })));
    return uploadedImages;
}
