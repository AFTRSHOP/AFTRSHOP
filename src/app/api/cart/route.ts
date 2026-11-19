import { NextResponse } from "next/server";
import { getStoreHost, storefrontRequest } from "@/lib/shopify";

const CREATE_CART = `mutation CreateCheckout($lines: [CartLineInput!]!) {
  cartCreate(input: { lines: $lines }) {
    cart {
      id
      checkoutUrl
      totalQuantity
    }
    userErrors {
      field
      message
    }
  }
}`;

type RequestLine = {
  merchandiseId: string;
  quantity?: number;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 },
    );
  }

  const rawLines: RequestLine[] = [];

  if (typeof body === "object" && body !== null) {
    if ("lines" in body && Array.isArray((body as { lines: unknown[] }).lines)) {
      for (const item of (body as { lines: unknown[] }).lines) {
        if (
          typeof item === "object" &&
          item !== null &&
          "merchandiseId" in item &&
          typeof (item as RequestLine).merchandiseId === "string"
        ) {
          rawLines.push({
            merchandiseId: (item as RequestLine).merchandiseId,
            quantity: Math.max(1, Number((item as RequestLine).quantity) || 1),
          });
        }
      }
    } else if ("merchandiseId" in body && typeof (body as RequestLine).merchandiseId === "string") {
      rawLines.push({
        merchandiseId: (body as RequestLine).merchandiseId,
        quantity: 1,
      });
    }
  }

  if (rawLines.length === 0) {
    return NextResponse.json(
      { error: "Choose an available option to continue." },
      { status: 400 },
    );
  }

  const storeHost = getStoreHost();

  // 1. Try Shopify Storefront API GraphQL mutation
  try {
    const formattedLines = rawLines.map((line) => ({
      merchandiseId: line.merchandiseId.startsWith("gid://shopify/ProductVariant/")
        ? line.merchandiseId
        : `gid://shopify/ProductVariant/${line.merchandiseId.replace(/\D/g, "")}`,
      quantity: line.quantity || 1,
    }));

    const data = await storefrontRequest<{
      cartCreate: {
        cart: { checkoutUrl: string } | null;
        userErrors: Array<{ message: string }>;
      };
    }>(CREATE_CART, { lines: formattedLines }, { cache: "no-store" });

    const checkoutUrl = data.cartCreate?.cart?.checkoutUrl;

    if (checkoutUrl && !data.cartCreate.userErrors?.length) {
      const checkout = new URL(checkoutUrl);
      checkout.searchParams.set("channel", "online_store");
      return NextResponse.json({ checkoutUrl: checkout.toString() });
    }
  } catch (storefrontError) {
    console.warn("Shopify Storefront API cartCreate note:", storefrontError);
  }

  // 2. Direct fallback to Shopify Cart Permalink: https://{storeHost}/cart/{variant_id}:{quantity}
  // This allows customers to jump right into Shopify's native checkout even if Storefront API token is pending!
  if (storeHost) {
    const permalinkItems = rawLines
      .map((line) => {
        const numericId = line.merchandiseId.replace(/\D/g, "");
        return numericId ? `${numericId}:${line.quantity || 1}` : null;
      })
      .filter(Boolean);

    if (permalinkItems.length > 0) {
      const fallbackUrl = `https://${storeHost}/cart/${permalinkItems.join(",")}`;
      return NextResponse.json({
        checkoutUrl: fallbackUrl,
        fallback: true,
      });
    }
  }

  return NextResponse.json(
    { error: "Checkout is temporarily unavailable. Please try again shortly." },
    { status: 502 },
  );
}
