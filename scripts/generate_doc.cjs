const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  ShadingType
} = require('docx');

// Color constants
const COLOR_PRIMARY = "E23744";     // OFDS Brand Red
const COLOR_DARK = "0F172A";        // Slate 900
const COLOR_HEADING = "1E293B";     // Slate 800
const COLOR_TEXT = "334155";        // Slate 700
const COLOR_MUTED = "64748B";       // Slate 500
const COLOR_BORDER = "CBD5E1";      // Slate 300
const COLOR_BG_LIGHT = "F8FAFC";    // Slate 50
const COLOR_BG_ACCENT = "EFF6FF";   // Blue 50
const COLOR_SUCCESS = "16A34A";     // Green 600
const COLOR_WARNING = "D97706";     // Amber 600

function createHeader(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? COLOR_PRIMARY : COLOR_HEADING,
        size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22,
        font: "Calibri",
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.before || 60, after: options.after || 120 },
    children: [
      new TextRun({
        text,
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || COLOR_TEXT,
        size: options.size || 22, // 11pt
        font: "Calibri",
      }),
    ],
  });
}

function createBullet(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + " ", bold: true, color: COLOR_HEADING, size: 22, font: "Calibri" }));
  }
  children.push(new TextRun({ text, color: COLOR_TEXT, size: 22, font: "Calibri" }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60 },
    children,
  });
}

function createTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header row
  const headerCells = headers.map((h, i) => {
    return new TableCell({
      width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
      shading: { fill: COLOR_HEADING, type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 150, right: 150 },
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: h, bold: true, color: "FFFFFF", size: 20, font: "Calibri" }),
          ],
        }),
      ],
    });
  });
  tableRows.push(new TableRow({ children: headerCells }));

  // Data rows
  rows.forEach((row, rowIndex) => {
    const isEven = rowIndex % 2 === 0;
    const cells = row.map((cellText, i) => {
      return new TableCell({
        width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
        shading: { fill: isEven ? COLOR_BG_LIGHT : "FFFFFF", type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 150, right: 150 },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: cellText, color: COLOR_TEXT, size: 19, font: "Calibri" }),
            ],
          }),
        ],
      });
    });
    tableRows.push(new TableRow({ children: cells }));
  });

  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    rows: tableRows,
  });
}

