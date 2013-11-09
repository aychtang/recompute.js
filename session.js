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
