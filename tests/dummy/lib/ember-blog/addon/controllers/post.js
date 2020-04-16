import Controller from '@ember/controller';
import { set } from '@ember/object';

export default Controller.extend({
  queryParams: ['lang'],

  actions: {
    transitionToHomeFromController() {
      this.transitionToExternalRoute('home').then(() => {
        set(this, 'transitionedToExternalRoute', true);
      });
    },
  }
});
