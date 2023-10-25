import bcryptjs from "bcrypt";

export default class PasswordHasher {
  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
    return hashedPassword;
  }

  public static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    const isPasswordMatch = await bcryptjs.compare(password, hashedPassword);
    return isPasswordMatch;
  }
}
