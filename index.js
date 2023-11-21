export const eventNames = {
    funded: "Funded",
    withdrawn: "Withdrawn",
    cheaperWithdrawn: "CheaperWithdrawn",
    minimumUSDChanged: "MinimumUSDChanged",
};

import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
const updateMinimumButton = document.getElementById("updateMinimumButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
updateMinimumButton.onclick = updateMinimumUSD;

console.log(ethers);

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        connectButton.innerHTML = "Connected";
        subscribeToEvents();
    } else {
        connectButton.innerHTML = "Please Install MetaMask";
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const balance = await provider.getBalance(contractAddress);
        console.log(ethers.utils.formatEther(balance));
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done");
        } catch (error) {
            console.log(error);
        }
    }
}
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `completed with ${transactionReceipt.confirmations} confirmations`
            );
            resolve();
        });
    });
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log(error);
        }
    }
}

async function updateMinimumUSD() {
    const newMinimum = document.getElementById("newMinimum").value; // Get the new minimum value from the input field
    console.log(`Updating minimum USD to ${newMinimum}`);
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.updateMinimumUSD(
                newMinimum
            );
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done");
        } catch (error) {
            console.log(error);
        }
    }
}
async function subscribeToEvents() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(contractAddress, abi, provider);

        contract.on(eventNames.funded, (funder, amount) => {
            console.log(`Funded event: Funder: ${funder}, Amount: ${amount}`);
        });

        contract.on(eventNames.withdrawn, (owner, amount) => {
            console.log(`Withdrawn event: Owner: ${owner}, Amount: ${amount}`);
        });

        contract.on(eventNames.minimumUSDChanged, (owner, newMinimum) => {
            console.log(
                `MinimumUSDChanged event: Owner: ${owner}, New Minimum: ${newMinimum}`
            );
        });
    }
}
