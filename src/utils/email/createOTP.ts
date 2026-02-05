import { customAlphabet } from "nanoid";

export const createOTP = () => {
  const nanoid = customAlphabet("1234567890", 6);
  return nanoid();
};


