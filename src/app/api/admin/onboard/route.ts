import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    // Allow admin access or open for dev testing if requested
    const body = await req.json();
    const { type } = body;

    if (type === "restaurant") {
      const {
        name,
        description,
        cuisineTypes,
        fssaiLicense,
        phone,
        email,
        address,
        city = "Mumbai",
        deliveryRadiusKm = 10,
        averagePreparationMinutes = 25,
        imageUrl,
        ownerName,
        ownerEmail,
      } = body;

      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Restaurant Name is required" }, { status: 400 });
      }

      const slug =
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
        "-" +
        Math.floor(1000 + Math.random() * 9000);

      const fssai = fssaiLicense?.trim() || `FSSAI-${Math.floor(10000000000000 + Math.random() * 90000000000000)}`;
      const restPhone = phone?.trim() || "+91 98200 99881";
      const restImage =
        imageUrl?.trim() ||
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";

      // Create Restaurant
      const restaurant = await prisma.restaurant.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || `Authentic delicacies curated fresh daily at ${name.trim()}.`,
          cuisineTypes: cuisineTypes?.trim() || "Multi-Cuisine, Continental, Indian",
          fssaiLicense: fssai,
          phone: restPhone,
          email: email?.trim() || `${slug}@partner.ofds.com`,
          address: address?.trim() || "Shop 12, High Street Food Arcade, Bandra West",
          city: city.trim(),
          latitude: 19.0596 + (Math.random() - 0.5) * 0.05,
          longitude: 72.8295 + (Math.random() - 0.5) * 0.05,
          deliveryRadiusKm: Number(deliveryRadiusKm) || 10,
          averagePreparationMinutes: Number(averagePreparationMinutes) || 25,
          imageUrl: restImage,
          isOpen: true,
          isApproved: true,
          rating: 4.6,
          reviewCount: 1,
        },
      });

      // Create standard operating hours
      for (let day = 0; day <= 6; day++) {
        await prisma.operatingHours.create({
          data: {
            restaurantId: restaurant.id,
            dayOfWeek: day,
            openTime: "10:00",
            closeTime: "23:00",
          },
        });
      }

      // Create initial Categories & Menu items
      const catSpecials = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: "Signature Specials",
          displayOrder: 1,
        },
      });

      const catBeverages = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          name: "Beverages & Desserts",
          displayOrder: 2,
        },
      });

      // Add 2 starter items
      await prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: catSpecials.id,
          name: `${name} Signature Platter`,
          description: `Chef's special recipe prepared with fresh farm ingredients.`,
          pricePaise: 38900,
          isVegetarian: true,
          isAvailable: true,
          imageUrl: restImage,
          preparationMinutes: 20,
        },
      });

      await prisma.menuItem.create({
        data: {
          restaurantId: restaurant.id,
          categoryId: catBeverages.id,
          name: "Artisanal Fresh Lime Soda",
          description: "Refreshing sparkling soda with fresh squeezed mint and lime.",
          pricePaise: 9900,
          isVegetarian: true,
          isAvailable: true,
          imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80",
          preparationMinutes: 5,
        },
      });

      // If owner user specified, link or create
      if (ownerEmail) {
        let user = await prisma.user.findUnique({
          where: { email: ownerEmail.trim().toLowerCase() },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: ownerName?.trim() || `${name} Staff`,
              email: ownerEmail.trim().toLowerCase(),
              phone: restPhone,
              role: "RESTAURANT_STAFF",
            },
          });
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "RESTAURANT_STAFF" },
          });
        }

        await prisma.restaurantStaff.create({
          data: {
            userId: user.id,
            restaurantId: restaurant.id,
            role: "OWNER",
          },
        });
      }

      // Log in AuditLog
      await prisma.auditLog.create({
        data: {
          actorId: sessionUser?.id || "admin_system",
          actorRole: sessionUser?.role || "ADMIN",
          action: "RESTAURANT_ONBOARDED_MANUALLY",
          resource: "Restaurant",
          resourceId: restaurant.id,
          metadata: JSON.stringify({ name: restaurant.name, fssai }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Restaurant "${restaurant.name}" successfully onboarded!`,
        restaurant,
      });
    }

    if (type === "rider") {
      const { name, email, phone, vehicleType = "MOTORCYCLE", licenseNumber } = body;

      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Rider Name is required" }, { status: 400 });
      }
      if (!email || !email.trim()) {
        return NextResponse.json({ error: "Rider Email is required" }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 409 }
        );
      }

      const riderUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone?.trim() || `+91 ${Math.floor(9000000000 + Math.random() * 999999999)}`,
          role: "RIDER",
        },
      });

      const profile = await prisma.riderProfile.create({
        data: {
          userId: riderUser.id,
          vehicleType,
          licenseNumber: licenseNumber?.trim() || `DL-MH-${Math.floor(100000 + Math.random() * 900000)}`,
          isAvailable: true,
          currentLatitude: 19.0760,
          currentLongitude: 72.8777,
        },
      });

      // Log Audit
      await prisma.auditLog.create({
        data: {
          actorId: sessionUser?.id || "admin_system",
          actorRole: sessionUser?.role || "ADMIN",
          action: "RIDER_ONBOARDED_MANUALLY",
          resource: "RiderProfile",
          resourceId: profile.id,
          metadata: JSON.stringify({ name: riderUser.name, vehicleType }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Delivery Rider "${riderUser.name}" successfully onboarded!`,
        rider: {
          ...riderUser,
          profile,
        },
      });
    }

    if (type === "user") {
      const { name, email, phone, role = "CUSTOMER" } = body;

      if (!name || !name.trim()) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 });
      }
      if (!email || !email.trim()) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (existing) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 409 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone?.trim() || `+91 ${Math.floor(8000000000 + Math.random() * 1999999999)}`,
          role,
        },
      });

      return NextResponse.json({
        success: true,
        message: `User "${newUser.name}" (${newUser.role}) successfully created!`,
        user: newUser,
      });
    }

    return NextResponse.json({ error: "Invalid onboarding type specified" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
