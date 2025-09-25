"use client"

import React, { useState } from "react";
import { getContract } from "./contract";
import Button from '../components/ui/button'

function App() {
  const [message, setMessage] = useState("");

  async function callContract() {
    try {
      const contract = await getContract();
      const value = await contract.createTweet("Hello, blockchain!"); 
      setMessage(value.toString());
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div>
      <Button onClick={callContract}>Call Contract</Button>
      <p>Result: {message}</p>
    </div>
  );
}

export default App;
