export async function fetchShopId(admin: any) {
    const response = await admin.graphql(
        `#graphql
      query {
        shop {
          id
        }
      }
    `
    );

    const data = await response.json();
    const shopGid = data.data.shop.id;
    return shopGid.split("/").pop();
}
