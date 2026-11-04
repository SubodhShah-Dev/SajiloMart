import bcrypt from "bcrypt";

let count = 0;
const products: Record<string, any>[] = [
  {
    name: "Subodh Shah",
    email: "subodh@example.com",
    passwordHash: await bcrypt.hash("subodh@example.com", 10),
    role: "customer",
  },
];

for (const product of products) {
  product.id = count + 1;
}

export default products;
