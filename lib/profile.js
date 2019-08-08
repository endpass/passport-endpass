/**
 * Parse profile.
 *
 * @param {Object|String} json
 * @return {Object}
 * @api private
 */
exports.parse = function(json) {
  const res = typeof json === 'string' ? JSON.parse(json) : json;

  return {
    email: res.email,
  };
};
