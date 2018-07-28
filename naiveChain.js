/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);

// caching chain height
let chainHeight = 0;

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
    constructor(body) {
        this.hash = "",
            this.height = 0,
            this.body = body,
            this.time = 0,
            this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
    constructor() {
        Blockchain.addGenesisBlock();
        init();
    }

    static addGenesisBlock() {
        let genesisBlock = new Block("First block in the chain - Genesis block");
        // Block height
        genesisBlock.height = 0;
        // UTC timestamp
        genesisBlock.time = 0;
        // Block hash with SHA256 using newBlock and converting to a string
        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
        // Adding block object to chain
        addToDB(0, JSON.stringify(genesisBlock));
    }

    // Add new block
    async addBlock(data) {

        let newBlock = new Block("data");
        // Block height
        newBlock.height = chainHeight + 1;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (newBlock.height > 0) {
            let lastBlock = JSON.parse(await this.getBlock(chainHeight));
            newBlock.previousBlockHash = lastBlock.hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

        // Adding block object to chain
        await addToDB(newBlock.height, JSON.stringify(newBlock));
    }


    // Get block height
    getBlockHeight() {
        return chainHeight;
    }

    // get block
    async getBlock(height) {
        return await db.get(height)
            .catch(function (err) {
                console.error(err)
                return err;
            });
    }

    // validate block
    async validateBlock(blockHeight) {
        // get block object
        let block = JSON.parse(await this.getBlock(blockHeight));

        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            console.log('Block #' + blockHeight + ' has a valid hash');
            return true;
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain
    async validateChain() {
        let errorLog = [];
        for (var i = 0; i < chainHeight; i++) {
            // validate block
            if (!await this.validateBlock(i)) errorLog.push(i);
            // compare blocks hash link
            let blockHash = JSON.parse(await this.getBlock(i)).hash;
            let previousHash = JSON.parse(await this.getBlock(i + 1)).previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }

        // validating the last block
        let lastBlock = this.getBlockHeight();
        if (!(await this.validateBlock(lastBlock))) errorLog.push(lastBlock);

        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }

}

function init() {
    let i = 0;
    db.createReadStream().on('data', function (data) {
        i++;
    }).on('error', function (err) {
        return console.log('Unable to read data stream!', err)
    }).on('close', function () {
        // height starts from 0
        chainHeight = i - 1;
        // add genesis block if this is the first transaction
        console.log('Blockchain initialized with height ' + (i - 1));
    });
}

async function addToDB(key, value) {
    return db.put(key, value)
        .then(function () {
            console.log("Block added successfully at " + key);
            chainHeight++
        })
        .catch(function (err) {
            console.error('Block ' + key + ' submission failed', err)
        })
}


module.exports = Blockchain;
