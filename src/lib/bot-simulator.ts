import fs from "fs";
import path from "path";
import prisma from "./db";
import { transitionOrderStatus } from "./state-machine";

interface BotConfig {
  enabled: boolean;
  delaySeconds: number;
}

const CONFIG_FILE = path.join(process.cwd(), "data", "bot_config.json");

export function getAutoPilotConfig(): BotConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("[AutoPilot] Failed to read config:", err);
  }
  // Default: enabled with 6 seconds delay
  return { enabled: true, delaySeconds: 6 };
}

export function setAutoPilotConfig(config: Partial<BotConfig>): BotConfig {
  const current = getAutoPilotConfig();
  const updated: BotConfig = {
    enabled: typeof config.enabled === "boolean" ? config.enabled : current.enabled,
    delaySeconds: typeof config.delaySeconds === "number" ? Math.max(3, Math.min(30, config.delaySeconds)) : current.delaySeconds,
  };

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[AutoPilot] Failed to write config:", err);
  }

  return updated;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes the automated 5-stage delivery lifecycle simulation.
 * Each transition pauses for the configured delay (e.g. 5-7 seconds).
 */
export async function startAutoPilotForOrder(orderId: string) {
  const config = getAutoPilotConfig();
  if (!config.enabled) {
    return;
  }

  const delayMs = (config.delaySeconds || 6) * 1000;

  // Run in background without blocking the HTTP request
  (async () => {
    try {
      console.log(`[AutoPilot Bot] Started simulation sequence for order ${orderId} (${delayMs / 1000}s interval)`);

      // ---------------------------------------------------------
      // STAGE 1: PLACED -> ACCEPTED (Restaurant Kitchen Acceptance)
      // ---------------------------------------------------------
      await sleep(delayMs);
      if (!getAutoPilotConfig().enabled) return;

      const order1 = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order1 || order1.status !== "PLACED") return;

      await transitionOrderStatus({
        orderId,
        targetStatus: "ACCEPTED",
        actorId: "bot_kitchen_ai",
        actorRole: "RESTAURANT_STAFF",
        reason: "Auto-Pilot Bot: Kitchen accepted order automatically",
      });
      console.log(`[AutoPilot Bot] Order ${orderId} -> ACCEPTED`);

      // ---------------------------------------------------------
      // STAGE 2: ACCEPTED -> PREPARING (Cooking Food in Kitchen)
      // ---------------------------------------------------------
      await sleep(delayMs);
      if (!getAutoPilotConfig().enabled) return;

      const order2 = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order2 || order2.status !== "ACCEPTED") return;

      await transitionOrderStatus({
        orderId,
        targetStatus: "PREPARING",
        actorId: "bot_kitchen_ai",
        actorRole: "RESTAURANT_STAFF",
        reason: "Auto-Pilot Bot: Kitchen started preparing dishes",
      });
      console.log(`[AutoPilot Bot] Order ${orderId} -> PREPARING`);

      // ---------------------------------------------------------
      // STAGE 3: PREPARING -> READY (Food Cooked & Packed)
      // ---------------------------------------------------------
      await sleep(delayMs);
      if (!getAutoPilotConfig().enabled) return;

      const order3 = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order3 || order3.status !== "PREPARING") return;

      await transitionOrderStatus({
        orderId,
        targetStatus: "READY",
        actorId: "bot_kitchen_ai",
        actorRole: "RESTAURANT_STAFF",
        reason: "Auto-Pilot Bot: Meal packed and hot in bag",
      });
      console.log(`[AutoPilot Bot] Order ${orderId} -> READY`);

      // ---------------------------------------------------------
      // STAGE 4: READY -> PICKED_UP (Rider Assigned & Food Collected)
      // ---------------------------------------------------------
      await sleep(delayMs);
      if (!getAutoPilotConfig().enabled) return;

      const order4 = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order4 || order4.status !== "READY") return;

      // Assign an active delivery rider from fleet
      const rider = await prisma.user.findFirst({
        where: { role: "RIDER" },
      });

      if (rider) {
        await prisma.order.update({
          where: { id: orderId },
          data: { riderId: rider.id },
        });
      }

      await transitionOrderStatus({
        orderId,
        targetStatus: "PICKED_UP",
        actorId: rider ? rider.id : "bot_rider_ai",
        actorRole: "RIDER",
        reason: "Auto-Pilot Bot: Delivery rider picked up meal from kitchen",
      });
      console.log(`[AutoPilot Bot] Order ${orderId} -> PICKED_UP`);

      // ---------------------------------------------------------
      // STAGE 5: PICKED_UP -> DELIVERED (Doorstep Handover & OTP)
      // ---------------------------------------------------------
      await sleep(delayMs);
      if (!getAutoPilotConfig().enabled) return;

      const order5 = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order5 || order5.status !== "PICKED_UP") return;

      const validOtp = order5.deliveryOtpHash || "1234";

      await transitionOrderStatus({
        orderId,
        targetStatus: "DELIVERED",
        actorId: rider ? rider.id : "bot_rider_ai",
        actorRole: "RIDER",
        verificationOtp: validOtp,
        reason: "Auto-Pilot Bot: Doorstep arrival confirmed & OTP verified automatically",
      });
      console.log(`[AutoPilot Bot] Order ${orderId} -> DELIVERED (Complete Lifecycle Successful)`);
    } catch (error) {
      console.error(`[AutoPilot Bot] Error during order ${orderId} simulation:`, error);
    }
  })();
}
