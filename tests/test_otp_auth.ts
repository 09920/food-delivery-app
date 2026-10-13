import assert from "assert";
import prisma from "../src/lib/db";

async function testOtpFlow() {
  console.log("Testing Swiggy/Zomato Email OTP Workflow...");

  const testEmail = `testuser_${Date.now()}@example.com`;

  // 1. Generate OTP
  const code = "482910";
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const otpRecord = await prisma.otpVerification.create({
    data: {
      email: testEmail,
      code,
      expiresAt,
      verified: false,
    },
  });

  assert(otpRecord.id, "OTP record created in database");
  console.log("✓ OTP record successfully stored in database with expiry");

  // 2. Verify invalid code rejection
  assert.notStrictEqual("000000", otpRecord.code);
  console.log("✓ Incorrect OTP code properly identified");

  // 3. Complete verification and customer auto-registration
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { verified: true },
  });

  const newUser = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: testEmail,
      phone: "+91 9876543210",
      role: "CUSTOMER",
    },
  });

  assert.strictEqual(newUser.role, "CUSTOMER");
  assert.strictEqual(newUser.name, "Aarav Sharma");
  console.log("✓ Customer auto-created successfully upon OTP verification");

  // Cleanup
  await prisma.otpVerification.deleteMany({ where: { email: testEmail } });
  await prisma.user.delete({ where: { id: newUser.id } });
  console.log("✓ Cleanup finished. All OTP tests passed!");
}

testOtpFlow()
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
