import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function requiredPassword(envVar: string) {
  const value = process.env[envVar];
  if (!value || value.length < 12) {
    throw new Error(
      `${envVar} must be set to a password of at least 12 characters before seeding`
    );
  }
  return value;
}

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash(requiredPassword("SEED_ADMIN_PASSWORD"), 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@uzum.uz" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@uzum.uz",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Buyer user
  const buyerPassword = await bcrypt.hash(requiredPassword("SEED_BUYER_PASSWORD"), 12);
  await prisma.user.upsert({
    where: { email: "buyer@uzum.uz" },
    update: {},
    create: {
      name: "Test Buyer",
      email: "buyer@uzum.uz",
      password: buyerPassword,
      role: "BUYER",
    },
  });

  // Single store owned by admin
  const store1 = await prisma.store.upsert({
    where: { ownerId: admin.id },
    update: { name: "Rafiqmarket Store" },
    create: {
      name: "Rafiqmarket Store",
      description: "Official Rafiqmarket online store",
      logo: "/images/products/cat-electronics.jpg",
      ownerId: admin.id,
      isVerified: true,
    },
  });

  const store2 = store1; // single store, all products belong to admin

  // Categories
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: { image: "/images/products/cat-electronics.jpg" },
    create: {
      name: "Electronics",
      slug: "electronics",
      image: "/images/products/cat-electronics.jpg",
    },
  });

  const phones = await prisma.category.upsert({
    where: { slug: "phones" },
    update: { image: "/images/products/cat-phones.jpg" },
    create: {
      name: "Phones",
      slug: "phones",
      image: "/images/products/cat-phones.jpg",
      parentId: electronics.id,
    },
  });

  const clothing = await prisma.category.upsert({
    where: { slug: "clothing" },
    update: { image: "/images/products/cat-clothing.jpg" },
    create: {
      name: "Clothing",
      slug: "clothing",
      image: "/images/products/cat-clothing.jpg",
    },
  });

  const homeAppliances = await prisma.category.upsert({
    where: { slug: "home-appliances" },
    update: { image: "/images/products/cat-home.jpg" },
    create: {
      name: "Home Appliances",
      slug: "home-appliances",
      image: "/images/products/cat-home.jpg",
    },
  });

  const sports = await prisma.category.upsert({
    where: { slug: "sports" },
    update: { image: "/images/products/cat-sports.jpg" },
    create: {
      name: "Sports",
      slug: "sports",
      image: "/images/products/cat-sports.jpg",
    },
  });

  // Products (20 products)
  const products = [
    {
      title: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description: "Apple iPhone 15 Pro Max with A17 Pro chip, 256GB storage, titanium design, and advanced camera system.",
      price: 1299.99,
      discountPrice: 1199.99,
      stock: 15,
      images: [
        "/images/products/phone.jpg",
        "/images/products/phone-2.jpg",
      ],
      categoryId: phones.id,
      storeId: store1.id,
      rating: 4.8,
      reviewCount: 128,
    },
    {
      title: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description: "Samsung's flagship with Snapdragon 8 Gen 3, 200MP camera, and built-in S Pen.",
      price: 1199.99,
      discountPrice: 999.99,
      stock: 20,
      images: [
        "/images/products/samsung-phone.jpg",
        "/images/products/samsung-phone-2.jpg",
      ],
      categoryId: phones.id,
      storeId: store1.id,
      rating: 4.7,
      reviewCount: 95,
    },
    {
      title: "MacBook Pro M3",
      slug: "macbook-pro-m3",
      description: "MacBook Pro with M3 chip, 14-inch Liquid Retina XDR display, 18GB RAM, 512GB SSD.",
      price: 1999.99,
      discountPrice: null,
      stock: 8,
      images: ["/images/products/laptop.jpg"],
      categoryId: electronics.id,
      storeId: store1.id,
      rating: 4.9,
      reviewCount: 67,
    },
    {
      title: "Sony WH-1000XM5 Headphones",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise canceling headphones with 30-hour battery life.",
      price: 349.99,
      discountPrice: 279.99,
      stock: 30,
      images: ["/images/products/headphones.jpg"],
      categoryId: electronics.id,
      storeId: store1.id,
      rating: 4.6,
      reviewCount: 213,
    },
    {
      title: "iPad Pro 12.9 inch",
      slug: "ipad-pro-129",
      description: "iPad Pro with M2 chip, 12.9-inch Liquid Retina XDR display, 256GB WiFi.",
      price: 1099.99,
      discountPrice: 949.99,
      stock: 12,
      images: ["/images/products/tablet.jpg"],
      categoryId: electronics.id,
      storeId: store1.id,
      rating: 4.7,
      reviewCount: 54,
    },
    {
      title: "Samsung 65\" QLED 4K TV",
      slug: "samsung-65-qled-4k",
      description: "65-inch QLED 4K Smart TV with Quantum HDR, Neural Quantum Processor.",
      price: 1499.99,
      discountPrice: 1199.99,
      stock: 5,
      images: ["/images/products/tv.jpg"],
      categoryId: homeAppliances.id,
      storeId: store1.id,
      rating: 4.5,
      reviewCount: 89,
    },
    {
      title: "Dyson V15 Vacuum Cleaner",
      slug: "dyson-v15-vacuum",
      description: "Cordless vacuum with laser dust detection and HEPA filtration.",
      price: 749.99,
      discountPrice: 649.99,
      stock: 18,
      images: ["/images/products/vacuum.jpg"],
      categoryId: homeAppliances.id,
      storeId: store1.id,
      rating: 4.8,
      reviewCount: 142,
    },
    {
      title: "Nespresso Vertuo Plus",
      slug: "nespresso-vertuo-plus",
      description: "Coffee machine with centrifusion technology, makes 5 cup sizes.",
      price: 199.99,
      discountPrice: 159.99,
      stock: 25,
      images: ["/images/products/coffee-machine.jpg"],
      categoryId: homeAppliances.id,
      storeId: store1.id,
      rating: 4.4,
      reviewCount: 178,
    },
    {
      title: "Nike Air Max 270",
      slug: "nike-air-max-270",
      description: "Lifestyle shoe with the tallest Air unit in the heel for maximum cushioning.",
      price: 149.99,
      discountPrice: 119.99,
      stock: 40,
      images: ["/images/products/shoes.jpg"],
      categoryId: clothing.id,
      storeId: store2.id,
      rating: 4.5,
      reviewCount: 267,
    },
    {
      title: "Levi's 501 Original Jeans",
      slug: "levis-501-original-jeans",
      description: "The original straight fit jeans that started it all since 1873.",
      price: 79.99,
      discountPrice: 59.99,
      stock: 60,
      images: ["/images/products/jeans.jpg"],
      categoryId: clothing.id,
      storeId: store2.id,
      rating: 4.6,
      reviewCount: 392,
    },
    {
      title: "Adidas Ultraboost 23",
      slug: "adidas-ultraboost-23",
      description: "Running shoe with responsive BOOST midsole and Primeknit+ upper.",
      price: 189.99,
      discountPrice: 149.99,
      stock: 35,
      images: ["/images/products/running-shoes.jpg"],
      categoryId: sports.id,
      storeId: store2.id,
      rating: 4.7,
      reviewCount: 184,
    },
    {
      title: "Zara Classic Blazer",
      slug: "zara-classic-blazer",
      description: "Tailored slim-fit blazer in premium fabric, perfect for any occasion.",
      price: 129.99,
      discountPrice: 89.99,
      stock: 22,
      images: ["/images/products/jacket.jpg"],
      categoryId: clothing.id,
      storeId: store2.id,
      rating: 4.3,
      reviewCount: 76,
    },
    {
      title: "H&M Summer Dress",
      slug: "hm-summer-dress",
      description: "Floral print midi dress with adjustable straps, perfect for summer.",
      price: 49.99,
      discountPrice: 34.99,
      stock: 55,
      images: ["/images/products/dress.jpg"],
      categoryId: clothing.id,
      storeId: store2.id,
      rating: 4.2,
      reviewCount: 143,
    },
    {
      title: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description: "Non-slip eco-friendly yoga mat, 6mm thick with alignment lines.",
      price: 69.99,
      discountPrice: 49.99,
      stock: 45,
      images: ["/images/products/yoga-mat.jpg"],
      categoryId: sports.id,
      storeId: store2.id,
      rating: 4.6,
      reviewCount: 221,
    },
    {
      title: "Dumbbells Set 20kg",
      slug: "dumbbells-set-20kg",
      description: "Adjustable dumbbell set with rubber grip, includes storage rack.",
      price: 89.99,
      discountPrice: null,
      stock: 30,
      images: ["/images/products/dumbbells.jpg"],
      categoryId: sports.id,
      storeId: store2.id,
      rating: 4.4,
      reviewCount: 98,
    },
    {
      title: "Apple Watch Series 9",
      slug: "apple-watch-series-9",
      description: "The most advanced Apple Watch with Double Tap gesture and precision Finding.",
      price: 399.99,
      discountPrice: 349.99,
      stock: 20,
      images: ["/images/products/smartwatch.jpg"],
      categoryId: electronics.id,
      storeId: store1.id,
      rating: 4.7,
      reviewCount: 312,
    },
    {
      title: "AirPods Pro 2nd Gen",
      slug: "airpods-pro-2nd-gen",
      description: "Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio.",
      price: 249.99,
      discountPrice: 199.99,
      stock: 28,
      images: ["/images/products/airpods.jpg"],
      categoryId: electronics.id,
      storeId: store1.id,
      rating: 4.8,
      reviewCount: 445,
    },
    {
      title: "Instant Pot Duo 7-in-1",
      slug: "instant-pot-duo-7-in-1",
      description: "Multi-use pressure cooker: pressure cooker, slow cooker, rice cooker & more.",
      price: 99.99,
      discountPrice: 79.99,
      stock: 35,
      images: ["/images/products/kitchen.jpg"],
      categoryId: homeAppliances.id,
      storeId: store1.id,
      rating: 4.7,
      reviewCount: 567,
    },
    {
      title: "Xiaomi Redmi Note 13 Pro",
      slug: "xiaomi-redmi-note-13-pro",
      description: "200MP camera, 5000mAh battery, AMOLED display, Snapdragon 7s Gen 2.",
      price: 349.99,
      discountPrice: 299.99,
      stock: 42,
      images: ["/images/products/xiaomi-phone.jpg"],
      categoryId: phones.id,
      storeId: store1.id,
      rating: 4.5,
      reviewCount: 234,
    },
    {
      title: "Puma RS-X Sneakers",
      slug: "puma-rs-x-sneakers",
      description: "Retro-inspired sneakers with RS cushioning for maximum comfort.",
      price: 109.99,
      discountPrice: 84.99,
      stock: 48,
      images: ["/images/products/puma-shoes.jpg"],
      categoryId: sports.id,
      storeId: store2.id,
      rating: 4.3,
      reviewCount: 167,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { images: product.images },
      create: product,
    });
  }

  console.log("Seeding completed!");
  console.log("Admin: admin@uzum.uz (password from SEED_ADMIN_PASSWORD)");
  console.log("Buyer: buyer@uzum.uz (password from SEED_BUYER_PASSWORD)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
