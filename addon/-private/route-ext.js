import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';

/*
  Creates an aliased form of a method that properly resolves external routes.
*/
function externalAlias(methodName) {
  return function _externalAliasMethod(routeName, ...args) {
    let externalRoute = getOwner(this)._getExternalRoute(routeName);
    let router = this._router || this.router;
    return router[methodName](externalRoute, ...args);
  };
}

Route.reopen({
  transitionToExternal: externalAlias('transitionTo'),
  replaceWithExternal: externalAlias('replaceWith')
});
