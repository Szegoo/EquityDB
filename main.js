const PowergateIO = require('orbit-db-powergate-io')
 
const host = 'http://0.0.0.0:6002' // This is the default value
PowergateIO.create(host)
  .then((powergateio) => {
    console.log(powergateio.wallet) // Will be {} until funded
  })