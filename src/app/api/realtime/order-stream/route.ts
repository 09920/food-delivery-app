import { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");

  if (!orderId) {
    return new Response("Missing orderId", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      // Function to fetch and send order snapshot
      const sendUpdate = async () => {
        if (isClosed) return;
        try {
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              rider: {
                select: {
                  id: true,
                  name: true,
                  phone: true,
                  riderProfile: {
                    select: {
                      currentLatitude: true,
                      currentLongitude: true,
                      lastPingAt: true,
                    },
                  },
                },
              },
              statusHistory: { orderBy: { createdAt: "asc" } },
            },
          });

          if (order) {
            const data = JSON.stringify({
              status: order.status,
              updatedAt: order.updatedAt,
              rider: order.rider
                ? {
                    name: order.rider.name,
                    phone: order.rider.phone,
                    latitude: order.rider.riderProfile?.currentLatitude,
                    longitude: order.rider.riderProfile?.currentLongitude,
                    lastPingAt: order.rider.riderProfile?.lastPingAt,
                  }
                : null,
              statusHistory: order.statusHistory,
            });

            controller.enqueue(encoder.encode(`event: update\ndata: ${data}\n\n`));
          }
        } catch (e) {
          console.error("SSE update fetch error:", e);
        }
      };

      // Send initial snapshot immediately
      await sendUpdate();

      // Poll every 3 seconds for active delivery stream
      const interval = setInterval(async () => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }
        await sendUpdate();
      }, 3000);

      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
