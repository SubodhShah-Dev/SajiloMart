import { AppDataSource } from "../config/data-source.js";
import { User } from "../entities/User.js";
import { bcryptHash } from "../utils/hash.util.js";

async function main() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFirstName = process.env.ADMIN_FIRST_NAME;
  const adminLastName = process.env.ADMIN_LAST_NAME;

  if (!adminEmail) {
    // eslint-disable-next-line no-console
    console.error("ADMIN_EMAIL is required");
    process.exit(1);
  }

  if (!adminPassword) {
    // eslint-disable-next-line no-console
    console.error("ADMIN_PASSWORD is required");
    process.exit(1);
  }

  if (adminPassword.length < 12) {
    // eslint-disable-next-line no-console
    console.error("ADMIN_PASSWORD must be at least 12 characters");
    process.exit(1);
  }

  if (!adminFirstName) {
    // eslint-disable-next-line no-console
    console.error("ADMIN_FIRST_NAME is required");
    process.exit(1);
  }

  if (!adminLastName) {
    // eslint-disable-next-line no-console
    console.error("ADMIN_LAST_NAME is required");
    process.exit(1);
  }

  const userRepository = AppDataSource.getRepository(User);

  const existing = await userRepository.findOne({
    where: { email: adminEmail.toLowerCase() },
    select: { id: true },
  });

  if (existing) {
    // eslint-disable-next-line no-console
    console.error("An account with this email already exists");
    process.exit(1);
  }

  const passwordHash = await bcryptHash(adminPassword);

  const user = userRepository.create({
    firstName: adminFirstName,
    lastName: adminLastName,
    userName: adminEmail.split("@")[0]?.slice(0, 100) || "admin",
    email: adminEmail.toLowerCase(),
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
  });

  await userRepository.save(user);

  // eslint-disable-next-line no-console
  console.log("Admin user created successfully");
}

void main();