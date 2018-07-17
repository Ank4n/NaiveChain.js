/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const level = require('level');
const chainDB = './chaindata';
const db = level(chainDB);
let initialized = false;

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
        this.chain = new Map();
        sync(this.chain);
    }

    addGenesisBlock() {
        let genesisBlock = new Block("First block in the chain - Genesis block");
        // Block height
        genesisBlock.height = 0;
        // UTC timestamp
        genesisBlock.time = 0;
        // Block hash with SHA256 using newBlock and converting to a string
        genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
        // Adding block object to chain
        this.chain.set(0, genesisBlock);
        addToDB(genesisBlock.height, JSON.stringify(genesisBlock));
    }

    // Add new block
    addBlock(newBlock) {

        if (!initialized) {
            return console.log("Blockchain is initialising, try this operation again!")
        }

        // add genesis block if this is the first transaction
        if (this.chain.size === 0) this.addGenesisBlock();
        // Block height
        newBlock.height = this.chain.size;
        // UTC timestamp
        newBlock.time = new Date().getTime().toString().slice(0, -3);
        // previous block hash
        if (this.chain.size > 0) {
            newBlock.previousBlockHash = this.chain.get(this.chain.size - 1).hash;
        }
        // Block hash with SHA256 using newBlock and converting to a string
        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
        // Adding block object to chain
        this.chain.set(newBlock.height, newBlock);
        addToDB(newBlock.height, JSON.stringify(newBlock));
    }

    // Get block height
    getBlockHeight() {
        return this.chain.size - 1;
    }

    // get block
    getBlock(blockHeight) {
        // return object as a single string
        return JSON.parse(JSON.stringify(this.chain.get(blockHeight)));
    }

    // validate block
    validateBlock(blockHeight) {
        // get block object
        let block = this.getBlock(blockHeight);
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash === validBlockHash) {
            return true;
        } else {
            console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
            return false;
        }
    }

    // Validate blockchain
    validateChain() {
        let errorLog = [];
        for (var i = 0; i < this.chain.size - 1; i++) {
            // validate block
            if (!this.validateBlock(i)) errorLog.push(i);
            // compare blocks hash link
            let blockHash = this.chain.get(i).hash;
            let previousHash = this.chain.get(i + 1).previousBlockHash;
            if (blockHash !== previousHash) {
                errorLog.push(i);
            }
        }

        // validating the last block
        let lastBlock = this.getBlockHeight();
        if (!this.validateBlock(lastBlock)) errorLog.push(lastBlock);

        if (errorLog.length > 0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: ' + errorLog);
        } else {
            console.log('No errors detected');
        }
    }

}

function sync(chain) {
    db.createReadStream().on('data', function (data) {
        chain.set(parseInt(data.key), JSON.parse(data.value));
    }).on('error', function (err) {
        return console.log('Unable to read data stream!', err)
    }).on('close', function () {
        console.log('db initialized');
        initialized = true;
    });
}

function addToDB(key, value) {
    db.put(key, value, function (err) {
        if (err) return console.log('Block ' + key + ' submission failed', err);
    })
}