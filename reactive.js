var Reactive = function(value) {
	this.val = value;
	this.dep = new Dependency();
};

Reactive.prototype = {
	get: function() {
		this.dep.depend();
		return this.val;
	},
	set: function(value) {
		if (this.val !== value) {
			this.val = value;
			this.dep.changed();
		}
		return this.val;
	}
};
