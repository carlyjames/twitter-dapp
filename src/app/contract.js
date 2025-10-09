import { ethers } from "ethers";
import contractABI from "../abi/MyContract.json";
import { toast } from "sonner";

const contractAddress = "0x1EB889279FC134edf68B0bA81da78B5B0Bd64b33"; 

export async function connectWallet() {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (accounts.length === 0) {
      toast.error('No accounts found. Please connect your wallet.');
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    toast.success('Wallet connected');

    return {  
      signer: signerAddress,
      provider
    };
  } catch (error) {
    // toast.error('Error connecting wallet: ' + error.message);
  }
}

// Function to get contract instance (requires wallet to be connected)
export async function getContract() {
  try {
    // First connect the wallet
    const { provider } = await connectWallet();
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    // Validate contract address
    if (!contractAddress || !ethers.isAddress(contractAddress)) {
      throw new Error('Invalid contract address');
    }

    // Validate ABI
    if (!contractABI || contractABI.length === 0) {
      throw new Error('Contract ABI not found or empty');
    }

    // Create contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    return {
      contract,
      signer: signerAddress,
      provider
    };
  } catch (error) {
    console.error('Error in getContract:', error);
    throw error;
  }
}

// Function to check if wallet is connected
export async function isWalletConnected() {
  try {
    if (typeof window.ethereum === 'undefined') {
      return false;
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    return accounts.length > 0;
  } catch (error) {
    console.error('Error checking wallet connection:', error);
    return false;
  }
}

// Function to get current account without requesting connection
export async function getCurrentAccount() {
  try {
    if (typeof window.ethereum === 'undefined') {
      return null;
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });

    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
}