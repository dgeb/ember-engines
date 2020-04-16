import Controller from '@ember/controller';
import { getOwner } from '@ember/application';

Controller.reopen({
  /*
    Creates an aliased form of a method that properly resolves external routes.
  */
 transitionToExternalRoute(routeName, ...args) {
    let externalRoute = getOwner(this)._getExternalRoute(routeName);
    let target = this.target;
    let method = target.transitionToRoute || target.transitionTo;

    return method.apply(target, [externalRoute, ...args]);
  }
});