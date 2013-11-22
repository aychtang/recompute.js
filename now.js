
var Now = function(interval) {
	this.dep = new Dependency();
	this.value = new Date().toLocaleTimeString();
	this.start(interval);
};

Now.prototype.start = function(interval) {
	this.interval = this.interval || this.updateInterval(interval || 1000);
};

Now.prototype.get = function() {
	this.dep.depend();
	return this.value;
};

Now.prototype.set = function(time) {
	this.value = time;
	this.dep.changed();
};

Now.prototype.updateInterval = function(interval) {
	this.interval = setInterval(function() {
		this.set(new Date().toLocaleTimeString());
	}.bind(this), interval);
};