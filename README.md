# clusterstore
Disk or server based clustering of objects supporting the Web Storage API

# Usage

`npm install clusterstore`


```
const ClusterStore = require("../index.js"),
	
	// normally started as separate process on another machine
	StoreServer = require("storeserver"),
	BlockStore = require("blockstore"),
	server = new StoreServer(new BlockStore("./test/data/remote")), 
	
	// things looking like paths with automatically create a BlockStore database
	// things looking like URLs will automatically create RemoteStore connections
	// alternativly, hand in pre-created instances of classes supporting an ansync version of the Web Storage API
	// replicate:<milliseconds> replicates all data to all nodes within <milliseconds>, 
	// if replicate missing, then data is sharded equally across nodes using a lexigraphic split on the last char of the keys
	storage = new ClusterStore(["./test/data/data1","http://localhost:3000"],{replicate:2500,clear:false}); 
	
// listen would not be necessary if server was really remote
server.listen(3000).then(() => {
	storage.set("myid",JSON.stringify({item:"test"}));
});
	
```


# Release History (reverse chronological order)

v0.0.2 2017-07-29 ALPHA Tested with `blockstore` locally and `remotestore` served up by `storeserver`.

v0.0.1 2017-07-29 ALPHA First public release
