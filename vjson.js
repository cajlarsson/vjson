/*
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <caj.larsson@gmail.com> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return Caj Larsson
 * ----------------------------------------------------------------------------
 */

var vjson = vjson = vjson || {};

vjson.is_dict = function(obj) {
	var is_obj = typeof obj === 'object';
	var is_not_array = Object.prototype.toString.call(obj) != '[object Array]';
	var has_len = true;
	if (is_obj) 
		has_len = Object.getOwnPropertyNames.length !== 0;
	return is_obj && is_not_array && has_len;
}

// Forwards an vjson object with a delta.
// Can also be used to merge consequtive delta.
vjson.apply = function(node, delta) {
	var node_rev = node[0];
	var node_val = node[1];
	var node_hook = node[2];
	var delta_rev = delta[0];
	var delta_val = delta[1];
	var new_node_val;
	var new_node_rev;
	if (node_rev < delta_rev) {
		// Node is outdated, update it recursively.
		if (!vjson.is_dict(delta_val)) {
			// Non-objects are leafnodes.
			new_node_rev = delta_rev;
			new_node_val = delta_val;
		} else if (!vjson.is_dict(node_val)) {
			// If the node is not an object no merge is necesary.
			new_node_rev = delta_rev;
			new_node_val = delta_val;
		} else {
			new_node_rev = delta_rev;
			new_node_val = {};
			for (key in delta_val) {
				if (key in node_val) {
					new_node_val[key] = vjson.apply(node_val[key], delta_val[key]);
				} else {
					new_node_val[key] = delta_val[key];
				}
			}
		}
	} else if (node_rev === delta_rev) {
		// We have the specified node.
		new_node_rev = node_rev;
		new_node_val = node_val;
	} else {
		throw { 
		    name:        "vjson corrupt", 
		    level:       "Show Stopper", 
		    message:     "Revisions in delta and vjson object are incompatible", 
		    toString:    function(){return this.name + ": " + this.message} 
		} 		
	}
	// Give the hook function to have an side effect and replace modify the node.
	if (typeof node_hook === 'function') {
		return node_hook(new_node_rev, new_node_val);
	}
	return [new_node_rev, new_node_val, null];
};

// Generate a delta that can be applied to an old revision.
vjson.build_delta = function(vjson_obj, rev) {
	var node_rev = vjson_obj[0];
	var node_val = vjson_obj[1];
	if (node_rev <= rev) {
		return [node_rev];
	}
	if (!vjson.is_dict(node_val)) {
		return vjson_obj;
	}
	var delta_val = {};
	for (key in node_val) {
		delta_val[key] = vjson.build_delta(node_val[key], rev);
	}
	return [node_rev, delta_val];
};

vjson.from_json = function(json, rev) {
	if (vjson.is_dict(json)) {
		var vjson_val = {};
		for (key in json) {
			vjson_val[key] = vjson.from_json(json[key], rev);
		}
		return [rev, vjson_val];
	}
	return [rev, json];
};

vjson.to_json = function(obj) {
	var vjson_val = obj[1];
	if (vjson.is_dict(vjson_val)) {
		var json = {};
		for (key in vjson_val) {
			json[key] = vjson.to_json(vjson_val[key]);				
		}
		return json;
	} else {
		// Only objects can be vjson-complex.
		return vjson_val;
	}
};
