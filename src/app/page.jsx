"use client"

import React, { useState } from "react";
import { getContract } from "./contract";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function App() {
  const router = useRouter()
  const [message, setMessage] = useState("");
  const [signer, setSigner] = useState("");
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tweetLoading, setTweetLoading] = useState(false);
  const [tweetText, setTweetText] = useState("");
  const [tweets, setTweets] = useState([]);
  const [maxTweetLength, setMaxTweetLength] = useState(0);
  const [likes, setLikes] = useState(0);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };

  // helper Function to fetch tweets for a given address after wallet connection
  const fetchTweetsForAddress = async (contractInstance, address) => {
    try {

      const maxTweetLength = await contractInstance.getTweetLength();
      // setMaxTweetLength(maxTweetLength);

      const allTweets = await contractInstance.getAllTweets(address);

      // Check if allTweets is an array and has content
      if (!Array.isArray(allTweets)) {
        console.error("getAllTweets didn't return an array:", allTweets);
        setMessage("Invalid response from contract");
        return;
      }

      // Convert the result to a more readable format
      const formattedTweets = allTweets.map((tweet, index) => {
        console.log(`Processing tweet ${index}:`, tweet);
        return {
          id: tweet.id.toString(),
          author: tweet.author,
          content: tweet.tweet,
          timestamp: new Date(Number(tweet.timestamp) * 1000).toLocaleString(),
          likes: tweet.likes.toString(),
          index: index
        };
      });

      setTweets(formattedTweets);

      if (formattedTweets.length === 0) {
        setMessage("Wallet connected! No tweets found. Create your first tweet!");
      } else {
        setMessage(`Wallet connected! Found ${formattedTweets.length} tweet(s)`);
      }

    } catch (err) {
      console.error("Error fetching tweets:", err);
    }
  };

  // Function to connect wallet and get address
  async function connectWallet() {
    setLoading(true);
    try {
      const { contract, signer } = await getContract();

      setSigner(signer);
      setContract(contract);
      setMessage("Wallet connected successfully!");
      await fetchTweetsForAddress(contract, signer);

    } catch (err) {
      setMessage(`Error connecting wallet: ${err.message}`);
    } finally {
      setLoading(false);
    }
  } 

  // Function to create a tweet
  async function createTweet() {
    setTweetLoading(true);
    try {
      const tx = await contract.createTweet(tweetText);

      const receipt = await tx.wait();

      setMessage('Tweet created successfully');
      setTweetText("");

      await fetchTweetsForAddress(contract, signer);

    } catch (err) {
      console.error("Error creating tweet:", err);
      setMessage(`Error creating tweet: ${err.message}`);
    } finally {
      setTweetLoading(false);
    }
  }

  // Function to fetch tweets for the connected address
  async function fetchTweets() {
    try {

      const allTweets = await contract.getAllTweets(signer);

      // Check if allTweets is an array and has content
      if (!Array.isArray(allTweets)) {
        console.error("getAllTweets didn't return an array:", allTweets);
        setMessage("Invalid response from contract");
        return;
      }

      // Convert the result to a more readable format
      const formattedTweets = allTweets.map((tweet, index) => {
        console.log(`Processing tweet ${index}:`, tweet);
        return {
          id: tweet.id.toString(),
          author: tweet.author,
          content: tweet.tweet,
          timestamp: new Date(Number(tweet.timestamp) * 1000).toLocaleString(),
          likes: tweet.likes.toString(),
          index: index
        };
      });

      setTweets(formattedTweets);

      if (formattedTweets.length === 0) {
        setMessage("No tweets found for this address. Create a tweet first!");
      } else {
        setMessage(`Found ${formattedTweets.length} tweet(s)`);
      }

    } catch (err) {
      console.error("Error fetching tweets:", err);
    }
  }

  // disconnect wallet function
  async function removeSigner() {
    try {
      await window.ethereum.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
      console.log("Signer and contract removed");
      window.location.reload();
    } catch (err) {
      console.log("Error removing signer and contract:", err);

    }
  }

  async function likeTweet(id, author) {
    // const author = signer;
    try {
      const tx = await contract.likeTweet(id, author);
      await tx.wait();
      toast.success('Tweet liked successfully');
      const AllLikes = await contract.getAllLikes(author);
      setLikes(AllLikes);

    } catch (err) {
      toast.error('Error liking tweet: ' + err.message);
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center p-4 gap-4">
      {!signer ? (
        <Button onClick={connectWallet} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className="w-full h-full flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <p>Connected: {signer}</p>
            <Button onClick={removeSigner}>Disconnect</Button>
          </div>

          <div className="w-full flex flex-col items-start gap-4">
            <textarea
              className="w-1/2 h-32 p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What's happening?"
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              maxLength={280}
            />

            <div className="flex items-center gap-4">
              <Button onClick={createTweet} disabled={tweetLoading || !tweetText.trim()} >
                {tweetLoading ? 'Tweeting...' : 'Tweet'}
              </Button>
              <span className="text-sm text-gray-500">
                {tweetText.length}/{maxTweetLength}
              </span>
            </div>
          </div>

          {/* Fetch tweets section */}
          <div className="w-full flex flex-col gap-4 mt-6">

            {/* Display tweets */}
            {tweets.length > 0 && (
              <div className="w-full">
                <h3 className="text-lg font-semibold mb-4">My Tweets ({tweets.length})</h3>
                <div className="space-y-4">
                  {tweets.map((tweet) => (
                    <div key={tweet.index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className=" text-end items-end mb-2">
                        <span className="text-xs text-gray-400">{new Date(tweet.timestamp).toLocaleDateString('en-US', options)}</span>
                      </div>
                      <p className="text-gray-800 mb-2">{tweet.content}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>By: {tweet.author.slice(0, 6)}...{tweet.author.slice(-4)}</span>
                        <span> {likes || tweet.likes} likes</span>
                        <Button className='bg-white hover:bg-white' size="sm" onClick={() => likeTweet(tweet.id, tweet.author)}>❤️</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status message */}
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md">
          <p className="text-sm">{message}</p>
        </div>
      )}
    </div>
  );
}

export default App;