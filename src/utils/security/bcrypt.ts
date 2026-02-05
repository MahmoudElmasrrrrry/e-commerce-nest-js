import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

export const hashing = (password: string): string => {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

export const comparing = (password: string, hashedPassword: string): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
}