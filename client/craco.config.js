module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Fix webpack-dev-server deprecation warnings
      if (webpackConfig.devServer) {
        // Remove deprecated options
        delete webpackConfig.devServer.onBeforeSetupMiddleware;
        delete webpackConfig.devServer.onAfterSetupMiddleware;
        
        // Use new setupMiddlewares option
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          return middlewares;
        };
      }
      return webpackConfig;
    },
  },
  devServer: (devServerConfig) => {
    // Additional devServer configuration
    return {
      ...devServerConfig,
      onBeforeSetupMiddleware: undefined,
      onAfterSetupMiddleware: undefined,
      setupMiddlewares: (middlewares) => middlewares,
    };
  },
};
