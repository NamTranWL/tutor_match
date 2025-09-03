import * as bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPasswordHelper = async (plainPassword: string) => {
  const hash = await bcrypt.hash(plainPassword, saltRounds);
  return hash;
};

export const comparePasswords = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
