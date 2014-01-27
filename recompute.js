// Examining the deps.js and session module from Meteor.
var currentComputation = null;
var nextId = 0;
var toFlush = [];

// Computes all required computations on next tick.
var requireFlush = function() {
	setTimeout(flush, 0);
};

// Computes all computations that have been invalidated since last flush.
var flush = function() {
	for (var i = 0; i < toFlush.length; i++) {
		toFlush[i].compute();
	}
	toFlush = [];
};


// Searches for obj within an array returns true if found
// or undefined if not found.
var contains = function(array, obj) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === obj) return true;
	}
};

// Computation
// Keeps reference to a function, and makes sure it is run
// when the Computation has been invalidated.

// Whenever a Dependency that a computation depends upon is changed,
// that Computation is invalidated.
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


// Upon invalidation, add the current computation to flush list.
// Schedule a flush to be run which will force all invalid
// Computations to recompute.

// Also run any callbacks assigned to be handled
// after invalidation.
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

// Dependency
// When Computations depend on a reactive value, they are added
// to the dependents list of the Dependency object that is 
// associated with that reactive value.

// A Dependency has a .changed() method available, which when
// called, will invalidate every Computation that depends on it.
var Dependency = function() {
	this.dependents = {};
};

// Adds current computation to list of dependants of this Dependency.
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

// Invalidates all Computations that depend on this Dependency.
Dependency.prototype.changed = function() {
	for (var dep in this.dependents) {
		this.dependents[dep].invalidate();
	}
};

// Autorun creates new computation representing the function that
// has been passed in, and computes it once.
autorun = function(f) {
	var c = new Computation(f);
	c.compute();
};