// Screenshot Placeholder Generator
function createScreenshotPlaceholder({ id, title, route, persona, dimensions, description, actionItems, caption }) {
  const borderConfig = {
    style: BorderStyle.DASHED,
    size: 2,
    color: "94A3B8",
  };

  const solidBorder = {
    style: BorderStyle.SINGLE,
    size: 2,
    color: "CBD5E1",
  };

  return new Table({
    width: { size: 9500, type: WidthType.DXA },
    rows: [
      // Banner row
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9500, type: WidthType.DXA },
            shading: { fill: "1E293B", type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 180, right: 180 },
            borders: { top: solidBorder, bottom: solidBorder, left: solidBorder, right: solidBorder },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `📷 SCREENSHOT PLACEHOLDER #${id}: `, bold: true, color: "F87171", size: 22, font: "Calibri" }),
                  new TextRun({ text: title, bold: true, color: "FFFFFF", size: 22, font: "Calibri" }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Details row
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9500, type: WidthType.DXA },
            shading: { fill: "F1F5F9", type: ShadingType.CLEAR },
            margins: { top: 100, bottom: 100, left: 180, right: 180 },
            borders: { top: solidBorder, bottom: solidBorder, left: solidBorder, right: solidBorder },
            children: [
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: "• URL / Route: ", bold: true, color: COLOR_DARK, size: 19, font: "Calibri" }),
                  new TextRun({ text: route, color: "2563EB", bold: true, size: 19, font: "Calibri" }),
                  new TextRun({ text: "   |   ", color: COLOR_MUTED, size: 19, font: "Calibri" }),
                  new TextRun({ text: "• Active Persona: ", bold: true, color: COLOR_DARK, size: 19, font: "Calibri" }),
                  new TextRun({ text: persona, color: COLOR_PRIMARY, bold: true, size: 19, font: "Calibri" }),
                  new TextRun({ text: "   |   ", color: COLOR_MUTED, size: 19, font: "Calibri" }),
                  new TextRun({ text: "• Viewport: ", bold: true, color: COLOR_DARK, size: 19, font: "Calibri" }),
                  new TextRun({ text: dimensions, color: COLOR_TEXT, size: 19, font: "Calibri" }),
                ],
              }),
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: "• What to capture: ", bold: true, color: COLOR_DARK, size: 19, font: "Calibri" }),
                  new TextRun({ text: description, color: COLOR_TEXT, size: 19, font: "Calibri" }),
                ],
              }),
              new Paragraph({
                spacing: { after: 40 },
                children: [
                  new TextRun({ text: "• Key UI Elements: ", bold: true, color: COLOR_DARK, size: 19, font: "Calibri" }),
                  new TextRun({ text: actionItems, italics: true, color: COLOR_TEXT, size: 19, font: "Calibri" }),
                ],
              }),
            ],
          }),
        ],
      }),
      // Space for screenshot
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9500, type: WidthType.DXA },
            shading: { fill: "F8FAFC", type: ShadingType.CLEAR },
            margins: { top: 400, bottom: 400, left: 180, right: 180 },
            borders: { top: borderConfig, bottom: borderConfig, left: borderConfig, right: borderConfig },
            children: [
              new Paragraph({ spacing: { before: 400 } }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 100, after: 80 },
                children: [
                  new TextRun({ text: "[ 🖼️ PASTE / INSERT SCREENSHOT HERE ]", bold: true, color: "64748B", size: 24, font: "Calibri" }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                  new TextRun({ text: "(To add screenshot: Copy screenshot to clipboard, click inside this box, and press Ctrl + V)", italics: true, color: "94A3B8", size: 18, font: "Calibri" }),
                ],
              }),
              new Paragraph({ spacing: { after: 400 } }),
            ],
          }),
        ],
      }),
      // Caption row
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9500, type: WidthType.DXA },
            shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 100, left: 180, right: 180 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `Figure ${id}: `, bold: true, color: COLOR_HEADING, size: 19, font: "Calibri" }),
                  new TextRun({ text: caption, italics: true, color: COLOR_MUTED, size: 19, font: "Calibri" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function buildDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            color: COLOR_TEXT,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "OFDS — Online Food Delivery System | Comprehensive Technical Report", italics: true, color: "94A3B8", size: 16, font: "Calibri" }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Online Food Delivery System (OFDS)  •  Page ", color: "64748B", size: 18, font: "Calibri" }),
                  new TextRun({ children: [PageNumber.CURRENT], bold: true, color: COLOR_PRIMARY, size: 18, font: "Calibri" }),
                  new TextRun({ text: " of ", color: "64748B", size: 18, font: "Calibri" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], bold: true, color: COLOR_HEADING, size: 18, font: "Calibri" }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title Banner
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "ONLINE FOOD DELIVERY SYSTEM (OFDS)",
                bold: true,
                color: COLOR_PRIMARY,
                size: 38, // 19pt
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "Comprehensive System Architecture, Technical Specification & Production Report",
                bold: true,
                color: COLOR_HEADING,
                size: 26,
                font: "Calibri",
              }),
            ],
          }),

          // Metadata Table
          createTable(
            ["Document Property", "Specification Details"],
            [
              ["Application Name", "OFDS — Production-Grade Online Food Delivery System"],
              ["Version & Build", "Version 1.0.0 (Production Release / Strict TypeScript Mode)"],
              ["Core Framework", "Next.js 16 (App Router) & React 19 with Server Components"],
              ["Styling & Design System", "Tailwind CSS v4 & Lucide Icons (Responsive PWA Mobile-First)"],
              ["Persistence & ORM", "Prisma ORM with SQLite (Local) & PostgreSQL (Neon / Railway Production)"],
              ["Payment Processing", "Razorpay Payment Gateway Integration (Strict Integer Paise Precision)"],
              ["Real-Time Engine", "Server-Sent Events (SSE) Live Order Stream & GPS Simulation Radar"],
              ["Supported User Roles", "1. Customer  |  2. Restaurant Kitchen  |  3. Delivery Rider  |  4. Super Admin"],
              ["Document Type", "Full Technical & User Experience Specification with Screenshot Slots"],
            ],
            [3000, 6500]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 1. EXECUTIVE SUMMARY & SYSTEM OVERVIEW
          // -------------------------------------------------------------
          createHeader("1. Executive Summary & Website Description", HeadingLevel.HEADING_1),
          createParagraph(
            "The Online Food Delivery System (OFDS) is a state-of-the-art, hyper-local food discovery and on-demand delivery web platform. Designed to replicate and exceed commercial food delivery standards (comparable to Swiggy, Zomato, and DoorDash), OFDS bridges four essential stakeholders in the food logistics lifecycle into a unified, high-performance ecosystem:"
          ),
          createBullet("End-to-end food ordering journey including discovery, cuisine filtering, single-restaurant cart rules, coupon redemption, dynamic GST & platform fee billing, Razorpay payments, real-time live GPS order tracking, doorstep 4-digit OTP verification, verified ratings, and support ticketing.", "1. Customer:"),
          createBullet("Live kitchen command center with instant sound & visual order alerts, real-time stage progression (Placed → Accepted → Preparing → Ready), dynamic dish catalog CRUD, real-time out-of-stock toggles, store open/close controls, and CSV exportable sales metrics.", "2. Restaurant Kitchen Staff:"),
          createBullet("Mobile-optimized trip assignment engine, duty availability switch (Online/Offline), turn-by-turn restaurant pickup and customer delivery address routes, simulated live GPS ping emissions, and cryptographic doorstep 4-digit delivery OTP validation.", "3. Delivery Rider Partner:"),
          createBullet("Super Admin cockpit featuring real-time Gross Order Value (GOV) metrics, platform commission tracking, FSSAI restaurant license verification & approval queues, cross-platform order monitoring, rider fleet operations, customer dispute management, and immutable audit logs.", "4. Platform Administrator:"),

          createParagraph(
            "A core highlight of the platform is the built-in Persona Switcher situated in the top navigation bar, enabling instantaneous switching between all four roles without requiring manual login credentials or logging out, making it an ideal demonstration and testing platform."
          ),

          // -------------------------------------------------------------
          // 2. ARCHITECTURAL PILLARS & ENGINEERING HIGHLIGHTS
          // -------------------------------------------------------------
          createHeader("2. Architectural Pillars & Engineering Highlights", HeadingLevel.HEADING_1),
          createParagraph(
            "The system is engineered following modern full-stack best practices, strict type safety, and resilient financial integrity:"
          ),
          createBullet("Financial transactions are calculated and stored in integer paise (e.g., ₹299.00 = 29900). This completely eliminates floating-point rounding errors common in IEEE 754 representations, ensuring 100% auditing compliance across GST tax breakdowns (5%), delivery fees, platform fees, and discounts.", "• Integer Paise Precision:"),
          createBullet("Live order status updates and delivery tracking are powered by Server-Sent Events (/api/realtime/order-stream) with intelligent fallback to polling, providing sub-second updates without websocket server complexity.", "• Real-Time Order Stream & Radar:"),
          createBullet("Doorstep delivery security is enforced through an ephemeral 4-digit OTP issued exclusively to the paying customer and verified by the delivery rider at the drop-off location before status can transition to DELIVERED.", "• Doorstep Cryptographic OTP Verification:"),
          createBullet("Adheres to Progressive Web App standards (/manifest.json) with offline detection banners, touch-friendly tap targets, and responsive layouts tailored for desktop screens, tablets, and smartphones.", "• Installable Progressive Web App (PWA):"),
          createBullet("Every state change is strictly governed by a centralized State Machine (PLACED → ACCEPTED → PREPARING → READY → PICKED_UP → DELIVERED). Unauthorized status leaps are rejected at the database transaction layer.", "• Deterministic Order State Machine:"),
          createBullet("Orders cancelled by customers during the grace period or rejected by kitchen staff immediately trigger the automated refund engine, recording audit entries and updating payment states to REFUNDED.", "• Automated Rejection & Cancellation Refunds:"),

          // -------------------------------------------------------------
          // 3. TECHNOLOGY STACK SPECIFICATION
          // -------------------------------------------------------------
          createHeader("3. Technology Stack Specification", HeadingLevel.HEADING_1),
          createParagraph("The following table summarizes the technological choices powering the OFDS platform:"),

          createTable(
            ["Architecture Layer", "Technology / Library", "Role & Justification"],
            [
              ["Frontend Framework", "Next.js 16.4 (App Router) + React 19", "Server Components, streaming SSR, optimized client hydration, nested routing"],
              ["Language & Type Safety", "TypeScript 5 (Strict Mode)", "Comprehensive type safety, eliminating runtime null and undefined errors"],
              ["Styling & Design System", "Tailwind CSS v4 + Lucide React Icons", "Utility-first design tokens, high aesthetic fidelity, zero CSS bloat"],
              ["Database ORM", "Prisma ORM 6.19", "Type-safe database queries, declarative migrations, multi-provider SQLite & Postgres support"],
              ["Relational Databases", "SQLite (Local) / PostgreSQL (Neon / Railway)", "Zero-setup local testing with production cloud parity"],
              ["Payment Gateway", "Razorpay Payment API", "Mock verification simulation + production HMAC-SHA256 signature checking"],
              ["Input Validation", "Zod 4.6", "Strict request schema validation preventing invalid payloads and injection attacks"],
              ["Celebrations & Micro-UX", "canvas-confetti", "Delightful customer checkout and order success celebrations"],
              ["Testing Framework", "TSX + Node.js Assertions", "Automated unit & integration test runner covering authorization, pricing, and states"],
            ],
            [2200, 3100, 4200]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 4. MULTI-ROLE FEATURE WALKTHROUGH & SCREENSHOT SLOTS
          // -------------------------------------------------------------
          createHeader("4. Detailed Functional Modules & Screenshot Documentation", HeadingLevel.HEADING_1),
          createParagraph(
            "Below is a comprehensive breakdown of every major feature across all four user roles. Each section includes dedicated bordered screenshot placeholder frames specifically prepared for you to paste or insert screen captures directly into this document."
          ),

          // 4.1 Customer Experience
          createHeader("4.1 Customer Experience & Food Ordering Workflow", HeadingLevel.HEADING_2),
          createParagraph(
            "The customer persona provides a seamless food ordering experience starting from homepage restaurant discovery to order delivery confirmation and review submission."
          ),

          // Screenshot 1
          createScreenshotPlaceholder({
            id: "1",
            title: "Customer Homepage & Restaurant Discovery",
            route: "http://localhost:3000/",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the full landing page showing the top navigation bar, search input, cuisine category pills (Biryani, North Indian, Pizza, Chinese, South Indian), promotional discount banner, and restaurant cards with rating badges, delivery times, and pricing tags.",
            actionItems: "Navbar with Role Switcher, Search Input, Cuisine Filter Pills, Featured Restaurant Cards with Images & Star Ratings",
            caption: "Customer Homepage showcasing restaurant discovery, active cuisine filters, and restaurant cards.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 2
          createScreenshotPlaceholder({
            id: "2",
            title: "Restaurant Menu Page & Dish Customization",
            route: "http://localhost:3000/restaurants/rest_royal_spice",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the restaurant menu view displaying restaurant banner details (FSSAI license number, rating, delivery radius), Veg/Non-Veg filter toggle, categorized menu items (Starters, Main Course, Breads, Desserts), item price tags in Rupees, and 'Add to Cart' buttons.",
            actionItems: "Restaurant Hero Header, FSSAI Badge, Veg/Non-Veg Switch, Menu Categories, Dish Cards with Quantities",
            caption: "Restaurant Menu view with dish categories, dietary indicators, and item addition controls.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 3
          createScreenshotPlaceholder({
            id: "3",
            title: "Interactive Cart Drawer & Single-Restaurant Rule",
            route: "http://localhost:3000/ (Open Cart Drawer)",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop with open drawer) or 390 × 844 (Mobile)",
            description: "Capture the slide-out Cart Drawer showing active order items, increment/decrement quantity buttons, subtotal calculation, delivery fee, GST estimation, and the prominent 'Proceed to Checkout' call-to-action button.",
            actionItems: "Right Slide-Out Drawer, Item Quantity Controls, Dynamic Subtotal, Single-Restaurant Validation notice",
            caption: "Customer Cart Drawer displaying real-time item counts and pricing totals.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 4
          createScreenshotPlaceholder({
            id: "4",
            title: "Saved Delivery Address Management",
            route: "http://localhost:3000/addresses",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Address Manager page displaying saved addresses (Home, Work, Other) with complete addresses, landmarks, pincodes, GPS coordinates, default address radio button, and the 'Add New Address' modal form.",
            actionItems: "Saved Address Cards with Location Pin icons, Default Badge, New Address Form Modal",
            caption: "Customer Address Management page displaying saved delivery locations and GPS coordinates.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 5
          createScreenshotPlaceholder({
            id: "5",
            title: "Checkout Summary, Coupon Engine & Razorpay Payment",
            route: "http://localhost:3000/checkout",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Checkout screen displaying delivery address selection, order item summary, coupon code entry field with 'FIRST50' applied, precise bill breakdown (Subtotal, 5% GST, ₹40 Delivery Fee, ₹10 Platform Fee, Discount), and the Razorpay 'Pay & Place Order' button.",
            actionItems: "Delivery Address Radio Selector, Applied Coupon Tag with Discount, Mathematical Bill Breakdown in Rupees, Razorpay Checkout Button",
            caption: "Checkout screen with coupon discount calculation, GST itemization, and Razorpay payment trigger.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 6
          createScreenshotPlaceholder({
            id: "6",
            title: "Live Order Tracking, GPS Radar & Doorstep OTP",
            route: "http://localhost:3000/orders/[id]",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Live Order Tracking screen showing the dynamic status stepper (Placed → Preparing → On The Way → Delivered), the pulsing GPS simulated radar map, assigned rider details (Name, vehicle, phone), estimated delivery time, and the prominent 4-Digit Doorstep Delivery OTP card.",
            actionItems: "Multi-Step Progress Bar, Pulsing GPS Radar Animation, 4-Digit OTP Box, Assigned Rider Profile Card",
            caption: "Live Order Tracking screen featuring the multi-stage status bar, GPS radar, and customer delivery OTP.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 7
          createScreenshotPlaceholder({
            id: "7",
            title: "Customer Order History & Verified Review Form",
            route: "http://localhost:3000/orders",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Orders List page displaying past and active orders with order IDs, timestamps, restaurant names, total paid in Rupees, order status badges, 'Track Live' button, and the 5-star rating and review submission box for delivered orders.",
            actionItems: "Order History Cards, Status Badges (DELIVERED, PREPARING), Star Rating Input & Review Comment Box",
            caption: "Customer Orders Dashboard displaying past order history and verified purchase review submission.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 8
          createScreenshotPlaceholder({
            id: "8",
            title: "Customer Support & Dispute Ticket Resolution",
            route: "http://localhost:3000/support",
            persona: "Customer (Rahul Sharma)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Support portal showing customer ticket history, ticket status badges (OPEN, IN_PROGRESS, RESOLVED), and the 'Raise New Dispute' form with Category dropdown (Missing Item, Delayed Delivery, Payment Issue, Cancellation) and description text area.",
            actionItems: "Dispute Submission Form, Order ID Association Dropdown, Ticket Priority & Status Badges",
            caption: "Customer Support and Dispute Resolution interface for filing order issues.",
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // 4.2 Restaurant Staff Experience
          createHeader("4.2 Restaurant Kitchen & Operations Portal", HeadingLevel.HEADING_2),
          createParagraph(
            "The Restaurant Staff portal is tailored for kitchen operators, allowing them to manage incoming orders in real time, transition order preparation stages, manage menu catalogs, and monitor daily revenue."
          ),

          // Screenshot 9
          createScreenshotPlaceholder({
            id: "9",
            title: "Restaurant Live Kitchen Order Monitor",
            route: "http://localhost:3000/restaurant",
            persona: "Restaurant Staff (Vikram Singhania - Royal Spice)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Restaurant Dashboard showing the Live Orders tab with real-time incoming orders, order items with quantities, customer delivery notes, prep countdown timer, and action buttons ('Accept Order' and 'Reject Order').",
            actionItems: "Live Order Alert Badge, Kitchen Order Cards, Cooking Timer, Accept / Reject Action Buttons",
            caption: "Live Kitchen Order Dashboard displaying incoming orders and kitchen actions.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 10
          createScreenshotPlaceholder({
            id: "10",
            title: "Kitchen Order State Transitions (Preparing & Ready)",
            route: "http://localhost:3000/restaurant",
            persona: "Restaurant Staff (Vikram Singhania - Royal Spice)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the order cards undergoing status transitions: Accepted orders moving to 'Preparing', and preparing orders being marked as 'Food Ready for Pickup' which notifies the delivery rider fleet.",
            actionItems: "Status Progress Buttons ('Mark Preparing', 'Mark Ready for Pickup'), Elapsed Time Badges",
            caption: "Order status progression controls in the restaurant kitchen portal.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 11
          createScreenshotPlaceholder({
            id: "11",
            title: "Restaurant Menu Catalog & Stock Management",
            route: "http://localhost:3000/restaurant/menu",
            persona: "Restaurant Staff (Vikram Singhania - Royal Spice)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Menu Management screen displaying dish catalog tables, price in Rupees, preparation time, Veg/Non-Veg tag, 'In Stock' vs 'Out of Stock' toggle switches, and the 'Add New Dish' modal.",
            actionItems: "Dish Table with Images, Price in Rupees, In-Stock Toggle Switch, Edit & Delete Dish Controls",
            caption: "Restaurant Menu Management portal featuring live in-stock toggles and dish CRUD controls.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 12
          createScreenshotPlaceholder({
            id: "12",
            title: "Restaurant Sales Performance & CSV Export",
            route: "http://localhost:3000/restaurant (Analytics Tab)",
            persona: "Restaurant Staff (Vikram Singhania - Royal Spice)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Restaurant Sales Analytics view showing Total Revenue (in ₹), Orders Completed, Average Preparation Time, Store Status Switch (Open / Closed for orders), and the 'Export CSV Report' button.",
            actionItems: "Store Open/Close Toggle, Daily Revenue KPI Metric, Completed Orders Count, CSV Download Action",
            caption: "Restaurant operational metrics, store open toggle, and sales reporting interface.",
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // 4.3 Delivery Rider Experience
          createHeader("4.3 Delivery Rider Logistics & OTP Verification", HeadingLevel.HEADING_2),
          createParagraph(
            "The Delivery Rider interface is optimized for on-road mobile efficiency. Riders manage duty shifts, accept delivery assignments, track GPS routes, and execute doorstep OTP verification."
          ),

          // Screenshot 13
          createScreenshotPlaceholder({
            id: "13",
            title: "Delivery Rider Duty Switch & Trip Assignment",
            route: "http://localhost:3000/rider",
            persona: "Delivery Rider (Amit Kumar)",
            dimensions: "1920 × 1080 (Desktop) or 390 × 844 (Mobile Viewport)",
            description: "Capture the Rider Dashboard showing the Online/Offline duty toggle switch, current vehicle type (Motorcycle), pending trip assignment card with restaurant name, pickup location, delivery distance, and estimated trip payout.",
            actionItems: "Online/Offline Availability Switch, Incoming Trip Assignment Card, Trip Payout & Distance Tags, 'Accept Trip' Button",
            caption: "Delivery Rider portal displaying duty status toggle and incoming trip assignment.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 14
          createScreenshotPlaceholder({
            id: "14",
            title: "Rider Active Trip & Route Navigation",
            route: "http://localhost:3000/rider (Active Trip)",
            persona: "Delivery Rider (Amit Kumar)",
            dimensions: "1920 × 1080 (Desktop) or 390 × 844 (Mobile Viewport)",
            description: "Capture the active delivery trip screen displaying restaurant pickup address, customer delivery address with landmark, customer contact button, order item checklist, and 'Confirm Food Picked Up' action button.",
            actionItems: "Pickup & Drop Location Address Cards, Contact Customer Button, Order Items Checklist, 'Confirm Pickup' Button",
            caption: "Active Delivery Trip view displaying pickup and drop navigation details.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 15
          createScreenshotPlaceholder({
            id: "15",
            title: "Doorstep 4-Digit OTP Verification Modal",
            route: "http://localhost:3000/rider (Doorstep Arrival)",
            persona: "Delivery Rider (Amit Kumar)",
            dimensions: "1920 × 1080 (Desktop) or 390 × 844 (Mobile Viewport)",
            description: "Capture the Doorstep Delivery OTP verification modal showing the 4-digit numeric code entry boxes, 'Verify & Complete Delivery' button, error feedback indicator for invalid codes, and successful delivery completion confirmation.",
            actionItems: "4-Digit OTP Input Boxes, Doorstep Verification Button, Cryptographic Validation Security Notice",
            caption: "Doorstep OTP entry modal used by the delivery rider to securely complete order delivery.",
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // 4.4 Platform Administrator Experience
          createHeader("4.4 Platform Super Administrator Cockpit", HeadingLevel.HEADING_2),
          createParagraph(
            "The Platform Administrator portal offers executive-level visibility and supervisory control over the entire food delivery ecosystem."
          ),

          // Screenshot 16
          createScreenshotPlaceholder({
            id: "16",
            title: "Platform Executive KPI Dashboard",
            route: "http://localhost:3000/admin",
            persona: "Platform Admin (Sanjay Mehra)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the top of the Admin dashboard showing platform KPI summary cards: Gross Order Value (GOV in ₹), Net Platform Commission (in ₹), Total Active Orders, Registered Restaurants, Active Delivery Riders, and Platform Health status.",
            actionItems: "Gross Order Value (GOV) Card, Commission Revenue Card, Total Orders Card, Active Riders Counter",
            caption: "Platform Super Admin KPI Dashboard displaying high-level financial and operational metrics.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 17
          createScreenshotPlaceholder({
            id: "17",
            title: "Restaurant FSSAI Verification & Compliance Queue",
            route: "http://localhost:3000/admin (Restaurants Tab)",
            persona: "Platform Admin (Sanjay Mehra)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Restaurant Management section displaying restaurant list, FSSAI License validation numbers, commission rates (e.g. 15%), verification status badges (Approved / Pending), and Approve/Reject compliance action buttons.",
            actionItems: "FSSAI License Badges, Commission Rate Editor, Status Pill (APPROVED / PENDING), Compliance Action Buttons",
            caption: "Admin Restaurant Compliance Queue showcasing FSSAI verification and merchant onboarding controls.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 18
          createScreenshotPlaceholder({
            id: "18",
            title: "Global Order Fleet Monitor & Audit Trail Logs",
            route: "http://localhost:3000/admin (Orders & Audit Logs Tab)",
            persona: "Platform Admin (Sanjay Mehra)",
            dimensions: "1920 × 1080 (Desktop 16:9)",
            description: "Capture the Global Order Monitor displaying all system orders across Mumbai, live status pills, customer-restaurant pairings, assigned riders, payment state (PAID / REFUNDED), and the immutable Audit Trail logging all actor actions.",
            actionItems: "Platform-Wide Orders Table, Real-Time Status Filters, Payment Status Tags, Audit Log Entries with Timestamp & Actor ID",
            caption: "Global Platform Order Monitor and security audit log table in the admin portal.",
          }),

          new Paragraph({ spacing: { before: 200 } }),

          // Screenshot 19
          createScreenshotPlaceholder({
            id: "19",
            title: "Persona Switcher Dropdown (Multi-Role Testing)",
            route: "http://localhost:3000/ (Click Persona Dropdown in Navbar)",
            persona: "Any Persona (All 4 Roles Available)",
            dimensions: "1920 × 1080 (Desktop view showing open dropdown)",
            description: "Capture the open Persona Switcher dropdown in the top-right navigation bar showing all available demo personas: Customer (Rahul Sharma, Priya Patel), Restaurant Staff (Vikram Singhania, Chef Lin Mei), Delivery Rider (Amit Kumar), and Platform Admin (Sanjay Mehra).",
            actionItems: "Open Role Switcher Menu, Persona Avatars, Role Labels (Customer, Restaurant Staff, Rider, Admin), Active Checkmark",
            caption: "Top navigation bar Persona Switcher dropdown allowing instant cross-role testing.",
          }),

          new Paragraph({ spacing: { before: 250 } }),

          // -------------------------------------------------------------
          // 5. DATABASE SCHEMA & DATA MODELING
          // -------------------------------------------------------------
          createHeader("5. Relational Data Model & Prisma Schema", HeadingLevel.HEADING_1),
          createParagraph(
            "The platform leverages Prisma ORM with a normalized relational schema. Below is a structural specification of the core entities:"
          ),

          createTable(
            ["Entity / Model", "Primary Fields", "Relationships & Constraints"],
            [
              ["User", "id, name, email, role, phone, avatarUrl, createdAt", "1:N Orders, 1:N Addresses, 1:1 RiderProfile, 1:N Staff, 1:1 Cart, 1:N Reviews"],
              ["Restaurant", "id, name, slug, fssaiLicense, address, city, lat/lng, isOpen, isApproved, commissionPercentage", "1:N MenuCategories, 1:N MenuItems, 1:N Orders, 1:N Staff, 1:N OperatingHours"],
              ["MenuItem", "id, restaurantId, categoryId, name, pricePaise, isVegetarian, isAvailable, preparationMinutes", "N:1 Restaurant, N:1 MenuCategory, 1:N CartItems, 1:N OrderItems"],
              ["Cart & CartItem", "id, userId, restaurantId | cartId, menuItemId, quantity, pricePaise", "1:1 User, Single-restaurant constraint enforced at cart addition logic"],
              ["Order", "id, orderNumber, customerId, restaurantId, riderId, status, subtotalPaise, taxPaise, totalPaise, deliveryOtpHash", "N:1 Customer, N:1 Restaurant, N:1 Rider, 1:N OrderItems, 1:N StatusHistory, 1:N Payments"],
              ["Payment & Refund", "id, orderId, gatewayOrderId, gatewayPaymentId, status, amountPaise, idempotencyKey", "N:1 Order, 1:N Refunds. Supports auto-refund triggers upon order rejection"],
              ["RiderProfile", "id, userId, vehicleType, licenseNumber, isAvailable, currentLat, currentLng, lastPingAt", "1:1 User (Rider role). Emits periodic GPS pings for live tracking radar"],
              ["Coupon & Redemption", "id, code, discountType, discountValue, minOrderPaise, maxDiscountPaise, usageLimit", "1:N Redemptions. Validates expiry, min cart spend, and per-user limits"],
              ["SupportTicket", "id, ticketNumber, userId, orderId, category, status, priority, subject, description", "N:1 User, N:1 Order. Tracks disputes for missing items or delivery delays"],
              ["AuditLog", "id, actorId, actorRole, action, resource, resourceId, metadata, createdAt", "Platform-wide immutable event logging for compliance and governance"],
            ],
            [2200, 3600, 3700]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 6. ORDER LIFECYCLE & STATE MACHINE
          // -------------------------------------------------------------
          createHeader("6. Deterministic Order Lifecycle State Machine", HeadingLevel.HEADING_1),
          createParagraph(
            "Order state progression is protected against race conditions and invalid transitions through a deterministic state machine function (transitionOrderStatus). Allowed transitions are documented below:"
          ),

          createTable(
            ["Current Status", "Allowed Next States", "Permitted Actors", "Business Trigger & Security Requirement"],
            [
              ["PLACED", "ACCEPTED, REJECTED, CANCELLED", "Restaurant Staff, Customer, Admin", "Kitchen accepts order or customer cancels within grace window. Auto-refunds on reject."],
              ["ACCEPTED", "PREPARING, CANCELLED", "Restaurant Staff, Admin", "Kitchen begins cooking. Rider dispatch algorithm initiates candidate rider ping."],
              ["PREPARING", "READY, CANCELLED", "Restaurant Staff", "Chef completes dish preparation and packages order for courier handoff."],
              ["READY", "PICKED_UP", "Delivery Rider", "Assigned rider arrives at restaurant and confirms physical receipt of food parcel."],
              ["PICKED_UP", "DELIVERED", "Delivery Rider (Strict)", "Assigned rider reaches destination. REQUIRES customer 4-digit OTP validation."],
              ["DELIVERED", "COMPLETED (Terminal)", "System / Review Engine", "Order successfully finalized. Customer verified review unlocked."],
              ["CANCELLED / REJECTED", "REFUNDED (Terminal)", "Payment Engine", "Automatic refund record created in database. Razorpay refund processed."],
            ],
            [1600, 2400, 2400, 3100]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 7. SECURITY, AUTHENTICATION & RBAC MATRIX
          // -------------------------------------------------------------
          createHeader("7. Security Architecture & Least-Privilege Authorization", HeadingLevel.HEADING_1),
          createParagraph(
            "The platform enforces strict Least-Privilege Role-Based Access Control (RBAC) via the centralized permissions module (can(user, action, resource)). Unauthorized access attempts are rejected with 403 Forbidden responses:"
          ),

          createBullet("Can only query own orders, own saved addresses, and active carts. Cannot view other customer data or foreign orders.", "• Customer Clearance:"),
          createBullet("Scoped strictly to their assigned restaurant ID. Cannot modify dishes, view orders, or access sales metrics of other restaurants.", "• Restaurant Staff Clearance:"),
          createBullet("Scoped strictly to their actively assigned delivery trips. Masked customer phone numbers and hidden financial payment data.", "• Delivery Rider Clearance:"),
          createBullet("Global supervisor clearance across all restaurants, orders, riders, disputes, and audit logs.", "• Platform Admin Clearance:"),
          createBullet("Cryptographic SHA-256 HMAC verification prevents forged payment callbacks. Idempotency keys prevent duplicate charges.", "• Payment Signature Security:"),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 8. AUTOMATED TEST SUITE & VALIDATION METRICS
          // -------------------------------------------------------------
          createHeader("8. Automated Test Suite & Quality Verification", HeadingLevel.HEADING_1),
          createParagraph(
            "The project includes an automated test suite executed via 'npm.cmd test' (tests/test_suite.ts). All 10 unit and integration tests execute with 100% pass rate:"
          ),

          createTable(
            ["Test Category", "Test Assertion Name", "Result", "Validation Coverage"],
            [
              ["Unit Test", "Pricing: formatPaiseToRupees formats integer paise accurately", "✓ PASSED", "Zero rounding errors on ₹299, ₹299.50, and zero amounts"],
              ["Unit Test", "Geo: Haversine distance and travel time calculation", "✓ PASSED", "Accurate Bandra West to BKC travel estimates (3–6 km)"],
              ["Unit Test", "OTP: generateDeliveryOtp generates 4-digit numeric string", "✓ PASSED", "Strict 4-digit numeric format verification"],
              ["Auth Matrix", "Auth: Customer can only access own orders", "✓ PASSED", "Access denied when customer requests foreign order ID"],
              ["Auth Matrix", "Auth: Restaurant staff is strictly scoped to own restaurant", "✓ PASSED", "Access denied when staff attempts foreign menu CRUD"],
              ["Auth Matrix", "Auth: Delivery Rider cannot view customer payments", "✓ PASSED", "Information masking verified for delivery couriers"],
              ["Auth Matrix", "Auth: Admin has platform-wide supervisor clearance", "✓ PASSED", "Platform supervisor operations confirmed"],
              ["Integration", "Integration: calculateOrderPricing calculates GST, fees & coupons", "✓ PASSED", "Correct 5% GST computation and FIRST50 coupon discount"],
              ["Integration", "Integration: State Machine validates transitions & OTP at doorstep", "✓ PASSED", "Wrong OTP (0000) rejected; correct OTP (9988) delivers order"],
              ["Integration", "Integration: Razorpay signature verification validates hashes", "✓ PASSED", "HMAC-SHA256 signature validation confirmed"],
            ],
            [1600, 4200, 1400, 2300]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 9. INSTRUCTIONS FOR CAPTURING & ADDING SCREENSHOTS
          // -------------------------------------------------------------
          createHeader("9. Step-by-Step Instructions for Adding Screenshots", HeadingLevel.HEADING_1),
          createParagraph(
            "To complete this report with your live website screenshots, follow these simple steps:"
          ),
          createBullet("Run 'npm.cmd run dev' in your terminal and open Google Chrome, Microsoft Edge, or Firefox at http://localhost:3000.", "Step 1: Start the Server:"),
          createBullet("Use the top-right Persona Switcher dropdown in the navigation bar to switch into the designated role specified in each screenshot box (Customer, Restaurant Staff, Delivery Rider, or Platform Admin).", "Step 2: Switch to the Desired Role:"),
          createBullet("Navigate to the URL specified in the placeholder box (e.g., http://localhost:3000/orders/...). Ensure the key UI elements described are visible on screen.", "Step 3: Navigate to the Route:"),
          createBullet("Press the Windows key + Shift + S (or Print Screen) to capture the window or selection.", "Step 4: Take the Screenshot:"),
          createBullet("Open this document in Microsoft Word or Google Docs, click inside the bordered screenshot placeholder box, and press Ctrl + V (or select Insert → Picture).", "Step 5: Paste Directly into Word:"),
          createBullet("Resize the pasted image to fit within the box width (recommended width: 6.0 to 6.5 inches). The layout will preserve all document margins and page numbers cleanly.", "Step 6: Adjust Size:"),

          new Paragraph({ spacing: { before: 200 } }),

          // -------------------------------------------------------------
          // 10. CONCLUSION & DEPLOYMENT READINESS
          // -------------------------------------------------------------
          createHeader("10. Conclusion & Deployment Readiness", HeadingLevel.HEADING_1),
          createParagraph(
            "The Online Food Delivery System (OFDS) represents a complete, commercial-grade full-stack implementation. With modular separation of concerns across cart pricing, payments, delivery assignment, kitchen workflows, and administration, the codebase is immediately ready for deployment to Vercel, Neon, Railway, or AWS."
          ),
          createParagraph(
            "Every user journey—from customer discovery to kitchen cooking, courier delivery with OTP verification, and executive financial governance—has been architected with high aesthetic standards, strict type safety, and real-time reliability."
          ),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, '..', 'OFDS_Project_Report_and_Website_Description.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document successfully generated at: ${outputPath} (${buffer.length} bytes)`);
}

buildDocument().catch((err) => {
  console.error("Document build failed:", err);
  process.exit(1);
});
