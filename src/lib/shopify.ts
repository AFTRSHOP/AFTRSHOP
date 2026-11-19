const STOREFRONT_API_VERSION = "2026-10";

export type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: {
    amount: string;
    currencyCode: string;
  };
  selectedOptions: Array<{ name: string; value: string }>;
  image?: ShopifyImage | null;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  variants: ShopifyVariant[];
};

type StorefrontPayload<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

const productFields = `
  id
  handle
  title
  description
  availableForSale
  featuredImage {
    url
    altText
    width
    height
  }
  images(first: 10) {
    nodes {
      url
      altText
      width
      height
    }
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  variants(first: 50) {
    nodes {
      id
      title
      availableForSale
      price {
        amount
        currencyCode
      }
      selectedOptions {
        name
        value
      }
    }
  }
`;

export function getStoreHost(): string {
  const domain =
    process.env.SHOPIFY_STORE_DOMAIN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
    "dermk0-70.myshopify.com";

  return domain.replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

function storefrontEndpoint() {
  const host = getStoreHost();
  const accessToken =
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!accessToken) return null;

  if (!/^[a-z0-9.-]+$/i.test(host)) {
    throw new Error("Invalid Shopify store domain.");
  }

  return {
    url: `https://${host}/api/${STOREFRONT_API_VERSION}/graphql.json`,
    accessToken,
    host,
  };
}

export async function storefrontRequest<T>(
  query: string,
  variables: Record<string, unknown>,
  options: { cache?: "store" | "no-store" } = {},
): Promise<T> {
  const config = storefrontEndpoint();
  if (!config) throw new Error("Shopify storefront configuration is missing.");

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": config.accessToken,
    },
    body: JSON.stringify({ query, variables }),
    ...(options.cache === "no-store"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 300 } }),
  });

  if (!response.ok) throw new Error("Shopify storefront request failed.");

  const payload = (await response.json()) as StorefrontPayload<T>;
  if (payload.errors?.length || !payload.data) {
    throw new Error(
      payload.errors?.[0]?.message || "Shopify storefront returned an invalid response.",
    );
  }

  return payload.data;
}

// Fetch live products directly from public Shopify products.json catalog
async function fetchProductsFromShopifyJSON(): Promise<ShopifyProduct[]> {
  const host = getStoreHost();
  try {
    const res = await fetch(`https://${host}/products.json?limit=50`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data?.products || !Array.isArray(data.products)) return [];

    return data.products.map((p: any) => {
      const minPrice = p.variants?.[0]?.price || "0.00";
      // Detect currency (default to INR if Indian store, or USD)
      const currencyCode = "INR";

      const featuredImg = p.images?.[0]
        ? {
            url: p.images[0].src,
            altText: p.images[0].alt || p.title,
            width: p.images[0].width || null,
            height: p.images[0].height || null,
          }
        : null;

      const images: ShopifyImage[] = (p.images || []).map((img: any) => ({
        url: img.src,
        altText: img.alt || p.title,
        width: img.width || null,
        height: img.height || null,
      }));

      const variants: ShopifyVariant[] = (p.variants || []).map((v: any) => ({
        id: `gid://shopify/ProductVariant/${v.id}`,
        title: v.title,
        availableForSale: v.available ?? true,
        price: {
          amount: String(v.price),
          currencyCode,
        },
        image: v.featured_image?.src
          ? {
              url: v.featured_image.src,
              altText: v.featured_image.alt || v.title,
              width: v.featured_image.width || null,
              height: v.featured_image.height || null,
            }
          : null,
        selectedOptions: [
          v.option1 ? { name: p.options?.[0]?.name || "Option 1", value: v.option1 } : null,
          v.option2 ? { name: p.options?.[1]?.name || "Option 2", value: v.option2 } : null,
          v.option3 ? { name: p.options?.[2]?.name || "Option 3", value: v.option3 } : null,
        ].filter(Boolean),
      }));

      return {
        id: `gid://shopify/Product/${p.id}`,
        handle: p.handle,
        title: p.title,
        description: p.body_html ? p.body_html.replace(/<[^>]*>?/gm, "").trim() : "",
        availableForSale: variants.some((v) => v.availableForSale),
        featuredImage: featuredImg,
        images: images.length > 0 ? images : featuredImg ? [featuredImg] : [],
        priceRange: {
          minVariantPrice: {
            amount: String(minPrice),
            currencyCode,
          },
        },
        variants,
      };
    });
  } catch (err) {
    console.warn("Failed to fetch products from Shopify JSON:", err);
    return [];
  }
}

