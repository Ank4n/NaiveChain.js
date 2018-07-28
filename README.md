# NaiveChain.js

NaiveChain.js is a naive implementation of blockchain without the consensus algorithm to demonstrate blockchain data model.

### Prerequisites

- Node
- npm
- crypto-js
- levelDB
- express



### Configuring your project

- Initialise project dependencies
```
npm i
```

## Running Web API service

1: Run node server locally on port 8000
```
node server.js
``` 

2: To add a block in the blockchain, use the endpoint 
```
POST /block
```  

with payload like

```
{"data" : "your message"}
```

3: To get a block at a given height, use the endpoint
```
GET /block/:height 
```

 
## Testing Blockchain data structure

To test code:
1: Open a command prompt or shell terminal after installing node.js.

2: Enter a node session, also known as REPL (Read-Evaluate-Print-Loop).
```
node
```
3: Load naiveChain.js code into your node session
```
.load naiveChain.js
```


4: Instantiate blockchain with blockchain variable
```
let blockchain = new Blockchain();
```
5: Generate 10 blocks using a for loop.. You have to wait for the db sync to complete before you can do this operation.
```
for (var i = 0; i <= 10; i++) {
  blockchain.addBlock(new Block("test data "+i));
}
```
6: Validate blockchain
```
blockchain.validateChain();
```
7: Induce errors by changing block data
```
let inducedErrorBlocks = [2,4,7];
for (var i = 0; i < inducedErrorBlocks.length; i++) {
  blockchain.chain.get(inducedErrorBlocks[i]).data='induced chain error';
}
```
8: Validate blockchain. The chain should now fail with blocks 2,4, and 7.
```
blockchain.validateChain();
```

9: Play more with the blockhain data model. Exit the node session when your are done.
```
.exit
```