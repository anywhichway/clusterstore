const ClusterStore = require("../index.js"),
	storage = new ClusterStore(["./test/data1"],{clear:false}),
	expect = require("chai").expect;

describe("tests",function() {
	it("should set, get, delete, set, compress",done => {
		storage.set("testid1","test data").then(() => {
			storage.get("testid1").then(data => {
				expect(data.toString()).to.equal("test data");
				storage.delete("testid1").then(result => {
					expect(result).to.equal(true);
					storage.get("testid1").then(data => {
						expect(data).to.equal(undefined);
						storage.set("testid1","longer test data").then( async () => {
							const stats = await storage.compress();
							done();
						});
					});
				});
			});
		});
	});
});