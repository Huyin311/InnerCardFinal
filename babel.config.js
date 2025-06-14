module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [], // bạn có thể thêm plugin nếu cần
  };
};
