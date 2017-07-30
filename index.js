(function() {
	"use strict";

	function ClusterStore(stores,options={replicate:false,clear:false,encoding:"utf8",cache:true,compress:{keys:true,data:false}}) {
		this.stores = [];
		this.options = Object.assign({},options);
		for(let store of stores) {
			const type = typeof(store);
			if(store && type==="object") {
				this.stores.push(store);
			} else if(type==="string") {
				if(store.indexOf("http")===0) {
					const RemoteStore = require("remotestore");
					this.stores.push(new RemoteStore(store,options));
				} else {
					const BlockStore = require("blockstore");
					this.stores.push(new BlockStore(store,options));
				}
			}
		}
	}
	ClusterStore.prototype.clear = async function() {
		for(let store of this.stores) {
			await store.clear();
		}
	}
	ClusterStore.prototype.close = async function() {
		for(let store of this.stores) {
			await store.close();
		}
	}
	ClusterStore.prototype.count = async function() {
		let count = 0;
		for(let store of this.stores) {
			count += await store.count();
		}
		return count;
	}
	ClusterStore.prototype.compress = async function() {
		for(let store of this.stores) {
			await store.compress();
		}
	}
	ClusterStore.prototype.delete = async function(id) {
		const primaryStore = await this.getKeyStore(id);
		return primaryStore.delete(id).then((result) => {
			if(this.options.replicate) {
				for(let store of this.stores) {
					if(store!==primaryStore) {
						store.delete(id);
					}
				}
			}
			return result;
		});
	}
	ClusterStore.prototype.removeItem = ClusterStore.prototype.delete;
	ClusterStore.prototype.flush = async function(id) {
		if(!id) {
			for(let store of this.stores) {
				await store.flush();
			}
			return;
		}
	}
	ClusterStore.prototype.forEachKey = async function(f) {
		for(let store of this.stores) {
			const count = await store.count();
			for(let i=0;i<count;i++) {
				await f.call(store,await store.key(i));
			}
		}
	}
	ClusterStore.prototype.get = async function(id) {
		const primaryStore = await this.getKeyStore(id);
		return primaryStore.get(id).then(async (result) => {
			if(!result && this.options.replicate) {
				for(let store of this.stores) {
					if(store!==primaryStore) {
						result = await store.get(id);
					}
					if(result) {
						break;
					}
				}
			}
			return result;
		});
	}
	ClusterStore.prototype.getItem = ClusterStore.prototype.get;
	ClusterStore.prototype.getKeyStore = async function(id) {
		const charcode = id.charCodeAt(id.length-1),
			index = Math.trunc(charcode % this.stores.length);
		return this.stores[index];	
	}
	ClusterStore.prototype.key = async function(number) {
		let count = 0, previous = 0;
		for(let store of this.stores) {
			count += await store.count();
			if(number<=count && number>=previous) {
				return await store.key(number - count);
			}
		}
	}
	ClusterStore.prototype.open = async function(readOnly) {
		for(let store of this.stores) {
			await store.open(readOnly);
		}
	}
	ClusterStore.prototype.set = async function(id,data) {
		const primaryStore = await this.getKeyStore(id);
		return primaryStore.set(id,data).then(() => {
			if(this.options.replicate) {
				const delay = (typeof(this.options.replicate)==="number" ? this.options.replicate : 250);
				for(let store of this.stores) {
					if(store!==primaryStore) {
						setTimeout(() => store.set(id,data),delay);
					}
				}
			}
		});
	}
	ClusterStore.prototype.setItem = ClusterStore.prototype.set;
	module.exports = ClusterStore;
}).call(this);