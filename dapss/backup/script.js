const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");
const errorEl = document.getElementById("error");

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

let isConnected = false;

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  console.log({ balance });
  return (balance / 1e18).toFixed(4);
}

function shortenAddress(address) {
  if (!address) return "-";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function showError(message) {
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
    setTimeout(() => {
      errorEl.style.display = "none";
    }, 5000);
  }
}

function hideError() {
  if (errorEl) {
    errorEl.style.display = "none";
  }
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    showError("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  console.log("window.ethereum", window.ethereum);

  try {
    hideError();
    statusEl.textContent = "Connecting...";

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];
    addressEl.textContent = shortenAddress(address);
    addressEl.title = address; // Show full address on hover

    console.log({ address });

    // Get chainId
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    console.log({ chainId });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected";
      statusEl.style.color = "#4cd137";

      // Get AVAX balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      console.log({ balanceWei });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
      
      // Disable button after successful connection
      isConnected = true;
      connectBtn.disabled = true;
      connectBtn.textContent = "Connected";
      connectBtn.style.opacity = "0.6";
      connectBtn.style.cursor = "not-allowed";
    } else {
      networkEl.textContent = "Wrong Network";
      statusEl.textContent = "Please switch to Avalanche Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
      showError("Wrong network! Please switch to Avalanche Fuji Testnet.");
      
      // Ensure button is enabled for retry
      isConnected = false;
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect Wallet";
      connectBtn.style.opacity = "1";
      connectBtn.style.cursor = "pointer";
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed";
    statusEl.style.color = "#e74c3c";
    
    if (error.code === 4001) {
      showError("Connection rejected by user.");
    } else if (error.code === -32002) {
      showError("Connection request already pending. Please check your wallet.");
    } else {
      showError(`Error: ${error.message || "Connection failed"}`);
    }
  }
}

async function updateWalletInfo(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    addressEl.textContent = "-";
    addressEl.title = "";
    balanceEl.textContent = "-";
    statusEl.textContent = "Not Connected";
    statusEl.style.color = "#00ff00";
    networkEl.textContent = "-";
    isConnected = false;
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
    connectBtn.style.opacity = "1";
    connectBtn.style.cursor = "pointer";
    showError("Wallet disconnected.");
    return;
  }

  const address = accounts[0];
  addressEl.textContent = shortenAddress(address);
  addressEl.title = address;

  const chainId = await window.ethereum.request({
    method: "eth_chainId",
  });

  if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
    const balanceWei = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    });
    balanceEl.textContent = formatAvaxBalance(balanceWei);
    statusEl.textContent = "Connected";
    statusEl.style.color = "#4cd137";
    networkEl.textContent = "Avalanche Fuji Testnet";
    hideError();
  } else {
    networkEl.textContent = "Wrong Network";
    statusEl.textContent = "Please switch to Avalanche Fuji";
    statusEl.style.color = "#fbc531";
    balanceEl.textContent = "-";
    showError("Wrong network! Please switch to Avalanche Fuji Testnet.");
  }
}

// Event listener for account changes
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    console.log("Account changed:", accounts);
    updateWalletInfo(accounts);
  });

  window.ethereum.on("chainChanged", async (chainId) => {
    console.log("Chain changed:", chainId);
    
    // Refresh wallet info without reloading page
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    updateWalletInfo(accounts);
  });
}

connectBtn.addEventListener("click", connectWallet);