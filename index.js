import Web3 from "web3";
import fs from 'fs/promises'
import figlet from "figlet";
import chalk from "chalk";
import swapABI from "./abi.js";
import veloDrome from "./DAPPS/Velodrome/index.js";

// INCLUDE OKUTRADE SWAP , SOME DAPPS CHECK TO FOLDER DAPPS 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const displayBanner = () => {
    console.log(chalk.cyan(figlet.textSync('Makmum Airdrop', {
      font: 'Slant',
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true
    })));
    const superchain = chalk.bgRed('Superchain OPTIMISM')
    console.log(chalk.white(`Build on ${superchain}`))
    console.log('https://t.me/makmum')
  };


const swapUsdt = async (privatekey) => {
    const web3 = new Web3('https://rpc.api.lisk.com')
    const account = web3.eth.accounts.privateKeyToAccount(privatekey)
    web3.eth.accounts.wallet.add(account)
    console.log(`Wallet address ${account.address} to do swap`)
    const addressWithoutPrefix = account.address.replace(/^0x/, "");
    const contractAdress = '0x447B8E40B0CdA8e55F405C86bC635D02d0540aB8'
    const contract = new web3.eth.Contract(swapABI, contractAdress);
    const bytes = "0x0b010c"
    const amount = web3.utils.toWei('0.000026142121358787', 'ether')
    const inputs = [
        "0x0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000017c6afdb75c3",
        `0x000000000000000000000000${addressWithoutPrefix}00000000000000000000000000000000000000000000000000000000000186a0000000000000000000000000000000000000000000000000000017c6afdb75c300000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002b05d032ac25d322df992303dca074ee7392c117b9000bb84200000000000000000000000000000000000006000000000000000000000000000000000000000000`,
        `0x000000000000000000000000${addressWithoutPrefix}0000000000000000000000000000000000000000000000000000000000000000`
    ]
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10
    const data = contract.methods.execute(bytes, inputs, deadline ).encodeABI()

    const gasEstimate = await web3.eth.estimateGas({
        from: account.address,
        to: contractAdress,
        value: amount,
        data: data
    })


    const tx = {
        from: account.address,
        to: contractAdress,
        value: amount,
        data: data,
        nonce: await web3.eth.getTransactionCount(account.address),
        gas: gasEstimate,
        gasPrice: await web3.eth.getGasPrice(),
    }

    const receipt = await web3.eth.accounts.signTransaction(tx, privatekey)
    const txHash = await web3.eth.sendSignedTransaction(receipt.rawTransaction)
    return txHash.logs[0].transactionHash
    
}

const main = async () => {
    displayBanner()
    const wallet = (await fs.readFile('wallet.txt', 'utf-8'))
    .replace(/\r/g, "")
    .split('\n')
    .filter(Boolean);
  
    while(true) {
        for (let i = 0; i < wallet.length; i++) {
            try {
            const privatekey = wallet[i]
            const formattedPrivateKey = privatekey.startsWith('0x') ? privatekey : '0x' + privatekey;
            const getOku = await swapUsdt(formattedPrivateKey)
            const getVelodrome = await veloDrome(formattedPrivateKey)
            console.log(chalk.green(`Successfully swap eth to usd in okutrade, tx hash https://blockscout.lisk.com/tx/${getOku}`))
            console.log(chalk.white(`Success swap usdt to eth on Velodrome build on ${chalk.bgRed("Superchain OPTIMISM")} : https://thesuperscan.io/tx/${getVelodrome}`))
            } catch (error) {
               console.log(`Error Swap , idont know `) 
               console.log(`Detail : ${error}`)   
            }
        }
        console.log(chalk.blue('Menunggu 24 jam sebelum Swap berikutnya...'));
        await delay(86400000);
    }
}

main()