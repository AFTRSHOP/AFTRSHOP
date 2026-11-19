import { NextResponse } from "next/server";
import { getStoreHost, storefrontRequest } from "@/lib/shopify";

const CREATE_CART = `mutation CreateCheckout($merchandiseId: ID!) {
  cartCreate(input: { lines: [{ merchandiseId: $merchandiseId, quantity: 1 }] }) {
    cart { checkoutUrl }
    userErrors { message }
  }
}`;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Choose an available option to continue." }, { status: 400 });
  }

  const merchandiseId =
    typeof body === "object" && body !== null && "merchandiseId" in body
      ? body.merchandiseId
      : null;

  if (typeof merchandiseId !== "string" || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(merchandiseId)) {
    return NextResponse.json({ error: "Choose an available option to continue." }, { status: 400 });
  }

  try {
    const data = await storefrontRequest<{
      cartCreate: {
        cart: { checkoutUrl: string } | null;
        userErrors: Array<{ message: string }>;
      };
    }>(CREATE_CART, { merchandiseId }, { cache: "no-store" });

    const checkoutUrl = data.cartCreate.cart?.checkoutUrl;
    const storeHost = getStoreHost();
    if (data.cartCreate.userErrors.length || !checkoutUrl || !storeHost) {
      return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }

    const checkout = new URL(checkoutUrl);
    const isShopifyHost = checkout.hostname === storeHost || checkout.hostname.endsWith(".myshopify.com");
    if (checkout.protocol !== "https:" || !isShopifyHost) {
      return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again shortly." }, { status: 502 });
    }

    checkout.searchParams.set("channel", "online_store");
    return NextResponse.json({ checkoutUrl: checkout.toString() });
  } catch {
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again shortly." }, { status: 502 });
  }
}
