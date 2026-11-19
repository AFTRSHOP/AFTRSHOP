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

function storefrontEndpoint() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !accessToken) return null;

  const host = domain.replace(/^https?:\/\//i, "").replace(/\/$/, "");
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
    throw new Error("Shopify storefront returned an invalid response.");
  }

  return payload.data;
}

export async function getProducts(first = 8) {
  if (!storefrontEndpoint()) return { products: [] as ShopifyProduct[], connected: false };

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
    return { products: data.products.nodes, connected: true };
  } catch {
    return { products: [] as ShopifyProduct[], connected: false };
  }
}

export async function getProductByHandle(handle: string) {
  if (!storefrontEndpoint()) return null;

  const query = `query ProductByHandle($handle: String!) {
    product(handle: $handle) { ${productFields} }
  }`;

  try {
    const data = await storefrontRequest<{ product: ShopifyProduct | null }>(query, { handle });
    return data.product;
  } catch {
    return null;
  }
}

export function formatMoney(amount: string, currencyCode: string) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return amount;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getStoreHost() {
  const config = storefrontEndpoint();
  return config?.host ?? null;
}
