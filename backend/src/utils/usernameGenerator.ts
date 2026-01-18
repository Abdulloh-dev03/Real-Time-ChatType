import User from "#models/user.model.js";

export async function generateUniqueUsername(base: string): Promise<string> {
  const sanitizedBase = base.toLowerCase().replace(/\s+/g, "");

  let username = `#${sanitizedBase}`;
  let isTaken = await User.exists({ username });

  while (isTaken) {
    const randomNumber = Math.floor(Math.random() * 10000);
    username = `#${sanitizedBase}${randomNumber}`;
    isTaken = await User.exists({ username });
  }

  return username;
}
