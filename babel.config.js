//
//  babel.config.js
//  
//
//  Created by USER on 05/08/2026.
//

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
  };
};
