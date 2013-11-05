// Examining the deps.js and session module from Meteor.
var currentComputation = null;
var nextId = 0;
var toFlush = [];

// Computes all required computations on next tick.
var requireFlush = function() {
	setTimeout(flush, 0);
};

var flush = function() {
	for (var i = 0; i < toFlush.length; i++) {
		toFlush[i].compute();
	}
	toFlush = [];
};

var contains = function(array, obj) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === obj) return true;
	}
};

// Keeps reference to a function.
var Computation = function(f) {
	this.id = nextId++;
	this.onInvalidateCallbacks = [];
	this.func = f;
};

// While running the function, ensure that the current computation is this.
// After finished running, remove reference to this computation.
Computation.prototype.compute = function() {
	currentComputation = this;
	this.func();
	currentComputation = null;
};

// Adds to flush list.
Computation.prototype.invalidate = function() {
	if (!contains(toFlush, this)) {
		toFlush.push(this);
	}
	requireFlush();
	for (var i = 0; i < this.onInvalidateCallbacks; i++) {
		this.onInvalidateCallbacks[i]();
	}
	this.onInvalidateCallbacks = [];
};

// Tracks dependant functions and invalidates upon change.
var Dependency = function() {
	this.dependents = {};
};

// Adds current computation to list of dependants of this dependency.
Dependency.prototype.depend = function() {
	var self = this;

	if (computation = currentComputation) {
		computationId = computation.id;
		this.dependents[computationId] = computation;
		computation.onInvalidateCallbacks.push(function() {
			delete self.dependents[computationId];
		});
	}
};

Dependency.prototype.changed = function() {
	for (dep in this.dependents) {
		this.dependents[dep].invalidate();
	}
};

// Session object manages current values and dependencies.
var Session = {
	keys: {},
	keyDeps: {}
};

// Make sure the current computation depends on this keys Dependency.
Session.get = function(key) {
	this.ensureDep(key);
	this.keyDeps[key].depend();
	return this.keys[key];
};

Session.ensureDep = function(key) {
	if (!this.keyDeps[key]) {
		this.keyDeps[key] = new Dependency();
	}
};

// Change value if required, and run dependency.changed() on keys dep.
Session.set = function(key, value) {
	var oldValue;
	if (this.keys[key]) oldValue = this.keys[key];
	if (value === oldValue) return;

	this.keys[key] = value;
	this.keyDeps[key].changed();
};

// autorun creates new computation and runs once.
autorun = function(f) {
	var c = new Computation(f);
	c.compute();
};
