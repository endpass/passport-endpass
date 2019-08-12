/**
 * Parse profile.
 *
 * @param {object|string} json
 * @return {object}
 * @api private
 */
exports.parse = function(json) {
  const res = typeof json === 'string' ? JSON.parse(json) : json;

  return {
    email: res.email,
  };
};
