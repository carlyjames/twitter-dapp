import { ethers } from "ethers";
import contractABI from "../abi/MyContract.json";

const contractAddress = "0xdeC0075921c7A46Ea0a40D9a318946f4f2C61f4b"; 

export async function getContract() {
  if (!window.ethereum) throw new Error("MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI, signer);
}
