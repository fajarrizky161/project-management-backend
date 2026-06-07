const SearchService = require('./search.service');

class SearchController {
  static async globalSearch(req, res, next) {
    try {
      const { q, limit } = req.query;
      const organizationId = req.user.organizationId;
      const results = await SearchService.globalSearch(organizationId, q, limit ? parseInt(limit) : 5);
      res.json({ data: results });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SearchController;
