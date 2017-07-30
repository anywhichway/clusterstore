const ClusterStore = require("../index.js"),
	StoreServer = require("storeserver"),
	BlockStore = require("blockstore"),
	server = new StoreServer(new BlockStore("./test/remote")),
	RemoteStore = require("remotestore"),
	remotestore = new RemoteStore("http://localhost:3000"),
	storage = new ClusterStore([remotestore],{clear:false}); //"./test/data1",

const keygen = (length) => {
		const base = Math.random()+"";
		return "k"+base.substring(2,length+1);
	};
	
server.listen(3000).then(async () => {
	const testsize = 10000, //000
	record = "1".padEnd(1024,"1"),
	maxkeysize = 8;
	for(let i=8;i<maxkeysize+1;i++) {
		console.log("Test Size:",testsize,"Key Size:",i);
		const keys = [];
		let start = Date.now();
		for(let k=0;k<testsize;k++) {
			const key = keys[k] = keygen(i);
			await storage.set(key,record);
		}
		let end = Date.now();
		console.log("Write Records Sec:", Math.round(testsize / ((end-start)/1000)));
		start = Date.now();
		for(let key of keys) {
			await storage.get(key);
		}
		end = Date.now();
		console.log("Uncached Read Records Sec:", Math.round(testsize / ((end-start)/1000)));
		start = Date.now();
		for(let key of keys) {
			await storage.get(key);
		}
		end = Date.now();
		console.log("Cached Read Records Sec:", Math.round(testsize / ((end-start)/1000)));
		//await storage.compress();
		//await storage.clear();
	}
});