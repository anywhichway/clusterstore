const ClusterStore = require("../index.js"),
	StoreServer = require("storeserver"),
	BlockStore = require("blockstore"),
	server = new StoreServer(new BlockStore("./test/data/remote")),
	storage = new ClusterStore(["./test/data/data1","http://localhost:3000"],{clear:false}); 

const keygen = (length) => {
		const base = Math.random()+"";
		return "k"+base.substring(2,length+1);
	};
	
server.listen(3000).then(async () => {
	const testsize = 1750, //000
	record = "1".padEnd(1024,"1"),
	maxkeysize = 8;
	for(let i=8;i<maxkeysize+1;i++) {
		console.log("Test Size:",testsize,"Key Size:",i);
		const promises = [],
			keys = [],
			start = Date.now();
		for(let k=0;k<testsize;k++) {
			const key = keys[k] = keygen(i);
			promises.push(storage.set(key,record));
		}
		const end = Date.now();
		console.log("Dispatch Records Sec:", Math.round(testsize / ((end-start)/1000)));
		Promise.all(promises).then(() => {
			const end = Date.now();
			console.log("Write Records Sec:", Math.round(testsize / ((end-start)/1000)));
		});
		//await storage.compress();
		//await storage.clear();
	}
});