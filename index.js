class Node {
	constructor (Ipfs, OrbitDB) {
		this.Ipfs = Ipfs;
		this.OrbitDB = OrbitDB;
	}
	async create() {
		this.node = await this.Ipfs.create({
			preload: {enabled: true},
			repo: './ipfs',
			EXPERIMENTAL: {pubsub: true},
		})
		await this._init();
	}
	async _init () {
		this.orbitdb = await this.OrbitDB.createInstance(this.node)
		this.options = { 
			accessController: {
				//giving the creator the write access
				write: [this.orbitdb.identity.id]
			},
			replicate: true
		}
		this.employees = await this.orbitdb.keyvalue('employees',
		this.options);
	}
	async addEmployee(address, email, backup) {
		const existingEmployee = await this.getEmployeeByAddress(address);
		if(typeof existingEmployee !== typeof undefined) return;
		await this.employees.put(address, {email, backup});
	}
	async getEmployeeByAddress(address) {
		const email = await this.employees.get(address);
		return email;
	}
}

try {
	runTest();
}catch(err) {
	console.log(err);
}

async function runTest() {
	const IPFS = require('ipfs');
	const OrbitDB = require('orbit-db');

	const node = new Node(IPFS, OrbitDB);
	await node.create();
	await node.addEmployee('abcd', 'marko@bloxico.com', "marko@gmail.com");
	//it will not allow me to edit the employee data
	await node.addEmployee('abcd', 'milan@bloxico.com', "marko@gmail.com");
	const employee = await node.getEmployeeByAddress('abcd');
	console.log(employee);
}