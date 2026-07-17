const img = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

function stockFor(sizes, colors, qty = 8) {
  const stock = [];
  for (const size of sizes) {
    for (const color of colors) stock.push({ size, color, qty });
  }
  return stock;
}

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-");
}

function p(base) {
  return {
    slug: slugify(base.name),
    discount: 0,
    isTrending: false,
    isActive: true,
    stock: stockFor(base.sizes, base.colors, base.stockQty || 8),
    ...base
  };
}

export const products = [
  p({
    name: "Black Embroidered Maxi",
    category: "dresses", gender: "women", season: "all", style: "formal",
    price: 6500, discount: 10,
    description: "Elegant black chiffon maxi with hand embroidery on the bodice, perfect for weddings and formal dinners.",
    sizes: ["S", "M", "L", "XL"], colors: ["black"],
    images: [img("1595777457583-95e059d581b8")], rating: 4.8, soldCount: 210, isTrending: true
  }),
  p({
    name: "Red Party Frock",
    category: "dresses", gender: "women", season: "winter", style: "party",
    price: 5200,
    description: "Deep red velvet knee-length frock with flared hem, a showstopper for winter parties.",
    sizes: ["S", "M", "L"], colors: ["red"],
    images: [img("1515372039744-b8f02a3ae446")], rating: 4.6, soldCount: 168, isTrending: true
  }),
  p({
    name: "Beige Lawn Kurti",
    category: "dresses", gender: "women", season: "summer", style: "casual",
    price: 1800, discount: 15,
    description: "Breathable beige lawn kurti with subtle block print, an everyday summer staple.",
    sizes: ["S", "M", "L", "XL"], colors: ["beige"],
    images: [img("1572804013309-59a88b7e92f1")], rating: 4.3, soldCount: 320
  }),
  p({
    name: "Eid Festive Anarkali",
    category: "dresses", gender: "women", season: "summer", style: "eid",
    price: 7800,
    description: "Flowing anarkali in emerald green with gota work and matching dupatta for Eid festivities.",
    sizes: ["S", "M", "L", "XL"], colors: ["green"],
    images: [img("1594633312681-425c7b97ccd1")], rating: 4.9, soldCount: 145, isTrending: true
  }),
  p({
    name: "Navy Chiffon Evening Gown",
    category: "dresses", gender: "women", season: "winter", style: "formal",
    price: 7200, discount: 20,
    description: "Floor-length navy chiffon gown with sequined waistband for formal evenings.",
    sizes: ["S", "M", "L"], colors: ["navy"],
    images: [img("1539533018447-63fcce2678e3")], rating: 4.5, soldCount: 88
  }),
  p({
    name: "White Summer Sundress",
    category: "dresses", gender: "women", season: "summer", style: "casual",
    price: 2400,
    description: "Light white cotton sundress with eyelet lace detailing, made for Lahore summers.",
    sizes: ["S", "M", "L"], colors: ["white"],
    images: [img("1496747611176-843222e1e57c")], rating: 4.2, soldCount: 240
  }),
  p({
    name: "Printed Lawn Two-Piece",
    category: "dresses", gender: "women", season: "summer", style: "casual",
    price: 1650,
    description: "Vibrant printed lawn shirt with matching trousers, unstitched two-piece.",
    sizes: ["S", "M", "L", "XL"], colors: ["green", "white"],
    images: [img("1583391733956-6c78276477e2")], rating: 4.0, soldCount: 410
  }),
  p({
    name: "Velvet Shawl Dress",
    category: "dresses", gender: "women", season: "winter", style: "eid",
    price: 6900, discount: 12,
    description: "Rich maroon-red velvet dress paired with an embroidered shawl for winter Eid looks.",
    sizes: ["M", "L", "XL"], colors: ["red"],
    images: [img("1610030469983-98e550d6193c")], rating: 4.7, soldCount: 96
  }),
  p({
    name: "Casual Denim Shirt Dress",
    category: "dresses", gender: "women", season: "all", style: "casual",
    price: 3200,
    description: "Relaxed-fit denim shirt dress with belt, effortless daytime styling.",
    sizes: ["S", "M", "L"], colors: ["navy"],
    images: [img("1543087903-1ac2ec7aa8c5")], rating: 4.1, soldCount: 130
  }),
  p({
    name: "Pastel Party Peplum",
    category: "dresses", gender: "women", season: "all", style: "party",
    price: 4800,
    description: "Beige-pink peplum top with straight trousers, ready-to-wear party set.",
    sizes: ["S", "M", "L"], colors: ["beige"],
    images: [img("1487412720507-e7ab37603c6f")], rating: 4.4, soldCount: 175
  }),

  p({
    name: "Classic White Dress Shirt",
    category: "shirts", gender: "men", season: "all", style: "formal",
    price: 2800,
    description: "Crisp white cotton dress shirt with spread collar, office and formal wear essential.",
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["white"],
    images: [img("1602810318383-e386cc2a3ccf")], rating: 4.5, soldCount: 380, isTrending: true
  }),
  p({
    name: "Black Formal Shirt",
    category: "shirts", gender: "men", season: "all", style: "formal",
    price: 2600, discount: 10,
    description: "Slim-fit black formal shirt in wrinkle-resistant blended fabric.",
    sizes: ["M", "L", "XL", "XXL"], colors: ["black"],
    images: [img("1603252109303-2751441dd157")], rating: 4.3, soldCount: 290
  }),
  p({
    name: "Navy Casual Check Shirt",
    category: "shirts", gender: "men", season: "winter", style: "casual",
    price: 1950,
    description: "Soft flannel check shirt in navy and green, warm weekend layering.",
    sizes: ["S", "M", "L", "XL"], colors: ["navy", "green"],
    images: [img("1596755094514-f87e34085b2c")], rating: 4.2, soldCount: 260
  }),
  p({
    name: "Summer Linen Shirt",
    category: "shirts", gender: "men", season: "summer", style: "casual",
    price: 2200, discount: 15,
    description: "Breathable beige linen shirt with band collar, beats the June heat.",
    sizes: ["M", "L", "XL"], colors: ["beige", "white"],
    images: [img("1620012253295-c15cc3e65df4")], rating: 4.4, soldCount: 205
  }),
  p({
    name: "Graphic Tee Karachi Edition",
    category: "shirts", gender: "unisex", season: "summer", style: "casual",
    price: 1500,
    description: "Soft-wash cotton tee with minimal Karachi skyline print.",
    sizes: ["S", "M", "L", "XL"], colors: ["black", "white"],
    images: [img("1521572163474-6864f9cf17ab")], rating: 4.0, soldCount: 520
  }),
  p({
    name: "Women Silk Blouse",
    category: "shirts", gender: "women", season: "all", style: "formal",
    price: 3400,
    description: "Lustrous champagne-beige silk blouse with concealed placket.",
    sizes: ["S", "M", "L"], colors: ["beige"],
    images: [img("1564257631407-4deb1f99d992")], rating: 4.6, soldCount: 140
  }),
  p({
    name: "Red Polo Shirt",
    category: "shirts", gender: "men", season: "summer", style: "casual",
    price: 1750, discount: 20,
    description: "Pique-knit red polo with contrast tipping, smart-casual go-to.",
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["red", "navy"],
    images: [img("1583743814966-8936f5b7be1a")], rating: 4.1, soldCount: 335
  }),
  p({
    name: "Eid Kurta Shirt Men",
    category: "shirts", gender: "men", season: "summer", style: "eid",
    price: 3800,
    description: "White cotton kurta with delicate collar embroidery, Eid-morning classic.",
    sizes: ["S", "M", "L", "XL", "XXL"], colors: ["white"],
    images: [img("1598033129183-c4f50c736f10")], rating: 4.7, soldCount: 190, isTrending: true
  }),
  p({
    name: "Winter Turtleneck Women",
    category: "shirts", gender: "women", season: "winter", style: "casual",
    price: 1850,
    description: "Ribbed knit turtleneck in black, layers perfectly under coats.",
    sizes: ["S", "M", "L"], colors: ["black", "beige"],
    images: [img("1608234808654-2a8875faa7fd")], rating: 4.2, soldCount: 225
  }),
  p({
    name: "Party Sequin Top",
    category: "shirts", gender: "women", season: "all", style: "party",
    price: 4200, discount: 25,
    description: "Shimmering black sequin top with cami straps for party nights.",
    sizes: ["S", "M", "L"], colors: ["black"],
    images: [img("1509631179647-0177331693ae")], rating: 4.3, soldCount: 110
  }),

  p({
    name: "Black Leather Loafers",
    category: "shoes", gender: "men", season: "all", style: "formal",
    price: 4900,
    description: "Genuine leather penny loafers with cushioned insole, boardroom-ready.",
    sizes: ["40", "41", "42", "43", "44"], colors: ["black"],
    images: [img("1614252369475-531eba835eb1")], rating: 4.6, soldCount: 260, isTrending: true
  }),
  p({
    name: "White Casual Sneakers",
    category: "shoes", gender: "unisex", season: "all", style: "casual",
    price: 2800, discount: 10,
    description: "Clean white low-top sneakers with rubber sole, pairs with everything.",
    sizes: ["38", "39", "40", "41", "42", "43"], colors: ["white"],
    images: [img("1549298916-b41d501d3772")], rating: 4.4, soldCount: 480
  }),
  p({
    name: "Red Running Trainers",
    category: "shoes", gender: "men", season: "all", style: "casual",
    price: 2950,
    description: "Lightweight mesh running trainers in bold red with breathable upper.",
    sizes: ["40", "41", "42", "43", "44"], colors: ["red"],
    images: [img("1542291026-7eec264c27ff")], rating: 4.3, soldCount: 310
  }),
  p({
    name: "Beige Block Heels",
    category: "shoes", gender: "women", season: "all", style: "party",
    price: 3600,
    description: "Comfortable 2.5-inch beige block heels with ankle strap for parties and dinners.",
    sizes: ["36", "37", "38", "39", "40"], colors: ["beige"],
    images: [img("1543163521-1bf539c55dd2")], rating: 4.5, soldCount: 195
  }),
  p({
    name: "Khussa Traditional Women",
    category: "shoes", gender: "women", season: "all", style: "eid",
    price: 1900, discount: 15,
    description: "Hand-crafted multani khussa with golden thread work, festive and flat.",
    sizes: ["36", "37", "38", "39", "40"], colors: ["red", "green"],
    images: [img("1595950653106-6c9ebd614d3a")], rating: 4.2, soldCount: 275
  }),
  p({
    name: "Peshawari Chappal Classic",
    category: "shoes", gender: "men", season: "summer", style: "casual",
    price: 2400,
    description: "Original-style Peshawari chappal in dark brown-black leather with tyre sole.",
    sizes: ["40", "41", "42", "43", "44", "45"], colors: ["black"],
    images: [img("1603487742131-4160ec999306")], rating: 4.7, soldCount: 350, isTrending: true
  }),
  p({
    name: "Navy Canvas Slip-Ons",
    category: "shoes", gender: "unisex", season: "summer", style: "casual",
    price: 1600,
    description: "Easy navy canvas slip-ons with elastic gore, everyday comfort under Rs 2000.",
    sizes: ["38", "39", "40", "41", "42"], colors: ["navy"],
    images: [img("1600185365483-26d7a4cc7519")], rating: 4.0, soldCount: 290
  }),
  p({
    name: "Winter Chelsea Boots",
    category: "shoes", gender: "men", season: "winter", style: "formal",
    price: 6800, discount: 15,
    description: "Suede-finish black Chelsea boots with warm lining for Islamabad winters.",
    sizes: ["40", "41", "42", "43", "44"], colors: ["black"],
    images: [img("1638247025967-b4e38f787b76")], rating: 4.5, soldCount: 120
  }),
  p({
    name: "Bridal Heels Gold-Beige",
    category: "shoes", gender: "women", season: "all", style: "formal",
    price: 5500,
    description: "Embellished gold-beige stiletto heels made for shaadi season.",
    sizes: ["36", "37", "38", "39"], colors: ["beige"],
    images: [img("1596703263926-eb0762ee17e4")], rating: 4.4, soldCount: 85
  }),
  p({
    name: "Girls Ballet Flats",
    category: "shoes", gender: "women", season: "all", style: "casual",
    price: 1550,
    description: "Soft faux-leather ballet flats in classic black with bow detail.",
    sizes: ["36", "37", "38", "39", "40"], colors: ["black", "beige"],
    images: [img("1560769629-975ec94e6a86")], rating: 3.9, soldCount: 230
  }),

  p({
    name: "Beige Tote Handbag",
    category: "handbags", gender: "women", season: "all", style: "casual",
    price: 3900, discount: 10,
    description: "Spacious structured tote in beige vegan leather with laptop sleeve.",
    sizes: ["One Size"], colors: ["beige"],
    images: [img("1590874103328-eac38a683ce7")], rating: 4.5, soldCount: 220
  }),
  p({
    name: "Black Evening Clutch",
    category: "handbags", gender: "women", season: "all", style: "party",
    price: 2600,
    description: "Sleek black satin clutch with crystal clasp and chain strap.",
    sizes: ["One Size"], colors: ["black"],
    images: [img("1566150905458-1bf1fc113f0d")], rating: 4.3, soldCount: 160
  }),
  p({
    name: "Red Crossbody Bag",
    category: "handbags", gender: "women", season: "all", style: "casual",
    price: 3100,
    description: "Compact red crossbody with adjustable strap and gold-tone hardware.",
    sizes: ["One Size"], colors: ["red"],
    images: [img("1548036328-c9fa89d128fa")], rating: 4.4, soldCount: 185
  }),
  p({
    name: "Embroidered Potli Bag",
    category: "handbags", gender: "women", season: "all", style: "eid",
    price: 1700, discount: 20,
    description: "Traditional potli bag with zardozi embroidery and drawstring closure.",
    sizes: ["One Size"], colors: ["green", "red"],
    images: [img("1584917865442-de89df76afd3")], rating: 4.1, soldCount: 140
  }),
  p({
    name: "Office Satchel Navy",
    category: "handbags", gender: "women", season: "all", style: "formal",
    price: 4600,
    description: "Structured navy satchel with twin compartments, fits A4 documents.",
    sizes: ["One Size"], colors: ["navy"],
    images: [img("1553062407-98eeb64c6a62")], rating: 4.6, soldCount: 105
  }),
  p({
    name: "Mini Shoulder Bag White",
    category: "handbags", gender: "women", season: "summer", style: "party",
    price: 2200,
    description: "Trendy white mini shoulder bag with croc-embossed finish.",
    sizes: ["One Size"], colors: ["white"],
    images: [img("1591561954557-26941169b49e")], rating: 4.2, soldCount: 250, isTrending: true
  }),

  p({
    name: "Pashmina Shawl Winter",
    category: "accessories", gender: "women", season: "winter", style: "formal",
    price: 4400,
    description: "Warm pashmina-blend shawl in deep green with tasseled edges.",
    sizes: ["One Size"], colors: ["green", "beige"],
    images: [img("1601924994987-69e26d50dc26")], rating: 4.7, soldCount: 130
  }),
  p({
    name: "Leather Belt Men",
    category: "accessories", gender: "men", season: "all", style: "formal",
    price: 1600,
    description: "Full-grain black leather belt with brushed silver buckle.",
    sizes: ["32", "34", "36", "38"], colors: ["black"],
    images: [img("1553143820-6bb68bc34679")], rating: 4.3, soldCount: 300
  }),
  p({
    name: "Silver Jhumka Earrings",
    category: "accessories", gender: "women", season: "all", style: "eid",
    price: 1550, discount: 10,
    description: "Oxidised silver jhumkas with pearl drops, festive staple.",
    sizes: ["One Size"], colors: ["white"],
    images: [img("1611652022419-a9419f74343d")], rating: 4.4, soldCount: 265
  }),
  p({
    name: "Classic Analog Watch",
    category: "accessories", gender: "men", season: "all", style: "formal",
    price: 5800, discount: 15,
    description: "Minimal analog watch with navy dial and stainless mesh strap.",
    sizes: ["One Size"], colors: ["navy", "black"],
    images: [img("1523170335258-f5ed11844a49")], rating: 4.6, soldCount: 175
  }),
  p({
    name: "Silk Scarf Printed",
    category: "accessories", gender: "women", season: "summer", style: "casual",
    price: 1500,
    description: "Lightweight printed silk scarf in red and beige paisley.",
    sizes: ["One Size"], colors: ["red", "beige"],
    images: [img("1601924357840-3e50ad4dd9fd")], rating: 4.0, soldCount: 210
  }),
  p({
    name: "Aviator Sunglasses",
    category: "accessories", gender: "unisex", season: "summer", style: "casual",
    price: 2100,
    description: "UV400 aviator sunglasses with gold frame and green gradient lens.",
    sizes: ["One Size"], colors: ["green", "black"],
    images: [img("1572635196237-14b3f281503f")], rating: 4.2, soldCount: 340
  })
];
