import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding OFDS database...");

  // Clean existing records in correct foreign key order
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.favoriteDish.deleteMany();
  await prisma.favoriteRestaurant.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.riderOffer.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.customerAddress.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.operatingHours.deleteMany();
  await prisma.restaurantStaff.deleteMany();
  await prisma.riderProfile.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users across all 4 roles
  const customer1 = await prisma.user.create({
    data: {
      id: "usr_customer_1",
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 9876543210",
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      id: "usr_customer_2",
      name: "Priya Patel",
      email: "priya@example.com",
      phone: "+91 9822334455",
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser1 = await prisma.user.create({
    data: {
      id: "usr_staff_royal",
      name: "Vikram Singhania",
      email: "vikram@royalspice.com",
      phone: "+91 9811223344",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser2 = await prisma.user.create({
    data: {
      id: "usr_staff_dragon",
      name: "Chef Lin Mei",
      email: "lin@dragonwok.com",
      phone: "+91 9877665544",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser3 = await prisma.user.create({
    data: {
      id: "usr_staff_piazza",
      name: "Chef Marco Rossi",
      email: "marco@lapiazza.com",
      phone: "+91 9866554433",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser4 = await prisma.user.create({
    data: {
      id: "usr_staff_dosa",
      name: "Meenakshi Iyer",
      email: "meenakshi@dosacraft.com",
      phone: "+91 9855443322",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser5 = await prisma.user.create({
    data: {
      id: "usr_staff_burger",
      name: "Kabir Anand",
      email: "kabir@burgerfoundry.com",
      phone: "+91 9844332211",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80",
    },
  });

  const riderUser1 = await prisma.user.create({
    data: {
      id: "usr_rider_amit",
      name: "Amit Kumar",
      email: "amit.rider@example.com",
      phone: "+91 9988776655",
      role: "RIDER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    },
  });

  const riderUser2 = await prisma.user.create({
    data: {
      id: "usr_rider_rajesh",
      name: "Rajesh Verma",
      email: "rajesh.rider@example.com",
      phone: "+91 9911223344",
      role: "RIDER",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: "usr_admin_platform",
      name: "Sanjay Mehra (Ops Admin)",
      email: "admin@ofds-platform.com",
      phone: "+91 9899001122",
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    },
  });

  // 2. Customer Saved Addresses
  await prisma.customerAddress.createMany({
    data: [
      {
        id: "addr_rahul_home",
        userId: customer1.id,
        label: "Home",
        addressLine: "Flat 402, Sea Green Apts, Perry Cross Rd, Bandra West",
        landmark: "Near Mehboob Studio",
        city: "Mumbai",
        pincode: "400050",
        latitude: 19.0544,
        longitude: 72.8285,
        isDefault: true,
      },
      {
        id: "addr_rahul_work",
        userId: customer1.id,
        label: "Work",
        addressLine: "Unit 801, WeWork Enam Sambhav, BKC, Bandra East",
        landmark: "Opp. City Park",
        city: "Mumbai",
        pincode: "400051",
        latitude: 19.0657,
        longitude: 72.8687,
        isDefault: false,
      },
      {
        id: "addr_priya_home",
        userId: customer2.id,
        label: "Home",
        addressLine: "Villa 12, Gulmohar Cross Rd 7, Juhu Scheme",
        landmark: "Near Juhu Circle",
        city: "Mumbai",
        pincode: "400049",
        latitude: 19.1075,
        longitude: 72.8263,
        isDefault: true,
      },
    ],
  });

  // 3. Rider Profiles
  await prisma.riderProfile.createMany({
    data: [
      {
        id: "rider_prof_amit",
        userId: riderUser1.id,
        vehicleType: "MOTORCYCLE",
        licenseNumber: "MH-02-2021-008741",
        isAvailable: true,
        currentLatitude: 19.058,
        currentLongitude: 72.835,
        lastPingAt: new Date(),
      },
      {
        id: "rider_prof_rajesh",
        userId: riderUser2.id,
        vehicleType: "EV_SCOOTER",
        licenseNumber: "MH-01-2022-005612",
        isAvailable: true,
        currentLatitude: 19.062,
        currentLongitude: 72.841,
        lastPingAt: new Date(),
      },
    ],
  });

  // 4. Restaurant 1: Royal Spice Kitchen
  const royalSpice = await prisma.restaurant.create({
    data: {
      id: "rest_royal_spice",
      name: "Royal Spice Kitchen",
      slug: "royal-spice-kitchen",
      description: "Authentic Awadhi & Mughlai master craft recipes, slow-dum biryanis, rich gravies and smoky tandoori kebabs.",
      fssaiLicense: "11522001000452",
      phone: "+91 22 2640 9801",
      email: "orders@royalspice.com",
      address: "14 Hill Road, Bandra West",
      city: "Mumbai",
      latitude: 19.0549,
      longitude: 72.8322,
      deliveryRadiusKm: 12.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 25,
      commissionPercentage: 15.0,
      rating: 4.8,
      reviewCount: 342,
      imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "North Indian, Mughlai, Biryani, Kebabs",
    },
  });

  // Link staff to Royal Spice
  await prisma.restaurantStaff.create({
    data: {
      userId: staffUser1.id,
      restaurantId: royalSpice.id,
      role: "OWNER",
    },
  });

  // Operating Hours for Royal Spice (All days 11am to 11pm)
  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.create({
      data: {
        restaurantId: royalSpice.id,
        dayOfWeek: day,
        openTime: "11:00",
        closeTime: "23:00",
      },
    });
  }

  // Categories & Menu Items for Royal Spice
  const catKebabs = await prisma.menuCategory.create({
    data: {
      restaurantId: royalSpice.id,
      name: "Tandoori Starters & Kebabs",
      displayOrder: 1,
    },
  });

  const catBiryanis = await prisma.menuCategory.create({
    data: {
      restaurantId: royalSpice.id,
      name: "Signature Dum Biryanis",
      displayOrder: 2,
    },
  });

  const catMains = await prisma.menuCategory.create({
    data: {
      restaurantId: royalSpice.id,
      name: "Royal Curries & Gravies",
      displayOrder: 3,
    },
  });

  const catBreads = await prisma.menuCategory.create({
    data: {
      restaurantId: royalSpice.id,
      name: "Tandoori Breads & Drinks",
      displayOrder: 4,
    },
  });

  const itemMurghMalai = await prisma.menuItem.create({
    data: {
      id: "item_murgh_malai",
      restaurantId: royalSpice.id,
      categoryId: catKebabs.id,
      name: "Murgh Malai Tikka (6 Pcs)",
      description: "Boneless chicken infused with cardamom, cream cheese, roasted garlic and finished on charcoal grill.",
      pricePaise: 34900, // Rs 349
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  const itemPaneerTikka = await prisma.menuItem.create({
    data: {
      id: "item_paneer_tikka",
      restaurantId: royalSpice.id,
      categoryId: catKebabs.id,
      name: "Achari Paneer Tikka (6 Pcs)",
      description: "Char-grilled fresh cottage cheese cubes marinated in pickling spices and mustard oil.",
      pricePaise: 29900, // Rs 299
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  const itemGoshtBiryani = await prisma.menuItem.create({
    data: {
      id: "item_dum_biryani",
      restaurantId: royalSpice.id,
      categoryId: catBiryanis.id,
      name: "Awadhi Dum Gosht Biryani",
      description: "Succulent tender mutton pieces cooked with long-grain basmati rice, saffron, and whole royal spices.",
      pricePaise: 44900, // Rs 449
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 25,
    },
  });

  const itemButterChicken = await prisma.menuItem.create({
    data: {
      id: "item_butter_chicken",
      restaurantId: royalSpice.id,
      categoryId: catMains.id,
      name: "Old Delhi Butter Chicken",
      description: "Tandoori chicken pulled and simmered in a velvety buttery tomato gravy enriched with fenugreek leaves.",
      pricePaise: 38900, // Rs 389
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  const itemGarlicNaan = await prisma.menuItem.create({
    data: {
      id: "item_garlic_naan",
      restaurantId: royalSpice.id,
      categoryId: catBreads.id,
      name: "Butter Garlic Naan",
      description: "Leavened flatbread baked in tandoor, brushed with melting farm butter and minced roasted garlic.",
      pricePaise: 6500, // Rs 65
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  // 5. Restaurant 2: Dragon Wok & Bao
  const dragonWok = await prisma.restaurant.create({
    data: {
      id: "rest_dragon_wok",
      name: "Dragon Wok & Bao",
      slug: "dragon-wok-bao",
      description: "Handcrafted dim sum, cloud-soft bao buns, spicy Sichuan wok stir-fries, and fragrant Asian bowls.",
      fssaiLicense: "11523002000889",
      phone: "+91 22 2605 1199",
      email: "hello@dragonwok.com",
      address: "28 Waterfield Road, Bandra West",
      city: "Mumbai",
      latitude: 19.0575,
      longitude: 72.8341,
      deliveryRadiusKm: 10.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 20,
      commissionPercentage: 15.0,
      rating: 4.6,
      reviewCount: 218,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Pan-Asian, Chinese, Dim Sum, Noodles",
    },
  });

  await prisma.restaurantStaff.create({
    data: {
      userId: staffUser2.id,
      restaurantId: dragonWok.id,
      role: "MANAGER",
    },
  });

  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.create({
      data: {
        restaurantId: dragonWok.id,
        dayOfWeek: day,
        openTime: "12:00",
        closeTime: "23:30",
      },
    });
  }

  const catDimsum = await prisma.menuCategory.create({
    data: {
      restaurantId: dragonWok.id,
      name: "Dim Sum & Steamed Baos",
      displayOrder: 1,
    },
  });

  const catNoodles = await prisma.menuCategory.create({
    data: {
      restaurantId: dragonWok.id,
      name: "Wok Tossed Noodles & Rice",
      displayOrder: 2,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_truffle_dumpling",
      restaurantId: dragonWok.id,
      categoryId: catDimsum.id,
      name: "Truffle Edamame Dumplings (4 Pcs)",
      description: "Silky crystal skin filled with smashed edamame, water chestnut and a drop of white truffle oil.",
      pricePaise: 32000, // Rs 320
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_sichuan_bao",
      restaurantId: dragonWok.id,
      categoryId: catDimsum.id,
      name: "Crispy Sichuan Chicken Bao (2 Pcs)",
      description: "Puffy steamed lotus buns stuffed with crispy chicken, pickled cucumbers, scallions, and spicy mayo.",
      pricePaise: 28000, // Rs 280
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_hakka_noodles",
      restaurantId: dragonWok.id,
      categoryId: catNoodles.id,
      name: "Classic Street Hakka Noodles",
      description: "Thin wok noodles tossed high with crunchy bell peppers, cabbage, dark soy, and toasted sesame oil.",
      pricePaise: 24000, // Rs 240
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  // Restaurant 3: La Piazza Rustica (Italian & Woodfired Pizza)
  const laPiazza = await prisma.restaurant.create({
    data: {
      id: "rest_la_piazza",
      name: "La Piazza Rustica",
      slug: "la-piazza-rustica",
      description: "Authentic Neapolitan wood-fired pizzas, slow-simmered artisanal pastas, and traditional Italian dolci made with imported Italian flour and San Marzano tomatoes.",
      fssaiLicense: "11524003001245",
      phone: "+91 22 2648 3322",
      email: "ciao@lapiazza.com",
      address: "42 14th Road, Khar West",
      city: "Mumbai",
      latitude: 19.0682,
      longitude: 72.8351,
      deliveryRadiusKm: 10.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 25,
      commissionPercentage: 15.0,
      rating: 4.7,
      reviewCount: 184,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Italian, Woodfired Pizza, Pasta, Desserts",
    },
  });

  await prisma.restaurantStaff.create({
    data: {
      userId: staffUser3.id,
      restaurantId: laPiazza.id,
      role: "OWNER",
    },
  });

  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.create({
      data: {
        restaurantId: laPiazza.id,
        dayOfWeek: day,
        openTime: "12:00",
        closeTime: "23:00",
      },
    });
  }

  const catPizzas = await prisma.menuCategory.create({
    data: {
      restaurantId: laPiazza.id,
      name: "Neapolitan Wood-Fired Pizzas",
      displayOrder: 1,
    },
  });

  const catPastas = await prisma.menuCategory.create({
    data: {
      restaurantId: laPiazza.id,
      name: "Handcrafted Artisanal Pastas",
      displayOrder: 2,
    },
  });

  const catDolci = await prisma.menuCategory.create({
    data: {
      restaurantId: laPiazza.id,
      name: "Italian Dolci & Beverages",
      displayOrder: 3,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_margherita",
      restaurantId: laPiazza.id,
      categoryId: catPizzas.id,
      name: "Margherita Di Bufala (11 Inch)",
      description: "San Marzano D.O.P. tomato sauce, fresh buffalo mozzarella, fresh sweet basil, and extra virgin olive oil.",
      pricePaise: 42900, // Rs 429
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_pepperoni",
      restaurantId: laPiazza.id,
      categoryId: catPizzas.id,
      name: "Spicy Pepperoni & Burrata Pizza",
      description: "Charred leopard-spotted crust topped with Italian pepperoni, tomato passata, mozzarella, and a molten fresh burrata center.",
      pricePaise: 54900, // Rs 549
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 22,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_truffle_pasta",
      restaurantId: laPiazza.id,
      categoryId: catPastas.id,
      name: "Truffle Fettuccine Alfredo",
      description: "Fresh egg fettuccine tossed in a rich slow-emulsified butter sauce, wild forest mushrooms, and aromatic white truffle essence.",
      pricePaise: 47900, // Rs 479
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_tiramisu",
      restaurantId: laPiazza.id,
      categoryId: catDolci.id,
      name: "Classic Espresso Tiramisu",
      description: "Italian savoiardi ladyfinger biscuits infused with dark roasted espresso, layered with silky mascarpone and dusted with Valrhona cocoa.",
      pricePaise: 26900, // Rs 269
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  // Restaurant 4: Dosa Craft & Co. (South Indian Heritage)
  const dosaCraft = await prisma.restaurant.create({
    data: {
      id: "rest_dosa_craft",
      name: "Dosa Craft & Co.",
      slug: "dosa-craft-co",
      description: "Legendary South Indian tiffins, crisp golden ghee roast dosas, gunpowder podi specials, steamed fluffy idlis, and authentic froth-topped filter coffee.",
      fssaiLicense: "11521004000319",
      phone: "+91 22 2409 5566",
      email: "vanakkam@dosacraft.com",
      address: "18 Dr. Ambedkar Road, Matunga East",
      city: "Mumbai",
      latitude: 19.0269,
      longitude: 72.8553,
      deliveryRadiusKm: 12.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 15,
      commissionPercentage: 15.0,
      rating: 4.9,
      reviewCount: 512,
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "South Indian, Dosas, Tiffin, Pure Veg",
    },
  });

  await prisma.restaurantStaff.create({
    data: {
      userId: staffUser4.id,
      restaurantId: dosaCraft.id,
      role: "OWNER",
    },
  });

  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.create({
      data: {
        restaurantId: dosaCraft.id,
        dayOfWeek: day,
        openTime: "07:30",
        closeTime: "22:30",
      },
    });
  }

  const catDosas = await prisma.menuCategory.create({
    data: {
      restaurantId: dosaCraft.id,
      name: "Signature Ghee Roast Dosas",
      displayOrder: 1,
    },
  });

  const catTiffins = await prisma.menuCategory.create({
    data: {
      restaurantId: dosaCraft.id,
      name: "Steamed Idlis & Crispy Vadas",
      displayOrder: 2,
    },
  });

  const catCoffee = await prisma.menuCategory.create({
    data: {
      restaurantId: dosaCraft.id,
      name: "Traditional South Indian Beverages",
      displayOrder: 3,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_mysore_masala",
      restaurantId: dosaCraft.id,
      categoryId: catDosas.id,
      name: "Mysore Ghee Roast Masala Dosa",
      description: "Crispy red-hot crepe smeared with spicy roasted garlic-chilli chutney, spiced potato bhaji, served with coconut chutney & drumstick sambar.",
      pricePaise: 18900, // Rs 189
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_podi_dosa",
      restaurantId: dosaCraft.id,
      categoryId: catDosas.id,
      name: "Chettinad Gunpowder Podi Dosa",
      description: "Drizzled generously with pure aromatic cow ghee and crusted with homemade spicy roasted lentil gunpowder podi.",
      pricePaise: 19900, // Rs 199
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_mini_idlis",
      restaurantId: dosaCraft.id,
      categoryId: catTiffins.id,
      name: "Ghee Sambar Mini Idlis (14 Pcs)",
      description: "Bite-sized pillow-soft steamed rice cakes submerged in boiling aromatic spiced shallot-drumstick sambar with melting ghee.",
      pricePaise: 14900, // Rs 149
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_filter_coffee",
      restaurantId: dosaCraft.id,
      categoryId: catCoffee.id,
      name: "Madras Degree Filter Coffee",
      description: "Freshly brewed decoction from plantation Arabica & Peaberry beans, boiled with thick dairy milk and frothed in traditional brass dabarah.",
      pricePaise: 6500, // Rs 65
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 5,
    },
  });

  // Restaurant 5: The Burger Foundry (Gourmet Burgers & Shakes)
  const burgerFoundry = await prisma.restaurant.create({
    data: {
      id: "rest_burger_foundry",
      name: "The Burger Foundry",
      slug: "the-burger-foundry",
      description: "Chefs crafting smashed patty perfection, toasted buttery brioche buns, aged cheddar melts, hand-cut loaded crinkle fries, and thick artisan shakes.",
      fssaiLicense: "11523005001882",
      phone: "+91 22 2650 7788",
      email: "hello@burgerfoundry.com",
      address: "G-Block, Bandra Kurla Complex (BKC)",
      city: "Mumbai",
      latitude: 19.0664,
      longitude: 72.8679,
      deliveryRadiusKm: 11.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 20,
      commissionPercentage: 15.0,
      rating: 4.6,
      reviewCount: 289,
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Gourmet Burgers, Loaded Fries, American, Shakes",
    },
  });

  await prisma.restaurantStaff.create({
    data: {
      userId: staffUser5.id,
      restaurantId: burgerFoundry.id,
      role: "OWNER",
    },
  });

  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.create({
      data: {
        restaurantId: burgerFoundry.id,
        dayOfWeek: day,
        openTime: "11:30",
        closeTime: "23:59",
      },
    });
  }

  const catBurgers = await prisma.menuCategory.create({
    data: {
      restaurantId: burgerFoundry.id,
      name: "Signature Smash Burgers",
      displayOrder: 1,
    },
  });

  const catFries = await prisma.menuCategory.create({
    data: {
      restaurantId: burgerFoundry.id,
      name: "Loaded Crinkle Fries & Bites",
      displayOrder: 2,
    },
  });

  const catShakes = await prisma.menuCategory.create({
    data: {
      restaurantId: burgerFoundry.id,
      name: "Artisan Thick Shakes",
      displayOrder: 3,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_foundry_double",
      restaurantId: burgerFoundry.id,
      categoryId: catBurgers.id,
      name: "The Foundry Double Smash Burger",
      description: "Two crispy-edged seared chicken patties, double English cheddar, caramelized shallots, house foundry pickles, secret smoke sauce on golden brioche bun.",
      pricePaise: 38900, // Rs 389
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_truffle_mushroom_burger",
      restaurantId: burgerFoundry.id,
      categoryId: catBurgers.id,
      name: "Truffle Portobello Smash Burger",
      description: "Crispy panko-crusted portobello mushroom patty, melting Swiss cheese, charred sweet onions, and white truffle garlic aioli.",
      pricePaise: 34900, // Rs 349
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_periperi_fries",
      restaurantId: burgerFoundry.id,
      categoryId: catFries.id,
      name: "Peri-Peri Cheese Melt Fries",
      description: "Freshly fried golden crinkle-cut potatoes dusted in zesty African bird's eye spice, drizzled with warm cheddar cheese sauce.",
      pricePaise: 19900, // Rs 199
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_caramel_shake",
      restaurantId: burgerFoundry.id,
      categoryId: catShakes.id,
      name: "Salted Caramel Pretzel Thick Shake",
      description: "Hand-spun French vanilla ice cream shake infused with burnt butterscotch, Himalayan sea salt caramel, topped with crushed pretzel crunch.",
      pricePaise: 21900, // Rs 219
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 8,
    },
  });

  // 6. Promotional Coupons
  await prisma.coupon.createMany({
    data: [
      {
        id: "cpn_first50",
        code: "FIRST50",
        description: "50% off on your first food order up to ₹100",
        discountType: "PERCENTAGE",
        discountValue: 50,
        minOrderPaise: 19900,
        maxDiscountPaise: 10000,
        validFrom: new Date(Date.now() - 86400000 * 5),
        validTo: new Date(Date.now() + 86400000 * 90),
        usageLimit: 500,
        perUserLimit: 1,
        timesUsed: 12,
        isActive: true,
      },
      {
        id: "cpn_royalfeast",
        code: "ROYALFEAST",
        description: "Flat ₹150 off on orders above ₹499",
        discountType: "FIXED",
        discountValue: 15000,
        minOrderPaise: 49900,
        maxDiscountPaise: 15000,
        validFrom: new Date(Date.now() - 86400000 * 2),
        validTo: new Date(Date.now() + 86400000 * 60),
        usageLimit: 300,
        perUserLimit: 2,
        timesUsed: 34,
        isActive: true,
      },
      {
        id: "cpn_freedel",
        code: "FREEDEL",
        description: "Free Delivery on orders above ₹250 (₹40 off)",
        discountType: "FIXED",
        discountValue: 4000,
        minOrderPaise: 25000,
        maxDiscountPaise: 4000,
        validFrom: new Date(Date.now() - 86400000 * 10),
        validTo: new Date(Date.now() + 86400000 * 120),
        usageLimit: 1000,
        perUserLimit: 5,
        timesUsed: 89,
        isActive: true,
      },
    ],
  });

  // 7. Seed Past Delivered Order (Demonstrating Complete Lifecycle + Review)
  const pastOrder = await prisma.order.create({
    data: {
      id: "ord_past_delivered_1",
      orderNumber: "ORD-94821",
      customerId: customer1.id,
      restaurantId: royalSpice.id,
      riderId: riderUser1.id,
      status: "DELIVERED",
      subtotalPaise: 73800, // 349 + 389 = 738
      taxPaise: 3690, // 5% GST
      deliveryFeePaise: 4000,
      platformFeePaise: 1000,
      discountPaise: 10000, // FIRST50 discount
      totalPaise: 68890, // Rs 688.90
      deliveryAddressSnapshot: JSON.stringify({
        label: "Home",
        addressLine: "Flat 402, Sea Green Apts, Perry Cross Rd, Bandra West",
        city: "Mumbai",
        pincode: "400050",
      }),
      restaurantSnapshot: JSON.stringify({
        name: "Royal Spice Kitchen",
        phone: "+91 22 2640 9801",
        address: "14 Hill Road, Bandra West",
      }),
      deliveryOtpHash: "verified_hash_9482",
      estimatedDeliveryMinutes: 30,
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      items: {
        create: [
          {
            menuItemId: itemMurghMalai.id,
            nameSnapshot: "Murgh Malai Tikka (6 Pcs)",
            pricePaiseSnapshot: 34900,
            quantity: 1,
            totalPaise: 34900,
          },
          {
            menuItemId: itemButterChicken.id,
            nameSnapshot: "Old Delhi Butter Chicken",
            pricePaiseSnapshot: 38900,
            quantity: 1,
            totalPaise: 38900,
          },
        ],
      },
      statusHistory: {
        create: [
          { previousStatus: null, newStatus: "PLACED", actorId: customer1.id, actorRole: "CUSTOMER", reason: "Order placed and paid" },
          { previousStatus: "PLACED", newStatus: "ACCEPTED", actorId: staffUser1.id, actorRole: "RESTAURANT_STAFF", reason: "Accepted by kitchen staff" },
          { previousStatus: "ACCEPTED", newStatus: "PREPARING", actorId: staffUser1.id, actorRole: "RESTAURANT_STAFF", reason: "Cooking started" },
          { previousStatus: "PREPARING", newStatus: "READY", actorId: staffUser1.id, actorRole: "RESTAURANT_STAFF", reason: "Food packed and ready" },
          { previousStatus: "READY", newStatus: "PICKED_UP", actorId: riderUser1.id, actorRole: "RIDER", reason: "Order picked up by rider Amit" },
          { previousStatus: "PICKED_UP", newStatus: "DELIVERED", actorId: riderUser1.id, actorRole: "RIDER", reason: "Customer verified delivery via OTP" },
        ],
      },
      payments: {
        create: {
          gateway: "RAZORPAY",
          gatewayOrderId: "order_rzp_mock_past_94821",
          gatewayPaymentId: "pay_rzp_mock_pay_94821",
          status: "COMPLETED",
          amountPaise: 68890,
          idempotencyKey: "idem_key_past_order_94821",
        },
      },
    },
  });

  // Verified review for the delivered order
  await prisma.review.create({
    data: {
      orderId: pastOrder.id,
      restaurantId: royalSpice.id,
      userId: customer1.id,
      rating: 5,
      comment: "Outstanding food! The Murgh Malai Tikka melted in mouth and the delivery arrived piping hot in 25 minutes.",
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 * 2 + 3600000),
    },
  });

  // 8. Seed Active In-Flight Order (Ready / Out for Delivery with Active Rider)
  await prisma.order.create({
    data: {
      id: "ord_active_live_2",
      orderNumber: "ORD-94850",
      customerId: customer1.id,
      restaurantId: royalSpice.id,
      riderId: riderUser1.id,
      status: "PREPARING",
      subtotalPaise: 44900, // Gosht Biryani
      taxPaise: 2245,
      deliveryFeePaise: 4000,
      platformFeePaise: 1000,
      discountPaise: 0,
      totalPaise: 52145, // Rs 521.45
      deliveryAddressSnapshot: JSON.stringify({
        label: "Home",
        addressLine: "Flat 402, Sea Green Apts, Perry Cross Rd, Bandra West",
        city: "Mumbai",
        pincode: "400050",
      }),
      restaurantSnapshot: JSON.stringify({
        name: "Royal Spice Kitchen",
        phone: "+91 22 2640 9801",
        address: "14 Hill Road, Bandra West",
      }),
      deliveryOtpHash: "7821", // 4-digit OTP for testing
      deliveryOtpExpiresAt: new Date(Date.now() + 3600000),
      deliveryOtpAttempts: 0,
      estimatedDeliveryMinutes: 25,
      createdAt: new Date(),
      items: {
        create: [
          {
            menuItemId: itemGoshtBiryani.id,
            nameSnapshot: "Awadhi Dum Gosht Biryani",
            pricePaiseSnapshot: 44900,
            quantity: 1,
            totalPaise: 44900,
          },
        ],
      },
      statusHistory: {
        create: [
          { previousStatus: null, newStatus: "PLACED", actorId: customer1.id, actorRole: "CUSTOMER", reason: "Order placed via online payment" },
          { previousStatus: "PLACED", newStatus: "ACCEPTED", actorId: staffUser1.id, actorRole: "RESTAURANT_STAFF", reason: "Restaurant accepted" },
          { previousStatus: "ACCEPTED", newStatus: "PREPARING", actorId: staffUser1.id, actorRole: "RESTAURANT_STAFF", reason: "Kitchen preparing biryani" },
        ],
      },
      payments: {
        create: {
          gateway: "RAZORPAY",
          gatewayOrderId: "order_rzp_mock_live_94850",
          gatewayPaymentId: "pay_rzp_mock_pay_94850",
          status: "COMPLETED",
          amountPaise: 52145,
          idempotencyKey: "idem_key_live_order_94850",
        },
      },
    },
  });

  // 9. Support Ticket (Sample dispute)
  await prisma.supportTicket.create({
    data: {
      ticketNumber: "TCK-88210",
      userId: customer1.id,
      orderId: pastOrder.id,
      category: "MISSING_ITEM",
      status: "RESOLVED",
      priority: "MEDIUM",
      subject: "Extra chutney box was not in the package",
      description: "Ordered Murgh Malai Tikka and requested extra mint dip. The food was excellent but mint dip was missing.",
      resolution: "Apologized and credited ₹50 wallet discount coupon code.",
    },
  });

  // 10. Audit Log record
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      actorRole: "ADMIN",
      action: "RESTAURANT_APPROVED",
      resource: "Restaurant",
      resourceId: royalSpice.id,
      metadata: JSON.stringify({ verifiedFssai: "11522001000452", note: "Approved during onboarding review" }),
    },
  });

  console.log("Database seeded successfully with 5 culinary restaurants, 10 users, 20+ dishes, 3 coupons, and realistic orders!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
