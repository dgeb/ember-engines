import Ember from 'ember';
import { module, test } from 'qunit';
import { default as _sinon } from 'sinon';
import Initializer from 'ember-blog/initializers/ember-blog-initializer';
import InstanceInitializer from 'ember-blog/instance-initializers/ember-blog-instance-initializer';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, visit, find, click } from '@ember/test-helpers';


let originalExceptionHandler;
let sinon;

module('Acceptance | routeless engine demo', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    originalExceptionHandler = Ember.Test.adapter.exception;
    sinon = _sinon.createSandbox();
  });

  hooks.afterEach(function () {
    sinon.restore();
    Ember.Test.adapter.exception = originalExceptionHandler;
  });

  test('can invoke components', async function (assert) {
    await visit('/routable-engine-demo/blog/new');

    assert.equal(currentURL(), '/routable-engine-demo/blog/new');

    assert.equal(
        find('.routable-hello-world')
        .textContent
        .trim(),
      'Hello, world!'
    );
    assert.equal(
        find('.hello-name')
        .textContent
        .trim(),
      'Hello, Jerry!',
      'Re-rendered hello-name component correctly'
    );
  });

  test("can deserialize a route's params", async function (assert) {
    assert.expect(3);

    await visit('/routable-engine-demo/blog/post/1');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1');

    assert.equal(
      find('h3.post-title')
        .textContent
        .trim(),
      'Post 1'
    );
    assert.equal(
      find('p.author')
        .textContent
        .trim(),
      'Derek Zoolander'
    );
  });

  test('can link-to application route of Engine', async function (assert) {
    await visit('/routable-engine-demo/blog/post/new');
    await click('.routable-post-blog-home-link-app');

    assert.equal(currentURL(), '/routable-engine-demo/blog');
  });

  test('correctly handles navigation with query param in initial url', async function (
    assert
  ) {
    assert.expect(9);

    await visit('/routable-engine-demo/blog/post/1?lang=English');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'url is visited properly'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'English',
      'query param value is passed through correctly - 1'
    );

    await click('.routable-post-comments-link');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1/comments?lang=English',
      'query param is carried to sub-route'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'English',
      'query param value is passed through correctly - 2'
    );

    await click('.back-to-post-link');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'query param is carried back to original route properly'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'English',
      'query param value is passed through correctly - 3'
    );

    await click('.routable-post-blog-home-link');
    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog',
      'query param is removed when changing route hierarchy'
    );

    await click('.routable-post-1-link');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'query param is rehydrated in url'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'English',
      'query param value is passed through correctly - 4'
    );
  });

  test('can link-to a route with query params from outside an Engine', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo');
    await click('.blog-post-1-link-jp');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Japanese'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'Japanese'
    );
  });

  test('can programmatically transition to a route with query params from outside an Engine', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo');
    await click('.blog-post-1-link-ch');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Chinese'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'Chinese'
    );
  });

  test('can link-to a route with query params within an Engine', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog');
    await click('.routable-post-1-link-jp');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Japanese'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'Japanese'
    );
  });

  test('can programmatically transition to a route with query params within an Engine', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog');
    await click('.routable-post-1-link-ch');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Chinese'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'Chinese'
    );
  });

  test('can perform a QP-only link-to transition', async function (assert) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog/post/1?lang=English');
    await click('.routable-post-jp-link');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Japanese',
      'URL is updated properly'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'Japanese',
      'DOM is updated properly'
    );
  });

  test('can perform a QP-only transitionTo', async function (assert) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog/post/1?lang=English');
    await click('.routable-post-ch-link');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=Chinese',
      'URL is updated properly'
    );
    assert.equal(
      find('p.language')
        .textContent
        .trim(),
      'Chinese',
      'DOM is updated properly'
    );
  });

  test('can perform a redirect transition with QP', async function (assert) {
    assert.expect(1);

    await visit('/routable-engine-demo/redirect');
    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English'
    );
  });

  test('can perform an afterModel transition with QP', async function (assert) {
    assert.expect(1);

    await visit('/routable-engine-demo/after-model/3');
    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/3?lang=English'
    );
  });

  test('query param bucket cache does not collide when starting outside Engine', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/post/1?lang=English');
    await click('.blog-post-no-qp');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1',
      'URL does not have any query params'
    );

    await click('.non-blog-post');
    assert.equal(
      currentURL(),
      '/post/1?lang=English',
      'URL has original query params'
    );
  });

  test('query param bucket cache does not collide when starting inside Engine', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog/post/1?lang=English');
    await click('.non-blog-post');

    assert.equal(currentURL(), '/post/1', 'URL does not have any query params');

    await click('.blog-post-no-qp');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/blog/post/1?lang=English',
      'URL has original query params'
    );
  });

  test("a route can lookup another route's model", async function (assert) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog/post/1/comments');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments');

    assert.equal(
      find('h4.comments')
        .textContent
        .trim(),
      'Comments for Post 1'
    );
  });

  test('can render a link', async function (assert) {
    assert.expect(2);

    await visit('/routable-engine-demo/blog/post/1');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1');

    let contentLink = find('a.routable-post-comments-link').href;

    assert.ok(
      contentLink.includes('/routable-engine-demo/blog/post/1/comments')
    );
  });

  test('link-to current-when attribute prepends engine mount point', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/eager-blog/post/1');

    assert.equal(currentURL(), '/routable-engine-demo/eager-blog/post/1');
    assert.ok(
      find('a.current-when-test-link').classList.contains('active')
    );
  });

  test('internal links can be clicked', async function (assert) {
    assert.expect(1);

    await visit('/routable-engine-demo/blog/post/1');
    await click('.routable-post-home-link');

    assert.equal(currentURL(), '/');
  });

  test('external links can be clicked', async function (assert) {
    assert.expect(1);

    await visit('/routable-engine-demo/blog/post/1');
    await click('.routable-post-comments-link');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments');
  });

  test('a route can use transitionTo to transition to internal route', async function (
    assert
  ) {
    assert.expect(1);

    await visit('/routable-engine-demo/blog/new');
    await click('.trigger-transition-to');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1');
  });

  test('internal links can be clicked', async function (assert) {
    assert.expect(1);

    await visit('/routable-engine-demo/special-admin-blog-here/post/1');
    await click('.routable-post-comments-link');

    assert.equal(
      currentURL(),
      '/routable-engine-demo/special-admin-blog-here/post/1/comments'
    );
  });

  test('transitionTo works properly within parent application', async function (assert) {
    assert.expect(1);

    await visit('/routable-engine-demo/normal-route');

    assert.equal(currentURL(), '/routeless-engine-demo');
  });

  test('transitionToExternal transitions to the parent application from within an engine and returns a thenable Transition object', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/ember-blog/post/1');
    await click('.routable-post-transition-to-home-button');

    assert.equal(currentURL(), '/');

    await click('.routeable-engine');
    await click('.ember-blog-new');
    await click('.trigger-transition-to');

    assert.ok(
      find('.routable-post-transition-to-home-button').classList.contains('transitioned-to-external')
    );
  });

  test("transitionToExternalRoute transitions to the parent application from within an engine's controller and returns a thenable Transition object", async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/ember-blog/post/1');
    await click('.routable-post-transition-to-route-home-button');

    assert.equal(currentURL(), '/');

    await click('.routeable-engine');
    await click('.ember-blog-new');
    await click('.trigger-transition-to');

    assert.ok(
      find('.routable-post-transition-to-route-home-button').classList.contains('transitioned-to-external-route')
    );
  });

  test('replaceWithExternal transitions to the parent application from within an engine and returns a thenable Transition object', async function (
    assert
  ) {
    assert.expect(2);

    await visit('/routable-engine-demo/ember-blog/post/1');
    await click('.routable-post-replace-with-home-button');

    assert.equal(currentURL(), '/');

    await click('.routeable-engine');
    await click('.ember-blog-new');
    await click('.trigger-transition-to');

    assert.ok(
      find('.routable-post-replace-with-home-button').classList.contains('replaced-with-external')
    );
  });

  test('loading routes and intermediateTransitionTo work within an engine', async function (
    assert
  ) {
    assert.expect(2);

    this.owner.lookup('router:main').reopen({
      intermediateTransitionTo(routeName) {
        assert.equal(routeName, 'blog.post.loading');
        this._super(...arguments);
      },
    });

    await visit('/routable-engine-demo/blog/post/1/comments');
    await click('.routable-post-likes-link');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/likes');
  });

  test('error routes and intermediateTransitionTo work within an engine', async function (
    assert
  ) {
    assert.expect(3);

    Ember.Test.adapter.exception = () => { };

    this.owner.lookup('router:main').reopen({
      intermediateTransitionTo(routeName) {
        assert.equal(routeName, 'blog.post.error');
        this._super(...arguments);
      },
    });

    await visit('/routable-engine-demo/blog/post/1/comments');
    await click('.routable-post-diggs-link');

    assert.equal(currentURL(), '/routable-engine-demo/blog/post/1/comments');
    assert.equal(find('.error-message').textContent, 'Error: Nope!');
  });

  test('initializers run within engine', async function (assert) {
    assert.expect(1);

    let stub = sinon.stub(Initializer, 'initialize');

    await visit('/routable-engine-demo/blog/new');

    assert.ok(stub.calledOnce, 'Initializer ran once');
  });

  test('instance initializers run within engine', async function (assert) {
    assert.expect(1);

    let stub = sinon.stub(InstanceInitializer, 'initialize');

    await visit('/routable-engine-demo/blog/new');

    assert.ok(stub.calledOnce, 'Instance initializer ran once');
  });

  test('instance-initializers run after initializers', async function (assert) {
    assert.expect(2);

    let appInitialized = false;
    let instanceInitialized = false;

    let appInit = sinon.stub(Initializer, 'initialize').callsFake(() => {
      appInitialized = true;
      assert.ok(!instanceInitialized, 'instance initialized has not run yet');
    });

    let instanceInit = sinon.stub(InstanceInitializer, 'initialize').callsFake(() => {
      instanceInitialized = true;
      assert.ok(appInitialized, 'initializer already ran');
    });

    await visit('/routable-engine-demo/blog/new');

    appInit.restore();
    instanceInit.restore();
  });

});
