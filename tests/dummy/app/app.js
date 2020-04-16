import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver;
  engines = {
    emberBlog: {
      dependencies: {
        services: [{ 'data-store': 'store' }],
        externalRoutes: {
          home: 'application',
        },
      },
    },
    emberChat: {
      dependencies: {
        services: ['store'],
      },
    },
  };
}

loadInitializers(App, config.modulePrefix);
