const PowergateIO = require('orbit-db-powergate-io');
const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

class Client {
	async create () {
		const ipfs = await IPFS.create({repo: './ipfs'})
		this.orbitdb = await OrbitDB.createInstance(ipfs)
		let powergateio = await PowergateIO.create('http://0.0.0.0:6002');
		const addresses = (await powergateio.ipfs.id()).addresses;

		await IPFS.swarm.connect(addresses[0].toString());

		this.options = { 
			accessController: {
				//giving the creator the write access
				write: [this.orbitdb.identity.id]
			},
			replicate: true
		}
		this.employees = await this.orbitdb.keyvalue('employees',
		this.options);
		this.dbAddress = employees.address;
	}
	async addEmployee(address, email, backup) {
		const existingEmployee = await this.getEmployeeByAddress(address);
		if(typeof existingEmployee !== typeof undefined) return;
		await this.cloneDB();
		await this.employees.put(address, {email, backup});
		let jobStatus = await powergateio.storeSnapshot(employees.address.toString());
		console.log(jobStatus);
	}
	async getEmployeeByAddress(address) {
		await this.cloneDB();
		const email = await this.employees.get(address);
		return email;
	}
	async cloneDB() {
		this.ipfs = await IPFS.create({repo: './ipfs'});
		this.orbitdb = await OrbitDB.createInstance(ipfs)
		this.powergateio = await PowergateIO.create('http://0.0.0.0:6002');

		const addresses = (await powergateio.ipfs.id()).addresses
  		await ipfs.swarm.connect(addresses[0].toString())

		this.employees = await orbitdb.open(this.dbAddress, { create: true })
		const snapshot = await powergateio.retrieveSnapshot(this.dbAddress);
		//should load the data into the database
	}
}

try {
	runTest();
}catch(err) {
	console.log(err);
}

async function runTest() {
	const client = new Client();
	await client.create();
	await client.addEmployee('abcd', 'marko@bloxico.com', "marko@gmail.com");
	//it will not allow me to edit the employee data
	await client.addEmployee('abcd', 'milan@bloxico.com', "marko@gmail.com");
	const employee = await client.getEmployeeByAddress('abcd');
	console.log(employee);
}