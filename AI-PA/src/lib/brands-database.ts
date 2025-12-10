/**
 * Brand Database for NearWise AI Local Discovery
 * Includes fashion, clothing, shoes, accessories, and other retail brands
 * with both offline and online presence information
 */

export interface Brand {
  name: string;
  category: 'clothing' | 'shoes' | 'accessories' | 'sportswear' | 'luxury' | 'department' | 'food' | 'grocery' | 'electronics';
  website?: string;
  hasPhysicalStores: boolean;
  osmTags?: string[]; // OpenStreetMap tags to search for
  logo?: string; // Optional logo URL
  description?: string;
}

export const BRANDS_DATABASE: Brand[] = [
  // Clothing Brands
  {
    name: 'Zara',
    category: 'clothing',
    website: 'https://www.zara.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Zara', 'brand~Zara'],
    description: 'Spanish fast-fashion retailer',
  },
  {
    name: 'H&M',
    category: 'clothing',
    website: 'https://www.hm.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~H&M', 'brand~H&M'],
    description: 'Swedish multinational clothing company',
  },
  {
    name: 'Gap',
    category: 'clothing',
    website: 'https://www.gap.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Gap', 'brand~Gap'],
    description: 'American clothing and accessories retailer',
  },
  {
    name: 'Uniqlo',
    category: 'clothing',
    website: 'https://www.uniqlo.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Uniqlo', 'brand~Uniqlo'],
    description: 'Japanese casual wear designer',
  },
  {
    name: 'Forever 21',
    category: 'clothing',
    website: 'https://www.forever21.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Forever 21', 'brand~Forever 21'],
    description: 'Fast-fashion retailer',
  },
  {
    name: 'Old Navy',
    category: 'clothing',
    website: 'https://www.oldnavy.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Old Navy', 'brand~Old Navy'],
    description: 'American clothing and accessories retailing company',
  },
  {
    name: 'American Eagle',
    category: 'clothing',
    website: 'https://www.ae.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~American Eagle', 'brand~American Eagle'],
    description: 'American lifestyle, clothing, and accessories retailer',
  },
  {
    name: 'Hollister',
    category: 'clothing',
    website: 'https://www.hollisterco.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Hollister', 'brand~Hollister'],
    description: 'American lifestyle brand',
  },
  {
    name: 'Abercrombie & Fitch',
    category: 'clothing',
    website: 'https://www.abercrombie.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'name~Abercrombie', 'brand~Abercrombie'],
    description: 'American lifestyle retailer',
  },

  // Shoe Brands
  {
    name: 'Nike',
    category: 'shoes',
    website: 'https://www.nike.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'shop=sports', 'name~Nike', 'brand~Nike'],
    description: 'American athletic footwear and apparel corporation',
  },
  {
    name: 'Adidas',
    category: 'shoes',
    website: 'https://www.adidas.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'shop=sports', 'name~Adidas', 'brand~Adidas'],
    description: 'German athletic apparel and footwear corporation',
  },
  {
    name: 'Puma',
    category: 'shoes',
    website: 'https://www.puma.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'shop=sports', 'name~Puma', 'brand~Puma'],
    description: 'German multinational corporation',
  },
  {
    name: 'Reebok',
    category: 'shoes',
    website: 'https://www.reebok.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'shop=sports', 'name~Reebok', 'brand~Reebok'],
    description: 'American fitness footwear and clothing brand',
  },
  {
    name: 'Foot Locker',
    category: 'shoes',
    website: 'https://www.footlocker.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'name~Foot Locker', 'brand~Foot Locker'],
    description: 'American sportswear and footwear retailer',
  },
  {
    name: 'Skechers',
    category: 'shoes',
    website: 'https://www.skechers.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'name~Skechers', 'brand~Skechers'],
    description: 'American footwear company',
  },
  {
    name: 'Vans',
    category: 'shoes',
    website: 'https://www.vans.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'name~Vans', 'brand~Vans'],
    description: 'American manufacturer of skateboarding shoes',
  },
  {
    name: 'Converse',
    category: 'shoes',
    website: 'https://www.converse.com',
    hasPhysicalStores: true,
    osmTags: ['shop=shoes', 'name~Converse', 'brand~Converse'],
    description: 'American shoe company',
  },

  // Department Stores
  {
    name: "Macy's",
    category: 'department',
    website: 'https://www.macys.com',
    hasPhysicalStores: true,
    osmTags: ['shop=department_store', "name~Macy's", "brand~Macy's"],
    description: 'American department store chain',
  },
  {
    name: 'Nordstrom',
    category: 'department',
    website: 'https://www.nordstrom.com',
    hasPhysicalStores: true,
    osmTags: ['shop=department_store', 'name~Nordstrom', 'brand~Nordstrom'],
    description: 'American luxury department store chain',
  },
  {
    name: "Kohl's",
    category: 'department',
    website: 'https://www.kohls.com',
    hasPhysicalStores: true,
    osmTags: ['shop=department_store', "name~Kohl's", "brand~Kohl's"],
    description: 'American department store retail chain',
  },
  {
    name: 'JCPenney',
    category: 'department',
    website: 'https://www.jcpenney.com',
    hasPhysicalStores: true,
    osmTags: ['shop=department_store', 'name~JCPenney', 'brand~JCPenney'],
    description: 'American department store chain',
  },
  {
    name: "Dillard's",
    category: 'department',
    website: 'https://www.dillards.com',
    hasPhysicalStores: true,
    osmTags: ['shop=department_store', "name~Dillard's", "brand~Dillard's"],
    description: 'American department store chain',
  },

  // Luxury Brands
  {
    name: 'Gucci',
    category: 'luxury',
    website: 'https://www.gucci.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'shop=fashion', 'name~Gucci', 'brand~Gucci'],
    description: 'Italian luxury fashion house',
  },
  {
    name: 'Louis Vuitton',
    category: 'luxury',
    website: 'https://www.louisvuitton.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'shop=fashion', 'name~Louis Vuitton', 'brand~Louis Vuitton'],
    description: 'French luxury fashion house',
  },
  {
    name: 'Prada',
    category: 'luxury',
    website: 'https://www.prada.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'shop=fashion', 'name~Prada', 'brand~Prada'],
    description: 'Italian luxury fashion house',
  },
  {
    name: 'Chanel',
    category: 'luxury',
    website: 'https://www.chanel.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'shop=fashion', 'name~Chanel', 'brand~Chanel'],
    description: 'French luxury fashion house',
  },
  {
    name: 'Versace',
    category: 'luxury',
    website: 'https://www.versace.com',
    hasPhysicalStores: true,
    osmTags: ['shop=clothes', 'shop=fashion', 'name~Versace', 'brand~Versace'],
    description: 'Italian luxury fashion company',
  },

  // Sportswear
  {
    name: 'Under Armour',
    category: 'sportswear',
    website: 'https://www.underarmour.com',
    hasPhysicalStores: true,
    osmTags: ['shop=sports', 'shop=clothes', 'name~Under Armour', 'brand~Under Armour'],
    description: 'American sports equipment company',
  },
  {
    name: 'Lululemon',
    category: 'sportswear',
    website: 'https://www.lululemon.com',
    hasPhysicalStores: true,
    osmTags: ['shop=sports', 'shop=clothes', 'name~Lululemon', 'brand~Lululemon'],
    description: 'Canadian athletic apparel retailer',
  },
  {
    name: 'Athleta',
    category: 'sportswear',
    website: 'https://www.athleta.com',
    hasPhysicalStores: true,
    osmTags: ['shop=sports', 'shop=clothes', 'name~Athleta', 'brand~Athleta'],
    description: 'American women\'s athletic apparel brand',
  },
  {
    name: "Dick's Sporting Goods",
    category: 'sportswear',
    website: 'https://www.dickssportinggoods.com',
    hasPhysicalStores: true,
    osmTags: ['shop=sports', "name~Dick's Sporting Goods", "brand~Dick's Sporting Goods"],
    description: 'American sporting goods retail company',
  },

  // Accessories
  {
    name: 'Sunglass Hut',
    category: 'accessories',
    website: 'https://www.sunglasshut.com',
    hasPhysicalStores: true,
    osmTags: ['shop=optician', 'shop=accessories', 'name~Sunglass Hut', 'brand~Sunglass Hut'],
    description: 'International retailer of sunglasses',
  },
  {
    name: "Claire's",
    category: 'accessories',
    website: 'https://www.claires.com',
    hasPhysicalStores: true,
    osmTags: ['shop=jewelry', 'shop=accessories', "name~Claire's", "brand~Claire's"],
    description: 'American accessories retailer',
  },
  {
    name: 'Pandora',
    category: 'accessories',
    website: 'https://www.pandora.net',
    hasPhysicalStores: true,
    osmTags: ['shop=jewelry', 'name~Pandora', 'brand~Pandora'],
    description: 'Danish jewelry manufacturer',
  },
  {
    name: 'Kay Jewelers',
    category: 'accessories',
    website: 'https://www.kay.com',
    hasPhysicalStores: true,
    osmTags: ['shop=jewelry', 'name~Kay Jewelers', 'brand~Kay Jewelers'],
    description: 'American jewelry store chain',
  },

  // Existing brands (Food & Grocery)
  {
    name: 'Starbucks',
    category: 'food',
    website: 'https://www.starbucks.com',
    hasPhysicalStores: true,
    osmTags: ['amenity=cafe', 'name~Starbucks', 'brand~Starbucks'],
    description: 'American coffeehouse chain',
  },
  {
    name: "McDonald's",
    category: 'food',
    website: 'https://www.mcdonalds.com',
    hasPhysicalStores: true,
    osmTags: ['amenity=fast_food', "name~McDonald's", "brand~McDonald's"],
    description: 'American fast food company',
  },
  {
    name: 'Subway',
    category: 'food',
    website: 'https://www.subway.com',
    hasPhysicalStores: true,
    osmTags: ['amenity=fast_food', 'name~Subway', 'brand~Subway'],
    description: 'American fast food restaurant franchise',
  },
  {
    name: 'Walmart',
    category: 'grocery',
    website: 'https://www.walmart.com',
    hasPhysicalStores: true,
    osmTags: ['shop=supermarket', 'shop=department_store', 'name~Walmart', 'brand~Walmart'],
    description: 'American multinational retail corporation',
  },
  {
    name: 'Target',
    category: 'grocery',
    website: 'https://www.target.com',
    hasPhysicalStores: true,
    osmTags: ['shop=supermarket', 'shop=department_store', 'name~Target', 'brand~Target'],
    description: 'American retail corporation',
  },
  {
    name: 'Costco',
    category: 'grocery',
    website: 'https://www.costco.com',
    hasPhysicalStores: true,
    osmTags: ['shop=supermarket', 'name~Costco', 'brand~Costco'],
    description: 'American multinational corporation',
  },
  {
    name: 'Best Buy',
    category: 'electronics',
    website: 'https://www.bestbuy.com',
    hasPhysicalStores: true,
    osmTags: ['shop=electronics', 'name~Best Buy', 'brand~Best Buy'],
    description: 'American multinational consumer electronics retailer',
  },
];

/**
 * Get brand information by name
 */
export function getBrandByName(name: string): Brand | undefined {
  return BRANDS_DATABASE.find(
    (brand) => brand.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all brands by category
 */
export function getBrandsByCategory(category: Brand['category']): Brand[] {
  return BRANDS_DATABASE.filter((brand) => brand.category === category);
}

/**
 * Search brands by name (partial match)
 */
export function searchBrands(query: string): Brand[] {
  const lowerQuery = query.toLowerCase();
  return BRANDS_DATABASE.filter((brand) =>
    brand.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get all fashion-related brands (clothing, shoes, accessories, sportswear, luxury, department)
 */
export function getFashionBrands(): Brand[] {
  return BRANDS_DATABASE.filter((brand) =>
    ['clothing', 'shoes', 'accessories', 'sportswear', 'luxury', 'department'].includes(brand.category)
  );
}

