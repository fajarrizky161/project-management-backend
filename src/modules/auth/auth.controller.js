const AuthService = require('./auth.service');
const ApiResponse = require('../../shared/utils/apiResponse');

class AuthController {
  static async register(req, res) {
    try {
      const result = await AuthService.register(req.body);
      return ApiResponse.success(res, result, 'User registered successfully', 201);
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  static async getProfile(req, res) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return ApiResponse.success(res, profile, 'Profile retrieved');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await AuthService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, profile, 'Profile updated');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      await AuthService.prototype.changePassword(req.user.id, currentPassword, newPassword);
      return ApiResponse.success(res, null, 'Password changed successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message, 400);
    }
  }

  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, tokens, 'Token refreshed');
    } catch (error) {
      return ApiResponse.error(res, error.message, 401);
    }
  }

  static async logout(req, res) {
    return ApiResponse.success(res, null, 'Logged out successfully');
  }
}

module.exports = AuthController;
