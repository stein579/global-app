const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// zustand's package.json has no "browser" export condition, so Metro's web
// resolver falls back to its ESM build (esm/middleware.mjs), which contains
// a bare `import.meta.env` reference for Vite. That's a parse-time syntax
// error in Metro's non-module web bundle. Force zustand to resolve via the
// CJS build on web, matching what already happens on native ("react-native"
// condition), where the CJS build is used instead.
const { resolveRequest: defaultResolveRequest } = config.resolver;
config.resolver.resolveRequest = (context, moduleName, platform, ...rest) => {
  if (platform === "web" && (moduleName === "zustand" || moduleName.startsWith("zustand/"))) {
    return context.resolveRequest(
      { ...context, isESMImport: false },
      moduleName,
      platform
    );
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform, ...rest)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
