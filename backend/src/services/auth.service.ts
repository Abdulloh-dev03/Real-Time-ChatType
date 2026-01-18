import User from "#models/user.model.js";

export const findUserByEmail = async (email: string) => {
  return await User.findOne({ email });
};

export const findByUsername = async (username: string) => {
  return await User.findOne({ username });
};

export const createUser = async (email: string, username: string) => {
  return await User.create({
    email,
    username,
    isVerified: false,
  });
};

export const findUserByIdentifier = async (identifier: string) => {
  return await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });
};

export const verifyUser = async (email: string) => {
  return await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { new: true },
  );
};
