import { Role, OrderStatus } from "@prisma/client";

export type { Role, OrderStatus };

export interface ProductWithDetails {
  id: string;
  title: string;
  description: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  images: string[];
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  category: { id: string; name: string; slug: string };
  store: { id: string; name: string; logo: string | null; isVerified: boolean };
  variants: Array<{
    id: string;
    name: string;
    value: string;
    priceModifier: number;
    stock: number;
  }>;
}

export interface CartItemLocal {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    discountPrice: number | null;
    images: string[];
    slug: string;
    stock: number;
  };
  variant?: {
    id: string;
    name: string;
    value: string;
    priceModifier: number;
    stock: number;
  };
}

export interface OrderWithItems {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  address: {
    city: string;
    street: string;
    zip: string;
  };
  createdAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      title: string;
      images: string[];
      slug: string;
    };
  }>;
}
