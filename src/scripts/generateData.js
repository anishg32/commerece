const fs = require('fs');
const path = require('path');

const categories = [
  {
    name: "Electronics",
    slug: "electronics",
    description: "Premium electronics and gadgets",
    image: { url: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1000", altText: "Electronics" },
    icon: "Cpu",
    subcategories: [{ name: "Accessories", slug: "accessories" }]
  },
  {
    name: "Mobiles & Accessories",
    slug: "mobiles-accessories",
    description: "Latest smartphones and premium cases",
    image: { url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-2-202309?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693010533034", altText: "Mobiles" },
    icon: "Smartphone",
    subcategories: [{ name: "Smartphones", slug: "smartphones" }, { name: "Cases", slug: "cases" }]
  },
  {
    name: "Computers & Laptops",
    slug: "computers-laptops",
    description: "High-performance computing for work and play",
    image: { url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=555&qlt=100,1&resMode=sharp2&size=555,402&chrss=full", altText: "Computers" },
    icon: "Laptop",
    subcategories: [{ name: "Laptops", slug: "laptops" }, { name: "Desktops", slug: "desktops" }]
  },
  {
    name: "TVs & Home Entertainment",
    slug: "tvs-home-entertainment",
    description: "Cinematic experiences in your living room",
    image: { url: "https://www.lg.com/us/images/tvs/md08003664/gallery/dz01.jpg", altText: "TVs" },
    icon: "Tv",
    subcategories: [{ name: "OLED TVs", slug: "oled-tvs" }]
  },
  {
    name: "Audio",
    slug: "audio",
    description: "High-fidelity sound systems and headphones",
    image: { url: "https://s7d2.scene7.com/is/image/bose/QC_Headphones_Black_Hero_RGB?wid=1000", altText: "Audio" },
    icon: "Headphones",
    subcategories: [{ name: "Headphones", slug: "headphones" }, { name: "Speakers", slug: "speakers" }]
  },
  {
    name: "Cameras & Photography",
    slug: "cameras-photography",
    description: "Capture the moment in stunning clarity",
    image: { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000", altText: "Cameras" },
    icon: "Camera",
    subcategories: [{ name: "Digital Cameras", slug: "digital-cameras" }]
  },
  {
    name: "Gaming",
    slug: "gaming",
    description: "Next-gen consoles and gaming gear",
    image: { url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000", altText: "Gaming" },
    icon: "Gamepad",
    subcategories: [{ name: "Consoles", slug: "consoles" }]
  },
  {
    name: "Smart Home",
    slug: "smart-home",
    description: "Intelligent devices for modern living",
    image: { url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=1000", altText: "Smart Home" },
    icon: "Home",
    subcategories: [{ name: "Security", slug: "security" }]
  },
  {
    name: "Home Appliances",
    slug: "home-appliances",
    description: "Premium appliances for everyday ease",
    image: { url: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/369363-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=1920", altText: "Home Appliances" },
    icon: "Microwave",
    subcategories: [{ name: "Vacuums", slug: "vacuums" }]
  },
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    description: "Professional grade kitchen tools",
    image: { url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000", altText: "Kitchen Appliances" },
    icon: "Coffee",
    subcategories: [{ name: "Coffee Makers", slug: "coffee-makers" }]
  },
  {
    name: "Fashion",
    slug: "fashion",
    description: "Premium apparel and footwear",
    image: { url: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-rWtqPn.png", altText: "Fashion" },
    icon: "Shirt",
    subcategories: [{ name: "Shoes", slug: "shoes" }]
  }
];

const brands = [
  { name: "Apple", slug: "apple", description: "Think different.", logo: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200", website: "https://apple.com" },
  { name: "Dell", slug: "dell", description: "Power to do more.", logo: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200", website: "https://dell.com" },
  { name: "LG", slug: "lg", description: "Life's Good.", logo: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=200", website: "https://lg.com" },
  { name: "Bose", slug: "bose", description: "Better sound through research.", logo: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200", website: "https://bose.com" },
  { name: "Dyson", slug: "dyson", description: "Solving problems others ignore.", logo: "https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=200", website: "https://dyson.com" },
  { name: "Nike", slug: "nike", description: "Just do it.", logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200", website: "https://nike.com" },
  { name: "Sony", slug: "sony", description: "Make. Believe.", logo: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200", website: "https://sony.com" },
];

const products = [
  {
    name: "iPhone 15 Pro",
    slug: "iphone-15-pro",
    sku: "APL-IP15P-128",
    price: 129900,
    discountPrice: 124900,
    stock: 50,
    categorySlug: "mobiles-accessories",
    subcategorySlug: "smartphones",
    brandSlug: "apple",
    description: "Forged in titanium and featuring the groundbreaking A17 Pro chip.",
    shortDescription: "Titanium design with A17 Pro chip.",
    thumbnail: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-2-202309?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693010533034",
    images: [{ url: "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-model-unselect-gallery-2-202309?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693010533034", altText: "iPhone 15 Pro", source: "Apple", sourceType: "Official Manufacturer", isVerified: true }],
    tags: ["smartphone", "apple", "5g", "titanium"],
    attributes: { "Color": "Natural Titanium", "Storage": "128GB" }
  },
  {
    name: "Dell XPS 15",
    slug: "dell-xps-15",
    sku: "DELL-XPS15-2024",
    price: 189900,
    discountPrice: 175000,
    stock: 20,
    categorySlug: "computers-laptops",
    subcategorySlug: "laptops",
    brandSlug: "dell",
    description: "Stunning 15.6-inch OLED display, 13th Gen Intel Core processors.",
    shortDescription: "Premium 15-inch creator laptop.",
    thumbnail: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=555&qlt=100,1&resMode=sharp2&size=555,402&chrss=full",
    images: [{ url: "https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-black/notebook-xps-15-9530-t-black-gallery-1.psd?fmt=png-alpha&pscan=auto&scl=1&hei=402&wid=555&qlt=100,1&resMode=sharp2&size=555,402&chrss=full", altText: "Dell XPS 15", source: "Dell", sourceType: "Official Manufacturer", isVerified: true }],
    tags: ["laptop", "dell", "windows", "creator"],
    attributes: { "Processor": "Intel Core i7", "RAM": "16GB", "Storage": "512GB SSD" }
  },
  {
    name: "LG C3 65-inch OLED evo 4K Smart TV",
    slug: "lg-c3-65-oled-tv",
    sku: "LG-OLED65C3PUA",
    price: 249900,
    discountPrice: 209900,
    stock: 15,
    categorySlug: "tvs-home-entertainment",
    subcategorySlug: "oled-tvs",
    brandSlug: "lg",
    description: "The LG OLED evo C3 Series is powered by the a9 AI Processor Gen6—made exclusively for LG OLED—for beautiful picture and performance.",
    shortDescription: "Brilliant OLED evo display with webOS.",
    thumbnail: "https://www.lg.com/us/images/tvs/md08003664/gallery/dz01.jpg",
    images: [{ url: "https://www.lg.com/us/images/tvs/md08003664/gallery/dz01.jpg", altText: "LG C3 65 inch", source: "LG", sourceType: "Official Manufacturer", isVerified: true }],
    tags: ["tv", "oled", "4k", "smart-tv", "lg"],
    attributes: { "Screen Size": "65 inch", "Resolution": "4K Ultra HD", "Refresh Rate": "120Hz" }
  },
  {
    name: "Bose QuietComfort Headphones",
    slug: "bose-quietcomfort",
    sku: "BOSE-QC-BLK",
    price: 34900,
    discountPrice: 29900,
    stock: 100,
    categorySlug: "audio",
    subcategorySlug: "headphones",
    brandSlug: "bose",
    description: "Iconic quiet. Comfort. And sound. The first noise cancelling headphones are back, with legendary silence and premium audio.",
    shortDescription: "Legendary noise cancelling headphones.",
    thumbnail: "https://s7d2.scene7.com/is/image/bose/QC_Headphones_Black_Hero_RGB?wid=1000",
    images: [{ url: "https://s7d2.scene7.com/is/image/bose/QC_Headphones_Black_Hero_RGB?wid=1000", altText: "Bose QC Headphones", source: "Bose", sourceType: "Official Manufacturer", isVerified: true }],
    tags: ["headphones", "audio", "noise-cancelling", "bose"],
    attributes: { "Color": "Black", "Connectivity": "Bluetooth", "Battery Life": "Up to 24 hours" }
  },
  {
    name: "Dyson V15 Detect Absolute",
    slug: "dyson-v15-detect",
    sku: "DYSON-V15-ABS",
    price: 74900,
    discountPrice: 69900,
    stock: 30,
    categorySlug: "home-appliances",
    subcategorySlug: "vacuums",
    brandSlug: "dyson",
    description: "Dyson's most powerful, intelligent cordless vacuum. Laser reveals microscopic dust.",
    shortDescription: "Powerful, intelligent cordless vacuum.",
    thumbnail: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/369363-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=1920",
    images: [{ url: "https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson/images/products/primary/369363-01.png?$responsive$&cropPathE=desktop&fit=stretch,1&wid=1920", altText: "Dyson V15", source: "Dyson", sourceType: "Official Manufacturer", isVerified: true }],
    tags: ["vacuum", "cordless", "home-appliance", "dyson"],
    attributes: { "Type": "Cordless Stick", "Weight": "3.1 kg" }
  },
  {
    name: "Nike Air Force 1 '07",
    slug: "nike-air-force-1-07",
    sku: "NIKE-AF1-07-WHT",
    price: 9695,
    discountPrice: 9695,
    stock: 200,
    categorySlug: "fashion",
    subcategorySlug: "shoes",
    brandSlug: "nike",
    description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best.",
    shortDescription: "Classic iconic sneaker.",
    thumbnail: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-rWtqPn.png",
    images: [{ url: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-rWtqPn.png", altText: "Nike Air Force 1", source: "Nike", sourceType: "Official Manufacturer", isVerified: true }],
    tags: ["shoes", "sneakers", "fashion", "nike"],
    attributes: { "Color": "White", "Gender": "Men", "Material": "Leather" }
  },
  {
    name: "Sony PlayStation 5",
    slug: "sony-playstation-5",
    sku: "SONY-PS5-DISC",
    price: 49900,
    discountPrice: 49900,
    stock: 15,
    categorySlug: "gaming",
    subcategorySlug: "consoles",
    brandSlug: "sony",
    description: "The PS5 console unleashes new gaming possibilities that you never anticipated.",
    shortDescription: "Next-gen gaming console.",
    thumbnail: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000",
    images: [{ url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=1000", altText: "PS5", source: "Unsplash", sourceType: "Stock", isVerified: true }],
    tags: ["gaming", "console", "ps5", "sony"],
    attributes: { "Edition": "Disc", "Storage": "825GB SSD" }
  },
  {
    name: "Sony Alpha a7 IV Mirrorless Camera",
    slug: "sony-a7-iv",
    sku: "SONY-A7M4",
    price: 249900,
    discountPrice: 239900,
    stock: 8,
    categorySlug: "cameras-photography",
    subcategorySlug: "digital-cameras",
    brandSlug: "sony",
    description: "A true hybrid mirrorless camera, the Alpha a7 IV has the resolution and AF performance that appeals to photographers along with robust 4K 60p video recording for filmmakers and content creators.",
    shortDescription: "33MP Full-Frame Mirrorless Camera",
    thumbnail: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000",
    images: [{ url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000", altText: "Sony A7 IV", source: "Unsplash", sourceType: "Stock", isVerified: true }],
    tags: ["camera", "photography", "mirrorless", "sony"],
    attributes: { "Megapixels": "33MP", "Sensor": "Full-Frame" }
  },
  {
    name: "Apple MacBook Pro 14-inch (M3 Pro)",
    slug: "macbook-pro-14-m3",
    sku: "APL-MBP14-M3P",
    price: 199900,
    discountPrice: 189900,
    stock: 25,
    categorySlug: "computers-laptops",
    subcategorySlug: "laptops",
    brandSlug: "apple",
    description: "The 14-inch MacBook Pro blasts forward with M3 Pro, a radically advanced chip that brings even greater performance for more demanding workflows.",
    shortDescription: "Pro laptop with M3 Pro chip.",
    thumbnail: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000",
    images: [{ url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1000", altText: "MacBook Pro", source: "Unsplash", sourceType: "Stock", isVerified: true }],
    tags: ["laptop", "apple", "macbook", "m3-pro"],
    attributes: { "Processor": "M3 Pro", "RAM": "18GB", "Storage": "512GB SSD" }
  },
  {
    name: "Apple AirPods Pro (2nd Generation)",
    slug: "apple-airpods-pro-2",
    sku: "APL-APP2-USBC",
    price: 24900,
    discountPrice: 22900,
    stock: 150,
    categorySlug: "audio",
    subcategorySlug: "headphones",
    brandSlug: "apple",
    description: "AirPods Pro have been re-engineered for even richer audio experiences. Next-level Active Noise Cancellation and Adaptive Transparency reduce more external noise.",
    shortDescription: "Wireless earbuds with ANC.",
    thumbnail: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000",
    images: [{ url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000", altText: "AirPods Pro", source: "Unsplash", sourceType: "Stock", isVerified: true }],
    tags: ["audio", "earbuds", "apple", "wireless"],
    attributes: { "Connectivity": "Bluetooth 5.3", "Charging": "USB-C & MagSafe" }
  }
];

fs.writeFileSync(path.join(__dirname, '..', 'data', 'categories.json'), JSON.stringify(categories, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'brands.json'), JSON.stringify(brands, null, 2));
fs.writeFileSync(path.join(__dirname, '..', 'data', 'products.json'), JSON.stringify(products, null, 2));

console.log("JSON data files created in src/data/");
