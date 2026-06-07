const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../shared/utils/prisma');

class AuthService {
  static generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  static async register(data) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        status: 'ACTIVE',
      },
      include: { role: { include: { permissions: true } } }
    });

    const tokens = this.generateTokens(user.id);
    return { user, ...tokens };
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: { include: { permissions: true } }, organization: true }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is deactivated');
    }

    const tokens = this.generateTokens(user.id);
    return { user, ...tokens };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return true;
  }

  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: { include: { permissions: true } },
        organization: true,
        department: true,
        team: true,
      }
    });

    if (!user) throw new Error('User not found');

    const { password, ...profile } = user;
    return profile;
  }

  static async updateProfile(userId, data) {
    const allowedFields = ['fullName', 'phone', 'avatar', 'position'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        role: { include: { permissions: true } },
        organization: true,
        department: true,
        team: true,
      }
    });

    const { password, ...profile } = user;
    return profile;
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      const tokens = this.generateTokens(decoded.userId);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

module.exports = AuthService;
