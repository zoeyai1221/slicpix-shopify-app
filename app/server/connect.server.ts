import prisma from "../db.server";

export async function connectEmail(shopId: string, email: string) {
    const connectionPair = {
        shop: shopId,
        email: email,
        activated: false,
        otp: "123456" // in real world, we will send one time password to given email address
    };
    const result = await prisma.connectedStores.upsert({
        where: {
            shop: shopId,
            email: email
        },
        update: connectionPair,
        create: connectionPair
    });
    console.log("stored connection pair", result);
}

export async function verifyEmail(shopId: string, otp: string) {
    const searchResult = await prisma.connectedStores.findMany({
        where: {
            shop: shopId,
            otp: otp,
            activated: false
        },
        select: {
            email: true,
        },
    });
    console.log("search result!", searchResult);
    if (!searchResult || searchResult.length !== 1) {
        return { success: false, message: 'Invalid code' };
    }

    const result = await prisma.connectedStores.update({
        where: {
            shop: shopId,
            email: searchResult[0].email
        },
        data: {
            activated: true
        }
    });
    console.log("stored connection pair", result);
    return { success: true }
}
