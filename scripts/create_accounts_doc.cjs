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
  ShadingType
} = require('docx');

const COLOR_PRIMARY = "E23744";     // Brand Red
const COLOR_DARK = "0F172A";        // Slate 900
const COLOR_HEADING = "1E293B";     // Slate 800
const COLOR_TEXT = "334155";        // Slate 700
const COLOR_MUTED = "64748B";       // Slate 500
const COLOR_BORDER = "CBD5E1";      // Slate 300
const COLOR_BG_LIGHT = "F8FAFC";    // Slate 50
const COLOR_BG_HEADER = "EA580C";   // Orange 600

function createHeader(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? COLOR_BG_HEADER : COLOR_HEADING,
        size: level === HeadingLevel.HEADING_1 ? 30 : level === HeadingLevel.HEADING_2 ? 24 : 20,
        font: "Calibri",
      }),
    ],
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.LEFT,
    spacing: { before: options.before || 60, after: options.after || 100 },
    children: [
      new TextRun({
        text,
        bold: options.bold || false,
        italics: options.italics || false,
        color: options.color || COLOR_TEXT,
        size: options.size || 22,
        font: "Calibri",
      }),
    ],
  });
}

const borderStyle = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: COLOR_BORDER,
};

const cellBorders = {
  top: borderStyle,
  bottom: borderStyle,
  left: borderStyle,
  right: borderStyle,
};

