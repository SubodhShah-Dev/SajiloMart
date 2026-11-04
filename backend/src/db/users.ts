import bcrypt from "bcrypt";

let count = 0;
const users: Record<string, any>[] = [
  {
    name: "Subodh Shah",
    email: "subodh@example.com",
    passwordHash: await bcrypt.hash("subodh@example.com", 10),
    role: "customer",
  },
];

for (const user of users) {
  user.id = count + 1;
}

export default users;
