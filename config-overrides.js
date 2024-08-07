module.exports = function override(config) {
  config.resolve.fallback = {
    fs: false,
  };

  return config;
};
