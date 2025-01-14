import Web3 from "web3";
import approve from "./approve.js";
import superchainABI from "./superchainABI.js";

// BUILD WITH SUPERCHAIN BY OPTIMISM 

const veloDrome = async (privatekey) => {
    const web3 = new Web3('https://rpc.api.lisk.com'); // Gunakan RPC yang benar
    const account = web3.eth.accounts.privateKeyToAccount(privatekey);
    web3.eth.accounts.wallet.add(account);

    const addressWithoutPrefix = account.address.replace(/^0x/, "").toLowerCase();
    const superchainContract = '0x652e53C6a4FE39B6B30426d9c96376a105C89A95';
    const arg0 = '0x000c';
    const inputs = [
        "0x000000000000000000000000652e53c6a4fe39b6b30426d9c96376a105c89a950000000000000000000000000000000000000000000000000000000000002328000000000000000000000000000000000000000000000000000002770d13984400000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b05d032ac25d322df992303dca074ee7392c117b90000644200000000000000000000000000000000000006000000000000000000000000000000000000000000",
        `0x000000000000000000000000${addressWithoutPrefix}000000000000000000000000000000000000000000000000000002770d139844`
    ]
    const amount = web3.utils.toWei('0', 'ether')

    try {
        const usdtapp = await approve(privatekey);
        if (usdtapp === false) {
            return `Error to approve optimismUSDT`;
        }

        const contract = new web3.eth.Contract(superchainABI, superchainContract);
        const data = contract.methods.execute(arg0, inputs).encodeABI();

        const gasEstimate = await web3.eth.estimateGas({
            from: account.address,
            to: superchainContract,
            value: amount,
            data: data,
        });

        const gwei = 0.03
        const gasPrice = await web3.eth.getGasPrice();

        const tx = {
            from: account.address,
            to: superchainContract,
            data: data,
            value: amount,
            nonce: await web3.eth.getTransactionCount(account.address, 'pending'),
            gas: gasEstimate,
            gasPrice: gasPrice,
        };

        const receipt = await web3.eth.accounts.signTransaction(tx, privatekey);
        const txHash = await web3.eth.sendSignedTransaction(receipt.rawTransaction);
        return txHash.logs[0].transactionHash
   } catch (error) {
      return error
   }

}

export default veloDrome