function createCell(text, isHeader = false, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    borders: cellBorders,
    shading: {
      type: ShadingType.CLEAR,
      fill: isHeader ? "FFF7ED" : "FFFFFF",
    },
    margins: { top: 100, bottom: 100, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            bold: isHeader,
            color: isHeader ? "C2410C" : COLOR_TEXT,
            size: isHeader ? 20 : 19,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function createDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: "OFDS - ONLINE FOOD DELIVERY SYSTEM",
                bold: true,
                color: COLOR_BG_HEADER,
                size: 34,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: "Official Directory of All System Accounts, Emails, Roles & Credentials",
                italics: true,
                color: COLOR_MUTED,
                size: 22,
                font: "Calibri",
              }),
            ],
          }),

          createHeader("1. Platform Administrator Account", HeadingLevel.HEADING_2),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Role", true, 20),
                  createCell("Full Name", true, 25),
                  createCell("Email Address", true, 35),
                  createCell("Phone / Dashboard", true, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Super Admin", false, 20),
                  createCell("Sanjay Mehra (Ops Admin)", false, 25),
                  createCell("admin@ofds-platform.com", false, 35),
                  createCell("+91 9899001122 (/admin)", false, 20),
                ],
              }),
            ],
          }),

          createHeader("2. Delivery Riders Accounts", HeadingLevel.HEADING_2),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Rider Name", true, 25),
                  createCell("Login Email", true, 35),
                  createCell("Vehicle Type", true, 20),
                  createCell("License & Phone", true, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Amit Kumar", false, 25),
                  createCell("amit.rider@example.com", false, 35),
                  createCell("Motorcycle", false, 20),
                  createCell("MH-02-2021-008741 (+91 9988776655)", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Rajesh Verma", false, 25),
                  createCell("rajesh.rider@example.com", false, 35),
                  createCell("EV Scooter", false, 20),
                  createCell("MH-01-2022-005612 (+91 9911223344)", false, 20),
                ],
              }),
            ],
          }),

          createHeader("3. Restaurant Partners & Kitchen Staff (12 Restaurants)", HeadingLevel.HEADING_2),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Restaurant Name", true, 25),
                  createCell("Manager / Staff Name", true, 22),
                  createCell("Staff Login Email", true, 28),
                  createCell("Phone / Area", true, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Royal Spice Kitchen", false, 25),
                  createCell("Vikram Singhania", false, 22),
                  createCell("vikram@royalspice.com", false, 28),
                  createCell("+91 9811223344 (Bandra West)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Dragon Wok & Bao", false, 25),
                  createCell("Chef Lin Mei", false, 22),
                  createCell("lin@dragonwok.com", false, 28),
                  createCell("+91 9877665544 (Pali Hill)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("La Piazza Trattoria", false, 25),
                  createCell("Chef Marco Rossi", false, 22),
                  createCell("marco@lapiazza.com", false, 28),
                  createCell("+91 9866554433 (Juhu Tara Rd)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Dosa Craft & Tiffin", false, 25),
                  createCell("Meenakshi Iyer", false, 22),
                  createCell("meenakshi@dosacraft.com", false, 28),
                  createCell("+91 9855443322 (Matunga)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Burger Foundry", false, 25),
                  createCell("Kabir Anand", false, 22),
                  createCell("kabir@burgerfoundry.com", false, 28),
                  createCell("+91 9844332211 (Khar West)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Sakura Sushi House", false, 25),
                  createCell("Chef Kenji Sato", false, 22),
                  createCell("kenji@sakurasushi.com", false, 28),
                  createCell("+91 9833221100 (BKC)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("El Fuego Taqueria", false, 25),
                  createCell("Carlos Mendez", false, 22),
                  createCell("carlos@elfuegotacos.com", false, 28),
                  createCell("+91 9822110099 (Santacruz)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Beirut Lounge", false, 25),
                  createCell("Ziad Haddad", false, 22),
                  createCell("ziad@beirutlounge.com", false, 28),
                  createCell("+91 9811009988 (Colaba)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Le Petit Croissant", false, 25),
                  createCell("Camille Dubois", false, 22),
                  createCell("camille@lepetitcroissant.com", false, 28),
                  createCell("+91 9899887766 (Bandra)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("The Green Bowl Co.", false, 25),
                  createCell("Ananya Sen", false, 22),
                  createCell("ananya@greenbowlhealth.com", false, 28),
                  createCell("+91 9888776655 (Worli)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Chowpatty Chaat", false, 25),
                  createCell("Girish Sharma", false, 22),
                  createCell("girish@chowpattychaat.com", false, 28),
                  createCell("+91 9877889900 (Girgaon)", false, 25),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Southern Coast Seafood", false, 25),
                  createCell("Devdas Naik", false, 22),
                  createCell("devdas@southerncoast.com", false, 28),
                  createCell("+91 9866778899 (Versova)", false, 25),
                ],
              }),
            ],
          }),

          createHeader("4. Customer / User Accounts", HeadingLevel.HEADING_2),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createCell("Customer Name", true, 25),
                  createCell("Login Email", true, 35),
                  createCell("Phone", true, 20),
                  createCell("Address Location", true, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Rahul Sharma", false, 25),
                  createCell("rahul@example.com", false, 35),
                  createCell("+91 9876543210", false, 20),
                  createCell("Bandra West, Mumbai", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Priya Patel", false, 25),
                  createCell("priya@example.com", false, 35),
                  createCell("+91 9822334455", false, 20),
                  createCell("Juhu Scheme, Mumbai", false, 20),
                ],
              }),
              new TableRow({
                children: [
                  createCell("Aman Kapoor", false, 25),
                  createCell("aman@example.com", false, 35),
                  createCell("+91 9833445566", false, 20),
                  createCell("Pali Hill, Mumbai", false, 20),
                ],
              }),
            ],
          }),

          createParagraph("\nInstructions:", { bold: true }),
          createParagraph("1. Direct Persona Switcher: Click the avatar in the top-right navbar on any page to switch between accounts instantly without passwords."),
          createParagraph("2. Manual Login: Go to /login and enter any of the above emails."),
        ],
      },
    ],
  });

  return doc;
}

async function run() {
  const doc = createDocx();
  const buffer = await Packer.toBuffer(doc);

  const localDocxPath = path.join(__dirname, '..', 'OFDS_Accounts_Directory.docx');
  const publicDocxPath = path.join(__dirname, '..', 'public', 'OFDS_Accounts_Directory.docx');

  fs.writeFileSync(localDocxPath, buffer);
  fs.writeFileSync(publicDocxPath, buffer);

  console.log("Successfully generated docx at:");
  console.log(" - " + localDocxPath);
  console.log(" - " + publicDocxPath);
}

run().catch(console.error);
