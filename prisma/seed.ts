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

  // 1. Create Users across all roles
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

  const customer3 = await prisma.user.create({
    data: {
      id: "usr_customer_3",
      name: "Aman Kapoor",
      email: "aman@example.com",
      phone: "+91 9833445566",
      role: "CUSTOMER",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    },
  });

  // Staff users for all 12 restaurants
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

  const staffUser6 = await prisma.user.create({
    data: {
      id: "usr_staff_sakura",
      name: "Chef Kenji Sato",
      email: "kenji@sakurasushi.com",
      phone: "+91 9833221100",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser7 = await prisma.user.create({
    data: {
      id: "usr_staff_elfuego",
      name: "Carlos Mendez",
      email: "carlos@elfuegotacos.com",
      phone: "+91 9822110099",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser8 = await prisma.user.create({
    data: {
      id: "usr_staff_beirut",
      name: "Ziad Haddad",
      email: "ziad@beirutlounge.com",
      phone: "+91 9811009988",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser9 = await prisma.user.create({
    data: {
      id: "usr_staff_petit",
      name: "Camille Dubois",
      email: "camille@lepetitcroissant.com",
      phone: "+91 9899887766",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser10 = await prisma.user.create({
    data: {
      id: "usr_staff_greenbowl",
      name: "Ananya Sen",
      email: "ananya@greenbowlhealth.com",
      phone: "+91 9888776655",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser11 = await prisma.user.create({
    data: {
      id: "usr_staff_chowpatty",
      name: "Girish Sharma",
      email: "girish@chowpattychaat.com",
      phone: "+91 9877889900",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    },
  });

  const staffUser12 = await prisma.user.create({
    data: {
      id: "usr_staff_coastal",
      name: "Devdas Naik",
      email: "devdas@southerncoast.com",
      phone: "+91 9866778899",
      role: "RESTAURANT_STAFF",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80",
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

  // Helper for 7-day operating hours
  async function createAllWeekHours(restaurantId: string, open = "11:00", close = "23:00") {
    for (let day = 0; day < 7; day++) {
      await prisma.operatingHours.create({
        data: { restaurantId, dayOfWeek: day, openTime: open, closeTime: close },
      });
    }
  }

  // ==========================================
  // Restaurant 1: Royal Spice Kitchen
  // ==========================================
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

  await prisma.restaurantStaff.create({
    data: { userId: staffUser1.id, restaurantId: royalSpice.id, role: "OWNER" },
  });
  await createAllWeekHours(royalSpice.id);

  const catKebabs = await prisma.menuCategory.create({
    data: { restaurantId: royalSpice.id, name: "Tandoori Starters & Kebabs", displayOrder: 1 },
  });
  const catBiryanis = await prisma.menuCategory.create({
    data: { restaurantId: royalSpice.id, name: "Signature Dum Biryanis", displayOrder: 2 },
  });
  const catMains = await prisma.menuCategory.create({
    data: { restaurantId: royalSpice.id, name: "Royal Curries & Gravies", displayOrder: 3 },
  });
  const catBreads = await prisma.menuCategory.create({
    data: { restaurantId: royalSpice.id, name: "Tandoori Breads & Drinks", displayOrder: 4 },
  });
  const catRoyalDessert = await prisma.menuCategory.create({
    data: { restaurantId: royalSpice.id, name: "Shahi Desserts & Mithai", displayOrder: 5 },
  });

  const itemMurghMalai = await prisma.menuItem.create({
    data: {
      id: "item_murgh_malai",
      restaurantId: royalSpice.id,
      categoryId: catKebabs.id,
      name: "Murgh Malai Tikka (6 Pcs)",
      description: "Boneless chicken infused with cardamom, cream cheese, roasted garlic and finished on charcoal grill.",
      pricePaise: 34900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_paneer_tikka",
      restaurantId: royalSpice.id,
      categoryId: catKebabs.id,
      name: "Achari Paneer Tikka (6 Pcs)",
      description: "Char-grilled fresh cottage cheese cubes marinated in pickling spices, hung curd, and mustard oil.",
      pricePaise: 29900,
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
      description: "Succulent tender mutton pieces cooked with aged long-grain basmati rice, saffron, and royal whole spices.",
      pricePaise: 44900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 25,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_subz_biryani",
      restaurantId: royalSpice.id,
      categoryId: catBiryanis.id,
      name: "Lucknowi Subz Dum Biryani",
      description: "Garden fresh seasonal vegetables and cottage cheese sealed and slow cooked with kewra and aromatic basmati.",
      pricePaise: 32900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 22,
    },
  });

  const itemButterChicken = await prisma.menuItem.create({
    data: {
      id: "item_butter_chicken",
      restaurantId: royalSpice.id,
      categoryId: catMains.id,
      name: "Old Delhi Butter Chicken",
      description: "Tandoori chicken pulled and simmered in a velvety buttery tomato gravy enriched with kasoori methi.",
      pricePaise: 38900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_dal_makhani",
      restaurantId: royalSpice.id,
      categoryId: catMains.id,
      name: "Dal Makhani Bukhara",
      description: "Black lentils slow-cooked overnight over charcoal embers, finished with churned white butter and cream.",
      pricePaise: 28900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_garlic_naan",
      restaurantId: royalSpice.id,
      categoryId: catBreads.id,
      name: "Butter Garlic Naan",
      description: "Leavened flatbread baked in tandoor, brushed with melting farm butter and minced roasted garlic.",
      pricePaise: 6500,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_shahi_tukda",
      restaurantId: royalSpice.id,
      categoryId: catRoyalDessert.id,
      name: "Shahi Tukda with Rabdi",
      description: "Ghee-fried golden artisanal bread soaked in saffron syrup, smothered with thick rabdi and Iranian pistachios.",
      pricePaise: 18900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  // ==========================================
  // Restaurant 2: Dragon Wok & Bao
  // ==========================================
  const dragonWok = await prisma.restaurant.create({
    data: {
      id: "rest_dragon_wok",
      name: "Dragon Wok & Bao",
      slug: "dragon-wok-bao",
      description: "Pan-Asian kitchen crafting handmade dim sums, fire-breath wok noodles, and authentic Sichuan delicacies.",
      fssaiLicense: "11522001000889",
      phone: "+91 22 2655 4410",
      email: "chef@dragonwok.com",
      address: "21 Pali Mala Road, Bandra West",
      city: "Mumbai",
      latitude: 19.0612,
      longitude: 72.8291,
      deliveryRadiusKm: 10.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 20,
      commissionPercentage: 16.0,
      rating: 4.7,
      reviewCount: 289,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Pan-Asian, Dim Sum, Chinese, Thai",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser2.id, restaurantId: dragonWok.id, role: "OWNER" },
  });
  await createAllWeekHours(dragonWok.id);

  const catDimsum = await prisma.menuCategory.create({
    data: { restaurantId: dragonWok.id, name: "Artisanal Dim Sum & Baos", displayOrder: 1 },
  });
  const catWokMains = await prisma.menuCategory.create({
    data: { restaurantId: dragonWok.id, name: "Wok Tossed Mains & Curries", displayOrder: 2 },
  });
  const catAsianBowls = await prisma.menuCategory.create({
    data: { restaurantId: dragonWok.id, name: "Asian Rice & Noodle Bowls", displayOrder: 3 },
  });
  const catAsianApps = await prisma.menuCategory.create({
    data: { restaurantId: dragonWok.id, name: "Crispy Appetizers & Coolers", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_truffle_dimsum",
      restaurantId: dragonWok.id,
      categoryId: catDimsum.id,
      name: "Crystal Truffle Edamame Dim Sum (4 Pcs)",
      description: "Handcrafted translucent dumpling wrapper stuffed with crushed edamame, water chestnut, and white truffle oil.",
      pricePaise: 34900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_prawn_siumai",
      restaurantId: dragonWok.id,
      categoryId: catDimsum.id,
      name: "Crispy Prawn Siu Mai (4 Pcs)",
      description: "Steamed open-faced dumplings filled with wild tiger prawn mince, water chestnut, scallions, topped with tobiko caviar.",
      pricePaise: 38900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_kung_pao",
      restaurantId: dragonWok.id,
      categoryId: catWokMains.id,
      name: "Kung Pao Chicken Szechuan",
      description: "Wok-seared tender chicken tossed with dry red chili pods, roasted peanuts, Sichuan peppercorns and scallions.",
      pricePaise: 37900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_chili_garlic_noodles",
      restaurantId: dragonWok.id,
      categoryId: catWokMains.id,
      name: "Fiery Singapore Chili Garlic Noodles",
      description: "Thin wok noodles tossed at high flame with burnt garlic, bird's eye chilies, bell peppers, and scallion curls.",
      pricePaise: 29900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 16,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_nasi_goreng",
      restaurantId: dragonWok.id,
      categoryId: catAsianBowls.id,
      name: "Indonesian Nasi Goreng Bowl",
      description: "Fragrant jasmine rice wok-fried in sweet kecap manis with chicken satay skewers, sunny-side egg, and prawn crackers.",
      pricePaise: 41900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_lotus_stem",
      restaurantId: dragonWok.id,
      categoryId: catAsianApps.id,
      name: "Crispy Honey Chili Lotus Stem",
      description: "Crunchy sliced lotus stem chips glazed in spicy bird's eye chili, toasted white sesame, and organic honey.",
      pricePaise: 28900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  // ==========================================
  // Restaurant 3: La Piazza Trattoria
  // ==========================================
  const laPiazza = await prisma.restaurant.create({
    data: {
      id: "rest_la_piazza",
      name: "La Piazza Trattoria",
      slug: "la-piazza-trattoria",
      description: "Woodfired Neapolitan sourdough pizzas, hand-extruded durum pasta, and artisanal Italian gelato from Napoli.",
      fssaiLicense: "11522001000714",
      phone: "+91 22 2648 1234",
      email: "ciao@lapiazza.com",
      address: "Shop 4, Ground Floor, Waterfield Road, Bandra West",
      city: "Mumbai",
      latitude: 19.0577,
      longitude: 72.8345,
      deliveryRadiusKm: 11.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 22,
      commissionPercentage: 15.0,
      rating: 4.9,
      reviewCount: 418,
      imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Italian, Woodfired Pizza, Pasta, Gelato",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser3.id, restaurantId: laPiazza.id, role: "OWNER" },
  });
  await createAllWeekHours(laPiazza.id);

  const catPizza = await prisma.menuCategory.create({
    data: { restaurantId: laPiazza.id, name: "Artisanal Woodfired Pizza", displayOrder: 1 },
  });
  const catPasta = await prisma.menuCategory.create({
    data: { restaurantId: laPiazza.id, name: "Handcrafted Fresh Pasta", displayOrder: 2 },
  });
  const catPiazzaAntipasti = await prisma.menuCategory.create({
    data: { restaurantId: laPiazza.id, name: "Artisanal Antipasti & Breads", displayOrder: 3 },
  });
  const catDessert = await prisma.menuCategory.create({
    data: { restaurantId: laPiazza.id, name: "Italian Dolci & Beverages", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_pizza_burrata",
      restaurantId: laPiazza.id,
      categoryId: catPizza.id,
      name: "Pizza Margherita Burrata D.O.P.",
      description: "San Marzano D.O.P. tomato sauce, creamy artisanal burrata ball, fresh basil leaves, extra virgin olive oil.",
      pricePaise: 48900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_pizza_diavola",
      restaurantId: laPiazza.id,
      categoryId: catPizza.id,
      name: "Pizza Diavola Spianata",
      description: "Woodfired crust with crushed tomatoes, fiery Calabrian salame spianata, buffalo mozzarella, and chili honey drizzle.",
      pricePaise: 54900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_truffle_pasta",
      restaurantId: laPiazza.id,
      categoryId: catPasta.id,
      name: "Truffle Mushroom Fettuccine",
      description: "Hand-rolled egg fettuccine tossed in a silky emulsion of porcini wild mushrooms, aged Parmigiano Reggiano, and black truffle pate.",
      pricePaise: 44900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_spaghetti_carbonara",
      restaurantId: laPiazza.id,
      categoryId: catPasta.id,
      name: "Classic Spaghetti Carbonara",
      description: "Traditional Roman recipe with crispy cured smoked bacon, pasture-raised egg yolk custard, Pecorino Romano, and cracked black pepper.",
      pricePaise: 48900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_burrata_caprese",
      restaurantId: laPiazza.id,
      categoryId: catPiazzaAntipasti.id,
      name: "Burrata Caprese Rustica",
      description: "Fresh artisanal burrata mozzarella with heirloom tomatoes, aged Modena balsamic glaze, and Genovese basil pesto.",
      pricePaise: 39900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_tiramisu",
      restaurantId: laPiazza.id,
      categoryId: catDessert.id,
      name: "Traditional Espresso Tiramisu",
      description: "Savoiardi ladyfingers soaked in double shot Illy espresso, layered with whipped mascarpone cream and Valrhona cocoa dust.",
      pricePaise: 28900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  // ==========================================
  // Restaurant 4: Dosa Craft South Kitchen
  // ==========================================
  const dosaCraft = await prisma.restaurant.create({
    data: {
      id: "rest_dosa_craft",
      name: "Dosa Craft South Kitchen",
      slug: "dosa-craft-south-kitchen",
      description: "Heirloom stone-ground batters, pure A2 ghee roasts, 14-spice sambar, and authentic filter coffee from Kumbakonam.",
      fssaiLicense: "11522001000955",
      phone: "+91 22 2414 7788",
      email: "namaste@dosacraft.com",
      address: "18 Dr. Ambedkar Road, Matunga East",
      city: "Mumbai",
      latitude: 19.0268,
      longitude: 72.8553,
      deliveryRadiusKm: 14.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 18,
      commissionPercentage: 14.0,
      rating: 4.8,
      reviewCount: 512,
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "South Indian, Dosas, Filter Coffee, Healthy",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser4.id, restaurantId: dosaCraft.id, role: "OWNER" },
  });
  await createAllWeekHours(dosaCraft.id, "07:30", "22:30");

  const catDosas = await prisma.menuCategory.create({
    data: { restaurantId: dosaCraft.id, name: "Signature Crispy Dosas", displayOrder: 1 },
  });
  const catTiffins = await prisma.menuCategory.create({
    data: { restaurantId: dosaCraft.id, name: "Traditional Tiffin Specialties", displayOrder: 2 },
  });
  const catSouthRice = await prisma.menuCategory.create({
    data: { restaurantId: dosaCraft.id, name: "Chettinad Feasts & Rice Bowls", displayOrder: 3 },
  });
  const catSouthBeverages = await prisma.menuCategory.create({
    data: { restaurantId: dosaCraft.id, name: "Filter Coffee & Refreshers", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_ghee_roast_dosa",
      restaurantId: dosaCraft.id,
      categoryId: catDosas.id,
      name: "Ghee Roast Masala Dosa",
      description: "Crispy golden crepe roasted in pure ghee, stuffed with spiced potato podimas, served with 3 fresh chutneys and piping sambar.",
      pricePaise: 18900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_mysore_uttapam",
      restaurantId: dosaCraft.id,
      categoryId: catDosas.id,
      name: "Mysore Podi Onion Uttapam",
      description: "Thick soft sourdough lentil pancake topped with caramelized shallots, fresh curry leaves, and gun-powder podi roasted in ghee.",
      pricePaise: 19900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_idli_vada_combo",
      restaurantId: dosaCraft.id,
      categoryId: catTiffins.id,
      name: "Steamed Button Idli & Crispy Vada Combo",
      description: "14 melt-in-mouth mini button idlis soaked in bubbling shallot sambar with one golden crisp peppercorn medu vada.",
      pricePaise: 17900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_chettinad_chicken",
      restaurantId: dosaCraft.id,
      categoryId: catSouthRice.id,
      name: "Chettinad Pepper Chicken Roast",
      description: "Boneless chicken pan-roasted with freshly crushed black tellicherry peppercorns, curry leaves, and toasted coconut.",
      pricePaise: 32900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_filter_coffee",
      restaurantId: dosaCraft.id,
      categoryId: catSouthBeverages.id,
      name: "Degree Kumbakonam Filter Coffee",
      description: "Brewed decoction of 80:20 plantation peaberry chicory blend, frothed with full cream farm milk in brass davarah.",
      pricePaise: 8900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 8,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_coconut_payasam",
      restaurantId: dosaCraft.id,
      categoryId: catSouthBeverages.id,
      name: "Tender Coconut Elaneer Payasam",
      description: "Chilled dessert soup of tender coconut pulp, condensed coconut milk, cardamom seeds, and roasted cashew slivers.",
      pricePaise: 14900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 5,
    },
  });

  // ==========================================
  // Restaurant 5: The Burger Foundry
  // ==========================================
  const burgerFoundry = await prisma.restaurant.create({
    data: {
      id: "rest_burger_foundry",
      name: "The Burger Foundry",
      slug: "the-burger-foundry",
      description: "Hand-smashed artisanal brioche burgers, house-pickled relish, crispy buttermilk chicken, and hand-spun thick shakes.",
      fssaiLicense: "11522001000623",
      phone: "+91 22 2605 9922",
      email: "eat@burgerfoundry.com",
      address: "12 Union Park, Carter Road, Khar West",
      city: "Mumbai",
      latitude: 19.0689,
      longitude: 72.8277,
      deliveryRadiusKm: 10.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 20,
      commissionPercentage: 15.0,
      rating: 4.8,
      reviewCount: 380,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Gourmet Burgers, American, Shakes, Loaded Fries",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser5.id, restaurantId: burgerFoundry.id, role: "OWNER" },
  });
  await createAllWeekHours(burgerFoundry.id);

  const catBurgers = await prisma.menuCategory.create({
    data: { restaurantId: burgerFoundry.id, name: "Gourmet Brioche Burgers", displayOrder: 1 },
  });
  const catFoundryWings = await prisma.menuCategory.create({
    data: { restaurantId: burgerFoundry.id, name: "Crispy Wings & Tenders", displayOrder: 2 },
  });
  const catFries = await prisma.menuCategory.create({
    data: { restaurantId: burgerFoundry.id, name: "Loaded Sides & Fries", displayOrder: 3 },
  });
  const catShakes = await prisma.menuCategory.create({
    data: { restaurantId: burgerFoundry.id, name: "Artisanal Thick Shakes", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_foundry_double",
      restaurantId: burgerFoundry.id,
      categoryId: catBurgers.id,
      name: "The Foundry Double Smash Burger",
      description: "Two crispy-edged seared patties, double English cheddar, caramelized shallots, house pickles, secret smoke sauce on golden brioche bun.",
      pricePaise: 38900,
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
      pricePaise: 34900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_nashville_tenders",
      restaurantId: burgerFoundry.id,
      categoryId: catFoundryWings.id,
      name: "Nashville Crispy Hot Chicken Tenders (4 Pcs)",
      description: "Spiced buttermilk-soaked chicken tenders coated in fiery Nashville paprika glaze, served with garlic ranch dip.",
      pricePaise: 31900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_periperi_fries",
      restaurantId: burgerFoundry.id,
      categoryId: catFries.id,
      name: "Peri-Peri Cheese Melt Fries",
      description: "Freshly fried golden crinkle-cut potatoes dusted in zesty African bird's eye spice, drizzled with warm cheddar cheese sauce.",
      pricePaise: 19900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80",
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
      pricePaise: 21900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 8,
    },
  });

  // ==========================================
  // Restaurant 6: Sakura Japanese Izakaya & Sushi Bar
  // ==========================================
  const sakuraSushi = await prisma.restaurant.create({
    data: {
      id: "rest_sakura_sushi",
      name: "Sakura Japanese Izakaya & Sushi Bar",
      slug: "sakura-japanese-sushi-bar",
      description: "Master craft Tokyo sushi, torched aburi nigiri, 16-hour simmered Tonkotsu ramen broths, and crispy tempura delights.",
      fssaiLicense: "11522001001122",
      phone: "+91 22 2649 8899",
      email: "hello@sakurasushi.com",
      address: "Plot 24, Linking Road, Khar West",
      city: "Mumbai",
      latitude: 19.0655,
      longitude: 72.8315,
      deliveryRadiusKm: 12.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 25,
      commissionPercentage: 16.0,
      rating: 4.9,
      reviewCount: 310,
      imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Japanese, Sushi, Ramen, Bento",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser6.id, restaurantId: sakuraSushi.id, role: "OWNER" },
  });
  await createAllWeekHours(sakuraSushi.id);

  const catSakuraRolls = await prisma.menuCategory.create({
    data: { restaurantId: sakuraSushi.id, name: "Handcrafted Nigiri & Maki Rolls", displayOrder: 1 },
  });
  const catSakuraRamen = await prisma.menuCategory.create({
    data: { restaurantId: sakuraSushi.id, name: "Artisanal Ramen & Broths", displayOrder: 2 },
  });
  const catSakuraIzakaya = await prisma.menuCategory.create({
    data: { restaurantId: sakuraSushi.id, name: "Izakaya Small Plates & Bento", displayOrder: 3 },
  });
  const catSakuraDesserts = await prisma.menuCategory.create({
    data: { restaurantId: sakuraSushi.id, name: "Japanese Desserts & Coolers", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_salmon_uramaki",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraRolls.id,
      name: "Scottish Salmon & Avocado Uramaki (8 Pcs)",
      description: "Sashimi-grade salmon, Haas avocado, Japanese Kewpie mayo, rolled in seasoned sushi rice and toasted black sesame.",
      pricePaise: 54900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_spicy_tuna_crispy_rice",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraRolls.id,
      name: "Spicy Tuna Crispy Rice Squares (6 Pcs)",
      description: "Pan-crisped golden sushi rice cakes topped with spicy minced yellowfin tuna, jalapeño slice, and sweet soy glaze.",
      pricePaise: 59900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_truffle_asparagus_roll",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraRolls.id,
      name: "Truffle Avocado & Asparagus Roll (8 Pcs)",
      description: "Crispy tempura asparagus, cream cheese, Haas avocado, drizzled with white truffle ponzu glaze.",
      pricePaise: 47900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 16,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_tonkotsu_ramen",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraRamen.id,
      name: "Tokyo Tonkotsu Chashu Ramen",
      description: "16-hour simmered rich bone broth, handmade wheat noodles, tender rolled chashu meat, soft ajitsuke tamago egg, and nori sheet.",
      pricePaise: 57900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 22,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_miso_truffle_ramen",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraRamen.id,
      name: "Spicy Miso Tofu & Shiitake Ramen",
      description: "Silky mushroom-kombu broth with organic fermented red miso, roasted shiitake, silken tofu, bok choy, and chili rayu oil.",
      pricePaise: 48900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_chicken_katsu_bento",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraIzakaya.id,
      name: "Chicken Katsu Curry Bento Deluxe",
      description: "Golden panko-crusted chicken fillet, Japanese sweet curry sauce, steamed Koshihikari rice, gyoza, and cucumber sunomono.",
      pricePaise: 58900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_matcha_mochi",
      restaurantId: sakuraSushi.id,
      categoryId: catSakuraDesserts.id,
      name: "Matcha Green Tea Mochi Trio",
      description: "Japanese artisanal glutinous rice dumplings stuffed with ceremonial Uji matcha ice cream.",
      pricePaise: 26900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 8,
    },
  });

  // ==========================================
  // Restaurant 7: El Fuego Taqueria & Cantina
  // ==========================================
  const elFuego = await prisma.restaurant.create({
    data: {
      id: "rest_el_fuego",
      name: "El Fuego Taqueria & Cantina",
      slug: "el-fuego-taqueria-cantina",
      description: "Authentic Mexican street tacos on hand-pressed heirloom corn tortillas, slow-braised birria, and crispy churros.",
      fssaiLicense: "11522001001334",
      phone: "+91 22 2604 3322",
      email: "hola@elfuegotacos.com",
      address: "Shop 5, Pali Hill Union Park, Bandra West",
      city: "Mumbai",
      latitude: 19.0641,
      longitude: 72.8251,
      deliveryRadiusKm: 11.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 20,
      commissionPercentage: 15.0,
      rating: 4.7,
      reviewCount: 225,
      imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Mexican, Tacos, Burritos, Quesadillas",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser7.id, restaurantId: elFuego.id, role: "OWNER" },
  });
  await createAllWeekHours(elFuego.id);

  const catFuegoTacos = await prisma.menuCategory.create({
    data: { restaurantId: elFuego.id, name: "Authentic Corn Street Tacos", displayOrder: 1 },
  });
  const catFuegoBurritos = await prisma.menuCategory.create({
    data: { restaurantId: elFuego.id, name: "Mission Burritos & Power Bowls", displayOrder: 2 },
  });
  const catFuegoSides = await prisma.menuCategory.create({
    data: { restaurantId: elFuego.id, name: "Loaded Nachos & Cantina Sides", displayOrder: 3 },
  });
  const catFuegoSweets = await prisma.menuCategory.create({
    data: { restaurantId: elFuego.id, name: "Mexican Postres & Coolers", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_birria_tacos",
      restaurantId: elFuego.id,
      categoryId: catFuegoTacos.id,
      name: "Braised Birria Tacos with Consomé (3 Pcs)",
      description: "Crispy pan-fried corn tortillas dipped in spiced chili broth, stuffed with melting braised meat, Oaxaca cheese, cilantro and rich consomé dip.",
      pricePaise: 48900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_baja_fish_tacos",
      restaurantId: elFuego.id,
      categoryId: catFuegoTacos.id,
      name: "Baja Crispy Fish Tacos (3 Pcs)",
      description: "Beer-battered crispy sea bass fillet, pickled purple cabbage slaw, pico de gallo, and smoky chipotle crema on warm tortillas.",
      pricePaise: 43900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 16,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_chipotle_paneer_tacos",
      restaurantId: elFuego.id,
      categoryId: catFuegoTacos.id,
      name: "Smoky Chipotle Paneer Tacos (3 Pcs)",
      description: "Char-grilled cottage cheese in chipotle adobo, grilled corn salsa, guacamole, and crumbled queso fresco.",
      pricePaise: 37900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_mission_burrito",
      restaurantId: elFuego.id,
      categoryId: catFuegoBurritos.id,
      name: "Mission-Style Smoked Chicken Burrito Grande",
      description: "Huge flour tortilla packed with citrus adobo chicken, cilantro-lime rice, black beans, Monterey Jack cheese, and salsa verde.",
      pricePaise: 42900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_fiesta_bowl",
      restaurantId: elFuego.id,
      categoryId: catFuegoBurritos.id,
      name: "Fiesta Avocado & Black Bean Burrito Bowl",
      description: "Brown rice, spiced black beans, fajita bell peppers, charred sweet corn, fresh guacamole, and sour cream swirl.",
      pricePaise: 36900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_queso_nachos",
      restaurantId: elFuego.id,
      categoryId: catFuegoSides.id,
      name: "Skillet Queso Fundido Loaded Nachos",
      description: "Crispy house-made corn tortilla chips blanketed in bubbling jalapeño cheese dip, black beans, pico, and pickled jalapeños.",
      pricePaise: 34900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_churros_dulce",
      restaurantId: elFuego.id,
      categoryId: catFuegoSweets.id,
      name: "Cinnamon Churros with Dulce de Leche",
      description: "Golden extruded fried dough sticks dusted in Mexican cinnamon sugar, paired with warm salted caramel dulce de leche.",
      pricePaise: 24900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  // ==========================================
  // Restaurant 8: Beirut Cedar Shawarma & Mezze Lounge
  // ==========================================
  const beirutCedar = await prisma.restaurant.create({
    data: {
      id: "rest_beirut_cedar",
      name: "Beirut Cedar Shawarma & Mezze Lounge",
      slug: "beirut-cedar-shawarma-lounge",
      description: "Authentic Lebanese vertical rotisserie shawarmas, velvet smooth silk hummus, warm za'atar pita, and pistachio baklava.",
      fssaiLicense: "11522001001456",
      phone: "+91 22 2618 7700",
      email: "salam@beirutlounge.com",
      address: "82 Juhu Tara Road, Opp. Palm Beach, Juhu",
      city: "Mumbai",
      latitude: 19.1025,
      longitude: 72.8258,
      deliveryRadiusKm: 13.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 20,
      commissionPercentage: 15.0,
      rating: 4.8,
      reviewCount: 312,
      imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Lebanese, Middle Eastern, Shawarma, Grills",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser8.id, restaurantId: beirutCedar.id, role: "OWNER" },
  });
  await createAllWeekHours(beirutCedar.id);

  const catBeirutShawarma = await prisma.menuCategory.create({
    data: { restaurantId: beirutCedar.id, name: "Authentic Lebanese Shawarmas", displayOrder: 1 },
  });
  const catBeirutMezze = await prisma.menuCategory.create({
    data: { restaurantId: beirutCedar.id, name: "Artisanal Mezze & Dips", displayOrder: 2 },
  });
  const catBeirutGrills = await prisma.menuCategory.create({
    data: { restaurantId: beirutCedar.id, name: "Charcoal Kebabs & Grills", displayOrder: 3 },
  });
  const catBeirutSweets = await prisma.menuCategory.create({
    data: { restaurantId: beirutCedar.id, name: "Middle Eastern Sweets", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_chicken_toum_shawarma",
      restaurantId: beirutCedar.id,
      categoryId: catBeirutShawarma.id,
      name: "Charcoal Chicken Toum Shawarma Roll",
      description: "Spiced rotisserie shaved chicken thighs, whipped garlic toum cream, pickled wild cucumbers, French fries inside toasted Saj flatbread.",
      pricePaise: 32900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_falafel_pita_wrap",
      restaurantId: beirutCedar.id,
      categoryId: catBeirutShawarma.id,
      name: "Crispy Herb Falafel & Tahini Wrap",
      description: "Crispy chickpea herb patties, creamy sesame tahini, pickled turnips, tomato sumac salad inside freshly baked Lebanese pita.",
      pricePaise: 26900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 14,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_silk_hummus_pita",
      restaurantId: beirutCedar.id,
      categoryId: catBeirutMezze.id,
      name: "Silk Cream Hummus with Warm Za'atar Pita",
      description: "Velvety smooth pureed chickpeas whipped with extra virgin olive oil, toasted pine nuts, paprika, served with fresh puffed wood-fired pita bread.",
      pricePaise: 28900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1637949385162-e416fb15b2ce?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_moutabal_dip",
      restaurantId: beirutCedar.id,
      categoryId: catBeirutMezze.id,
      name: "Smoked Moutabal Baba Ganoush",
      description: "Fire-roasted eggplant pulp blended with tahini, pomegranate molasses, garlic, and cold-pressed olive oil.",
      pricePaise: 27900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_shish_tawook",
      restaurantId: beirutCedar.id,
      categoryId: catBeirutGrills.id,
      name: "Shish Tawook Charcoal Chicken Skewers",
      description: "Tender chicken cubes marinated in yogurt, sumac, garlic, and tomato puree, grilled over olive charcoal coals.",
      pricePaise: 42900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_pistachio_baklava",
      restaurantId: beirutCedar.id,
      categoryId: catBeirutSweets.id,
      name: "Pistachio & Honey Walnut Baklava (4 Pcs)",
      description: "Paper-thin phyllo pastry sheets layered with Turkish pistachios, soaked in orange blossom floral honey syrup.",
      pricePaise: 29900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 8,
    },
  });

  // ==========================================
  // Restaurant 9: Le Petit Croissant & Artisan Bakery
  // ==========================================
  const petitCroissant = await prisma.restaurant.create({
    data: {
      id: "rest_petit_croissant",
      name: "Le Petit Croissant & Artisan Bakery",
      slug: "le-petit-croissant-bakery",
      description: "Flaky pure French butter viennoiseries, artisan sourdough baguettes, dark chocolate opera cakes, and specialty espresso.",
      fssaiLicense: "11522001001567",
      phone: "+91 22 2611 4455",
      email: "bonjour@lepetitcroissant.com",
      address: "Silver Beach Estate, AB Nair Road, Juhu",
      city: "Mumbai",
      latitude: 19.1065,
      longitude: 72.8269,
      deliveryRadiusKm: 12.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 15,
      commissionPercentage: 15.0,
      rating: 4.9,
      reviewCount: 420,
      imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Bakery, Desserts, Cafe, Breakfast",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser9.id, restaurantId: petitCroissant.id, role: "OWNER" },
  });
  await createAllWeekHours(petitCroissant.id, "07:00", "22:00");

  const catPetitPastries = await prisma.menuCategory.create({
    data: { restaurantId: petitCroissant.id, name: "Freshly Baked Viennoiserie", displayOrder: 1 },
  });
  const catPetitSandwiches = await prisma.menuCategory.create({
    data: { restaurantId: petitCroissant.id, name: "Artisan Sourdough Sandwiches", displayOrder: 2 },
  });
  const catPetitPatisserie = await prisma.menuCategory.create({
    data: { restaurantId: petitCroissant.id, name: "French Patisserie & Desserts", displayOrder: 3 },
  });
  const catPetitCoffee = await prisma.menuCategory.create({
    data: { restaurantId: petitCroissant.id, name: "Specialty Coffees & Coolers", displayOrder: 4 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_almond_croissant",
      restaurantId: petitCroissant.id,
      categoryId: catPetitPastries.id,
      name: "Golden French Butter Almond Croissant",
      description: "Twice-baked flaky croissant filled with rich almond frangipane cream, topped with toasted sliced almonds and powdered sugar.",
      pricePaise: 21900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_pain_au_chocolat",
      restaurantId: petitCroissant.id,
      categoryId: catPetitPastries.id,
      name: "Pain au Chocolat with Valrhona Ganache",
      description: "Traditional French puff pastry enveloping two batons of intense 66% Valrhona dark chocolate, baked golden brown.",
      pricePaise: 23900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_caprese_panini",
      restaurantId: petitCroissant.id,
      categoryId: catPetitSandwiches.id,
      name: "Bocconcini Caprese Sourdough Panini",
      description: "Artisanal crusty sourdough loaf pressed with fresh milk mozzarella bocconcini, slow-roasted vine tomatoes, and Genovese basil pesto.",
      pricePaise: 32900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 14,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_smoked_chicken_baguette",
      restaurantId: petitCroissant.id,
      categoryId: catPetitSandwiches.id,
      name: "Smoked Chicken Breast & Emmental Baguette",
      description: "Crispy freshly baked French baguette with sliced hickory-smoked chicken, Swiss Emmental cheese, Dijon mustard, and wild arugula.",
      pricePaise: 36900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 15,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_opera_cake",
      restaurantId: petitCroissant.id,
      categoryId: catPetitPatisserie.id,
      name: "Dark Belgian Chocolate Opera Cake Slice",
      description: "Six delicate layers of almond Joconde sponge, coffee syrup, espresso buttercream, and dark chocolate ganache glaze.",
      pricePaise: 28900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 8,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_spanish_latte",
      restaurantId: petitCroissant.id,
      categoryId: catPetitCoffee.id,
      name: "Spanish Iced Vanilla Cortado / Latte",
      description: "Double ristretto shot of Brazilian single-origin beans, sweet condensed milk cream, and chilled whole milk over ice.",
      pricePaise: 19900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 6,
    },
  });

  // ==========================================
  // Restaurant 10: Green Bowl Superfoods & Salads
  // ==========================================
  const greenBowl = await prisma.restaurant.create({
    data: {
      id: "rest_green_bowl",
      name: "Green Bowl Superfoods & Salads",
      slug: "green-bowl-superfoods-salads",
      description: "Nutrient-packed warm quinoa bowls, crisp organic salads, Amazonian acai smoothie bowls, and cold-pressed juices.",
      fssaiLicense: "11522001001678",
      phone: "+91 22 2656 1122",
      email: "eathealthy@greenbowlhealth.com",
      address: "One BKC, G Block, Bandra Kurla Complex",
      city: "Mumbai",
      latitude: 19.0668,
      longitude: 72.8672,
      deliveryRadiusKm: 14.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 18,
      commissionPercentage: 14.0,
      rating: 4.7,
      reviewCount: 195,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Healthy Bowls, Salads, Smoothies, Keto",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser10.id, restaurantId: greenBowl.id, role: "OWNER" },
  });
  await createAllWeekHours(greenBowl.id, "08:00", "22:00");

  const catGreenBowls = await prisma.menuCategory.create({
    data: { restaurantId: greenBowl.id, name: "Signature Superfood Harvest Bowls", displayOrder: 1 },
  });
  const catGreenSalads = await prisma.menuCategory.create({
    data: { restaurantId: greenBowl.id, name: "Gourmet Crisp Salads", displayOrder: 2 },
  });
  const catGreenAcai = await prisma.menuCategory.create({
    data: { restaurantId: greenBowl.id, name: "Acai Bowls & Smoothies", displayOrder: 3 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_halloumi_quinoa_bowl",
      restaurantId: greenBowl.id,
      categoryId: catGreenBowls.id,
      name: "Mediterranean Grilled Halloumi Quinoa Bowl",
      description: "Warm organic tri-color quinoa, pan-seared halloumi cheese, roasted zucchini, cherry tomatoes, kalamata olives, and lemon-oregano vinaigrette.",
      pricePaise: 38900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 16,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_chicken_protein_bowl",
      restaurantId: greenBowl.id,
      categoryId: catGreenBowls.id,
      name: "Herb Grilled Chicken & Wild Rice Protein Bowl",
      description: "Sous-vide tender chicken breast, wild black rice, steamed broccoli florets, Haas avocado, and roasted sesame ginger dressing.",
      pricePaise: 41900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_beetroot_goat_cheese_salad",
      restaurantId: greenBowl.id,
      categoryId: catGreenSalads.id,
      name: "Roasted Beetroot & Goat Cheese Rocket Salad",
      description: "Baby arugula rocket, oven-roasted ruby beetroots, French chèvre goat cheese, candied walnuts, and aged balsamic reduction.",
      pricePaise: 34900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_acai_berry_bowl",
      restaurantId: greenBowl.id,
      categoryId: catGreenAcai.id,
      name: "Amazonian Pure Acai Berry Smoothie Bowl",
      description: "Organic Brazilian acai puree blended thick with bananas, topped with artisanal granola, chia seeds, fresh blueberries, and almond butter drizzle.",
      pricePaise: 34900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_glow_green_juice",
      restaurantId: greenBowl.id,
      categoryId: catGreenAcai.id,
      name: "Detox Glow Green Cold-Pressed Juice",
      description: "Raw cold-pressed blend of celery, baby spinach, crisp green apple, cucumber, ginger root, and lemon.",
      pricePaise: 18900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 6,
    },
  });

  // ==========================================
  // Restaurant 11: Chowpatty Chaat & Mithai Co.
  // ==========================================
  const chowpattyChaat = await prisma.restaurant.create({
    data: {
      id: "rest_chowpatty_chaat",
      name: "Chowpatty Chaat & Mithai Co.",
      slug: "chowpatty-chaat-mithai-co",
      description: "Iconic Mumbai seaside street food, melted Amul butter pav bhaji, crunchy sev puri, frankies, and rich malai kulfi.",
      fssaiLicense: "11522001001789",
      phone: "+91 22 2367 8899",
      email: "order@chowpattychaat.com",
      address: "Opp. Chowpatty Beach Promenade, Marine Drive",
      city: "Mumbai",
      latitude: 18.9548,
      longitude: 72.8123,
      deliveryRadiusKm: 15.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 15,
      commissionPercentage: 14.0,
      rating: 4.6,
      reviewCount: 520,
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Street Food, Chaat, Mithai, Snacks",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser11.id, restaurantId: chowpattyChaat.id, role: "OWNER" },
  });
  await createAllWeekHours(chowpattyChaat.id, "11:00", "23:30");

  const catChaatStreet = await prisma.menuCategory.create({
    data: { restaurantId: chowpattyChaat.id, name: "Legendary Mumbai Street Chaat", displayOrder: 1 },
  });
  const catChaatRolls = await prisma.menuCategory.create({
    data: { restaurantId: chowpattyChaat.id, name: "Crispy Rolls & Mumbai Snacks", displayOrder: 2 },
  });
  const catChaatSweets = await prisma.menuCategory.create({
    data: { restaurantId: chowpattyChaat.id, name: "Sweet Lassi & Kulfi Falooda", displayOrder: 3 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_dahi_sev_puri",
      restaurantId: chowpattyChaat.id,
      categoryId: catChaatStreet.id,
      name: "Dahi Sev Puri Royal Platter (6 Pcs)",
      description: "Crispy flat flour puris loaded with spiced potatoes, sweetened beaten yogurt, date-tamarind chutney, spicy mint water, and nylon sev.",
      pricePaise: 15900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_butter_pav_bhaji",
      restaurantId: chowpattyChaat.id,
      categoryId: catChaatStreet.id,
      name: "Amul Butter Special Pav Bhaji (2 Pav)",
      description: "Slow-mashed vegetable curry simmered on flat cast iron tawa with signature spices, melted Amul butter, served with toasted butter pav.",
      pricePaise: 19900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 14,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_vada_pav_duo",
      restaurantId: chowpattyChaat.id,
      categoryId: catChaatRolls.id,
      name: "Mumbai Classic Vada Pav Duo with Thecha",
      description: "Two spiced mashed potato fritters fried in chickpea batter, stuffed in soft pav buns with dry red garlic ghati chutney and fried chilies.",
      pricePaise: 12900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 10,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_paneer_frankie",
      restaurantId: chowpattyChaat.id,
      categoryId: catChaatRolls.id,
      name: "Paneer Tikka Frankie Kathi Roll",
      description: "Tawa paratha rolled with tandoori spiced paneer cubes, pickled red onion rings, chatpata frankie masala, and green chili mint chutney.",
      pricePaise: 18900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_kesari_mango_lassi",
      restaurantId: chowpattyChaat.id,
      categoryId: catChaatSweets.id,
      name: "Kesari Mango Malai Lassi",
      description: "Thick hand-churned curd blended with Alphonso mango pulp, Kashmiri saffron strands, topped with clotted malai cream and pistachios.",
      pricePaise: 14900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 6,
    },
  });

  // ==========================================
  // Restaurant 12: Southern Coast Seafood & Coastal Grills
  // ==========================================
  const southernCoast = await prisma.restaurant.create({
    data: {
      id: "rest_southern_coast",
      name: "Southern Coast Seafood & Coastal Grills",
      slug: "southern-coast-seafood-grills",
      description: "Fresh coastal Arabian sea catch, Mangalorean rava fried prawns, fragrant Goan coconut curries, and soft lacy neer dosas.",
      fssaiLicense: "11522001001890",
      phone: "+91 22 2633 5566",
      email: "catch@southerncoast.com",
      address: "Fisherman's Wharf Road, Versova, Andheri West",
      city: "Mumbai",
      latitude: 19.1352,
      longitude: 72.8142,
      deliveryRadiusKm: 13.0,
      isOpen: true,
      isApproved: true,
      averagePreparationMinutes: 24,
      commissionPercentage: 15.0,
      rating: 4.8,
      reviewCount: 240,
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1200&q=80",
      cuisineTypes: "Seafood, Coastal, South Indian, Goan",
    },
  });

  await prisma.restaurantStaff.create({
    data: { userId: staffUser12.id, restaurantId: southernCoast.id, role: "OWNER" },
  });
  await createAllWeekHours(southernCoast.id);

  const catCoastFry = await prisma.menuCategory.create({
    data: { restaurantId: southernCoast.id, name: "Crispy Coastal Tawa Fry", displayOrder: 1 },
  });
  const catCoastCurries = await prisma.menuCategory.create({
    data: { restaurantId: southernCoast.id, name: "Rich Coconut Curries & Coastal Breads", displayOrder: 2 },
  });
  const catCoastDrinks = await prisma.menuCategory.create({
    data: { restaurantId: southernCoast.id, name: "Coastal Coolers & Desserts", displayOrder: 3 },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_rava_fried_prawns",
      restaurantId: southernCoast.id,
      categoryId: catCoastFry.id,
      name: "Mangalorean Rava Fried Tiger Prawns (6 Pcs)",
      description: "Fresh Arabian sea tiger prawns marinated in fiery red Byadgi chili paste, coated in semolina rava, and tawa crisped in coconut oil.",
      pricePaise: 49900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 18,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_surmai_tawa_fry",
      restaurantId: southernCoast.id,
      categoryId: catCoastFry.id,
      name: "Surmai Kingfish Tawa Masala Fry",
      description: "Thick center steak of fresh Kingfish pan-seared with coastal ginger garlic masala and kokum extract.",
      pricePaise: 54900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 20,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_goan_prawn_curry",
      restaurantId: southernCoast.id,
      categoryId: catCoastCurries.id,
      name: "Authentic Goan Prawn Curry with Rice",
      description: "Juicy prawns cooked in freshly pressed coconut milk, Kashmiri chilies, and tangy tamarind, accompanied by steamed white rice.",
      pricePaise: 52900,
      isVegetarian: false,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1551248429-40975aa4de74?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 22,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_neer_dosa_basket",
      restaurantId: southernCoast.id,
      categoryId: catCoastCurries.id,
      name: "Soft Lacy Neer Dosa Basket (4 Pcs)",
      description: "Delicate paper-thin steamed rice crepes that melt like silk, served with freshly grated coconut jaggery relish.",
      pricePaise: 11900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 12,
    },
  });

  await prisma.menuItem.create({
    data: {
      id: "item_solkadhi_cooler",
      restaurantId: southernCoast.id,
      categoryId: catCoastDrinks.id,
      name: "Authentic Chilled Kokum Solkadhi",
      description: "Digestive pink nectar made from pure coconut milk, fresh wild kokum extract, garlic, green chilies, and cilantro.",
      pricePaise: 9900,
      isVegetarian: true,
      isAvailable: true,
      imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80",
      preparationMinutes: 5,
    },
  });

  // ==========================================
  // 6. Promotional Coupons
  // ==========================================
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

  // ==========================================
  // 7. Seed Past Delivered Orders & Verified Reviews
  // ==========================================
  const pastOrder1 = await prisma.order.create({
    data: {
      id: "ord_past_delivered_1",
      orderNumber: "ORD-94821",
      customerId: customer1.id,
      restaurantId: royalSpice.id,
      riderId: riderUser1.id,
      status: "DELIVERED",
      subtotalPaise: 73800,
      taxPaise: 3690,
      deliveryFeePaise: 4000,
      platformFeePaise: 1000,
      discountPaise: 10000,
      totalPaise: 68890,
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
      createdAt: new Date(Date.now() - 86400000 * 2),
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

  await prisma.review.create({
    data: {
      orderId: pastOrder1.id,
      restaurantId: royalSpice.id,
      userId: customer1.id,
      rating: 5,
      comment: "Outstanding food! The Murgh Malai Tikka melted in mouth and the delivery arrived piping hot in 25 minutes.",
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 * 2 + 3600000),
    },
  });

  // Seed sample review for Sakura Sushi
  const pastOrderSakura = await prisma.order.create({
    data: {
      id: "ord_past_sakura_1",
      orderNumber: "ORD-94860",
      customerId: customer2.id,
      restaurantId: sakuraSushi.id,
      riderId: riderUser2.id,
      status: "DELIVERED",
      subtotalPaise: 112800,
      taxPaise: 5640,
      deliveryFeePaise: 4000,
      platformFeePaise: 1000,
      discountPaise: 15000,
      totalPaise: 108440,
      deliveryAddressSnapshot: JSON.stringify({
        label: "Home",
        addressLine: "Villa 12, Gulmohar Cross Rd 7, Juhu Scheme",
        city: "Mumbai",
        pincode: "400049",
      }),
      restaurantSnapshot: JSON.stringify({
        name: "Sakura Japanese Izakaya & Sushi Bar",
        phone: "+91 22 2649 8899",
        address: "Plot 24, Linking Road, Khar West",
      }),
      deliveryOtpHash: "verified_hash_9486",
      estimatedDeliveryMinutes: 28,
      createdAt: new Date(Date.now() - 86400000),
      items: {
        create: [
          {
            menuItemId: "item_salmon_uramaki",
            nameSnapshot: "Scottish Salmon & Avocado Uramaki (8 Pcs)",
            pricePaiseSnapshot: 54900,
            quantity: 1,
            totalPaise: 54900,
          },
          {
            menuItemId: "item_tonkotsu_ramen",
            nameSnapshot: "Tokyo Tonkotsu Chashu Ramen",
            pricePaiseSnapshot: 57900,
            quantity: 1,
            totalPaise: 57900,
          },
        ],
      },
      payments: {
        create: {
          gateway: "RAZORPAY",
          gatewayOrderId: "order_rzp_mock_past_94860",
          gatewayPaymentId: "pay_rzp_mock_pay_94860",
          status: "COMPLETED",
          amountPaise: 108440,
          idempotencyKey: "idem_key_past_order_94860",
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      orderId: pastOrderSakura.id,
      restaurantId: sakuraSushi.id,
      userId: customer2.id,
      rating: 5,
      comment: "Incredible sushi quality! The salmon was extremely fresh and the tonkotsu broth was rich and comforting.",
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 + 3600000),
    },
  });

  // Seed sample review for El Fuego Tacos
  const pastOrderFuego = await prisma.order.create({
    data: {
      id: "ord_past_fuego_1",
      orderNumber: "ORD-94875",
      customerId: customer3.id,
      restaurantId: elFuego.id,
      riderId: riderUser1.id,
      status: "DELIVERED",
      subtotalPaise: 73800,
      taxPaise: 3690,
      deliveryFeePaise: 4000,
      platformFeePaise: 1000,
      discountPaise: 0,
      totalPaise: 82490,
      deliveryAddressSnapshot: JSON.stringify({
        label: "Home",
        addressLine: "Unit 801, Bandra West",
        city: "Mumbai",
        pincode: "400050",
      }),
      restaurantSnapshot: JSON.stringify({
        name: "El Fuego Taqueria & Cantina",
        phone: "+91 22 2604 3322",
        address: "Shop 5, Pali Hill Union Park, Bandra West",
      }),
      deliveryOtpHash: "verified_hash_9487",
      estimatedDeliveryMinutes: 25,
      createdAt: new Date(Date.now() - 86400000 * 3),
      items: {
        create: [
          {
            menuItemId: "item_birria_tacos",
            nameSnapshot: "Braised Birria Tacos with Consomé (3 Pcs)",
            pricePaiseSnapshot: 48900,
            quantity: 1,
            totalPaise: 48900,
          },
          {
            menuItemId: "item_churros_dulce",
            nameSnapshot: "Cinnamon Churros with Dulce de Leche",
            pricePaiseSnapshot: 24900,
            quantity: 1,
            totalPaise: 24900,
          },
        ],
      },
      payments: {
        create: {
          gateway: "RAZORPAY",
          gatewayOrderId: "order_rzp_mock_past_94875",
          gatewayPaymentId: "pay_rzp_mock_pay_94875",
          status: "COMPLETED",
          amountPaise: 82490,
          idempotencyKey: "idem_key_past_order_94875",
        },
      },
    },
  });

  await prisma.review.create({
    data: {
      orderId: pastOrderFuego.id,
      restaurantId: elFuego.id,
      userId: customer3.id,
      rating: 5,
      comment: "Best birria tacos in Mumbai hands down! The dipping broth is heavenly and the churros were still warm and crunchy.",
      isVerifiedPurchase: true,
      createdAt: new Date(Date.now() - 86400000 * 3 + 3600000),
    },
  });

  // 8. Seed Active In-Flight Order
  await prisma.order.create({
    data: {
      id: "ord_active_live_2",
      orderNumber: "ORD-94850",
      customerId: customer1.id,
      restaurantId: royalSpice.id,
      riderId: riderUser1.id,
      status: "PREPARING",
      subtotalPaise: 44900,
      taxPaise: 2245,
      deliveryFeePaise: 4000,
      platformFeePaise: 1000,
      discountPaise: 0,
      totalPaise: 52145,
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
      deliveryOtpHash: "7821",
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

  // 9. Support Ticket
  await prisma.supportTicket.create({
    data: {
      ticketNumber: "TCK-88210",
      userId: customer1.id,
      orderId: pastOrder1.id,
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

  console.log("Database seeded successfully with 12 diverse culinary restaurants, 17 users, 65+ food items across 40+ categories, 3 coupons, and realistic orders!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
