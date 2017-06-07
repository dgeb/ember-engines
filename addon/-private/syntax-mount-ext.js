import Ember from 'ember';
import emberRequire from './ext-require';

const GlimmerRuntime = Ember.__loader.registry['@glimmer/runtime'];
const GlimmerReference = Ember.__loader.registry['@glimmer/reference'];

if (GlimmerRuntime !== undefined || GlimmerReference !== undefined) {

  const {
    assert,
    runInDebug
  } = Ember;

  const mountSyntaxModule = Ember.__loader.require('ember-glimmer/syntax/mount');
  const ComponentDefinition = emberRequire('@glimmer/runtime', 'ComponentDefinition');
  const UNDEFINED_REFERENCE = emberRequire('@glimmer/reference', 'UNDEFINED_REFERENCE');
  const RootReference = emberRequire('ember-glimmer/utils/references', 'RootReference');
  const generateControllerFactory = emberRequire('ember-routing', 'generateControllerFactory');
  const OutletLayoutCompiler = emberRequire('ember-glimmer/syntax/outlet', 'OutletLayoutCompiler');
  const FACTORY_FOR = emberRequire('container', 'FACTORY_FOR');
  const AbstractManager = emberRequire('ember-glimmer/syntax/abstract-manager');

  let dynamicEngineFor = function(vm, symbolTable) {
    let env     = vm.env;
    let args    = vm.getArgs();
    let nameRef = args.positional.at(0);

    return new DynamicEngineReference({ nameRef, env, symbolTable });
  };

  mountSyntaxModule.mountMacro = function(path, params, hash, builder) {
    assert(
      'You can only pass a single argument to the {{mount}} helper, e.g. {{mount "chat-engine"}}.',
      params.length === 1 && hash === null
    );

    assert(
      'The first argument of {{mount}} must be quoted, e.g. {{mount "chat-engine"}}.',
      typeof params[0] === 'string'
    );

    let definitionArgs = [params.slice(0, 1), null, null, null];
    let args = [null, null, null, null];
    builder.component.dynamic(definitionArgs, dynamicEngineFor, args, builder.symbolTable);
    return true;
  };

  class DynamicEngineReference {
    constructor({ nameRef, env, symbolTable, args }) {
      this.tag = nameRef.tag;
      this.nameRef = nameRef;
      this.env = env;
      this.symbolTable = symbolTable;
      this.args = args;
      this._lastName = undefined;
      this._lastDef = undefined;
    }

    value() {
      let { env, nameRef, /*symbolTable*/ } = this;
      let nameOrDef = nameRef.value();

      if (this._lastName === nameOrDef) {
        return this._lastDef;
      }

      assert(
        `You used \`{{mount '${nameOrDef}'}}\`, but the engine '${nameOrDef}' can not be found.`,
        env.owner.hasRegistration(`engine:${nameOrDef}`)
      );

      if (!env.owner.hasRegistration(`engine:${nameOrDef}`)) {
        return null;
      }

      this._lastName = nameOrDef;
      this._lastDef = new MountDefinition(nameOrDef, env);

      return this._lastDef;
    }
  }

  class MountManager extends AbstractManager {
    prepareArgs(definition, args) {
      return args;
    }

    create(environment, { name }, args, dynamicScope) {
      runInDebug(() => this._pushEngineToDebugStack(`engine:${name}`, environment));

      dynamicScope.outletState = UNDEFINED_REFERENCE;

      let engine = environment.owner.buildChildEngineInstance(name);

      engine.boot();

      return engine;
    }

    layoutFor(definition, engine, env) {
      let template = engine.lookup(`template:application`);
      return env.getCompiledBlock(OutletLayoutCompiler, template);
    }

    getSelf(engine) {
      let applicationFactory = engine[FACTORY_FOR](`controller:application`);
      let factory = applicationFactory || generateControllerFactory(engine, 'application');
      return new RootReference(factory.create());
    }

    getTag() {
      return null;
    }

    getDestructor(engine) {
      return engine;
    }

    didCreateElement() {}

    didRenderLayout() {
      runInDebug(() => this.debugStack.pop());
    }

    didCreate(/*state*/) {}
    update(/*state, args, dynamicScope*/) {}
    didUpdateLayout() {}
    didUpdate(/*state*/) {}
  }

  const MOUNT_MANAGER = new MountManager();

  class MountDefinition extends ComponentDefinition {
    constructor(name, env) {
      super(name, MOUNT_MANAGER, null);
      this.env = env;
    }
  }
}
