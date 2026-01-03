import { InteractiveSvg } from "app/assets/svg/svg-provider";
import prisma from "../db.server";

export async function loadConnectionState(shopId: string) {
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
    return connectedResult && connectedResult.length === 1 ? {
        user: connectedResult[0].email
    } : {};
}
