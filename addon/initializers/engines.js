// Load extensions to Ember
import '../-private/route-ext';
import '../-private/router-ext';
import '../-private/engine-ext';
import '../-private/engine-instance-ext';
import '../-private/controller-ext';

// TODO: Move to ensure they run prior to instantiating Ember.Application
export function initialize() {}

export default {
  name: 'engines',
  initialize,
};
