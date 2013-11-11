// Interface for making db queries reactive.

var ReactiveDb = function(collection) {
	this.db = collection;
	this.dep = new Dependency();
};

ReactiveDb.prototype.insert = function(doc) {
	db.insert(doc);
};

ReactiveDb.prototype.update = function(query, change) {
	db.update(query, change);
	this.dep.changed();
};

ReactiveDb.prototype.find = function(query) {
	this.dep.depend();
	db.find(query);
};

ReactiveDb.prototype.remove = function(query) {
	db.remove(query);
	this.dep.changed();
};
