import EmberRouter from '@ember/routing/router';
import config from './config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function() {
  this.route('routeless-engine-demo');

  this.route('routable-engine-demo', function() {
    this.route('normal-route');
    this.route('redirect');
    this.route('after-model', { path: '/after-model/:id' });

    this.mount('ember-blog');

    this.mount('ember-blog', { as: 'hr-blog' });
    this.mount('ember-blog', { as: 'legal-blog' });

    this.mount('ember-blog', { as: 'blog', resetNamespace: true });
    this.mount('ember-blog', { as: 'dev-blog', resetNamespace: true });

    this.mount('ember-blog', {
      as: 'admin-blog',
      path: '/special-admin-blog-here',
    });

    this.mount('eager-blog', { resetNamespace: true });
  });

  // Used to check for collisions with Post route in ember-blog
  this.route('post', { path: '/post/:id' });
});