export async function getProducts(first = 8) {
  // 1. If Storefront API token is configured, try GraphQL Storefront API
  const endpoint = storefrontEndpoint();
  if (endpoint) {
    const query = `query FeaturedProducts($first: Int!) {
      products(first: $first, sortKey: BEST_SELLING) {
        nodes { ${productFields} }
      }
    }`;

    try {
      const data = await storefrontRequest<{ products: { nodes: ShopifyProduct[] } }>(
        query,
        { first: Math.min(Math.max(first, 1), 50) },
      );
      if (data.products?.nodes?.length > 0) {
        return { products: data.products.nodes, connected: true };
      }
    } catch (err) {
      console.warn("Live Shopify GraphQL query failed, attempting live JSON catalog:", err);
    }
  }

  // 2. Fetch live products directly from store's public products.json
  const liveProducts = await fetchProductsFromShopifyJSON();
  if (liveProducts.length > 0) {
    return {
      products: liveProducts.slice(0, first),
      connected: true,
    };
  }

  // 3. Fallback demo products if store catalog is empty
  return {
    products: DEMO_FALLBACK.slice(0, first),
    connected: false,
  };
}

export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  // 1. Try GraphQL Storefront API if configured
  const endpoint = storefrontEndpoint();
  if (endpoint) {
    const query = `query ProductByHandle($handle: String!) {
      product(handle: $handle) { ${productFields} }
    }`;

    try {
      const data = await storefrontRequest<{ product: ShopifyProduct | null }>(query, {
        handle,
      });
      if (data.product) {
        return data.product;
      }
    } catch {
      // Continue to live JSON lookup
    }
  }

  // 2. Look up product in live store's products.json
  const liveProducts = await fetchProductsFromShopifyJSON();
  const matched = liveProducts.find((p) => p.handle === handle);
  if (matched) return matched;

  // 3. Fallback demo items
  return DEMO_FALLBACK.find((p) => p.handle === handle) || null;
}

export function formatMoney(amount: string, currencyCode = "INR") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode || "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const DEMO_FALLBACK: ShopifyProduct[] = [
  {
    id: "gid://shopify/Product/15524908204185",
    handle: "trilayer-terry-oversized-tee",
    title: "TriLayer Terry Oversized Tee",
    description:
      "Fabric: 90/10 cotton polyester, 260 GSM Terry-knit texture with a premium hand-feel. Fit: Unisex oversized fit with drop shoulders – relaxed, roomy, and right on trend.",
    availableForSale: true,
    featuredImage: {
      url: "https://cdn.shopify.com/s/files/1/0792/2148/9817/files/aftr-after-dark-lookbook.png?v=1794899130",
      altText: "TriLayer Terry Oversized Tee",
      width: 1199,
      height: 1312,
    },
    images: [
      {
        url: "https://cdn.shopify.com/s/files/1/0792/2148/9817/files/aftr-after-dark-lookbook.png?v=1794899130",
        altText: "TriLayer Terry Oversized Tee",
        width: 1199,
        height: 1312,
      },
    ],
    priceRange: {
      minVariantPrice: {
        amount: "1150.00",
        currencyCode: "INR",
      },
    },
    variants: [
      {
        id: "gid://shopify/ProductVariant/68107900584089",
        title: "Black / M",
        availableForSale: true,
        price: { amount: "1150.00", currencyCode: "INR" },
        selectedOptions: [
          { name: "Color", value: "Black" },
          { name: "Size", value: "M" },
        ],
      },
      {
        id: "gid://shopify/ProductVariant/68107900616857",
        title: "Black / L",
        availableForSale: true,
        price: { amount: "1150.00", currencyCode: "INR" },
        selectedOptions: [
          { name: "Color", value: "Black" },
          { name: "Size", value: "L" },
        ],
      },
      {
        id: "gid://shopify/ProductVariant/68107900649625",
        title: "Black / XL",
        availableForSale: true,
        price: { amount: "1150.00", currencyCode: "INR" },
        selectedOptions: [
          { name: "Color", value: "Black" },
          { name: "Size", value: "XL" },
        ],
      },
    ],
  },
];
