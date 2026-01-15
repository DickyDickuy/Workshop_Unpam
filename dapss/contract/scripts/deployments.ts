import { viem } from "hardhat";
import Artifact from "../artifacts/contracts/simple-storage.sol/SimpleStorage.json";

async function main() {
  // 1. Ambil wallet client (Signer - yang bayar gas)
  const [walletClient] = await viem.getWalletClients();

  // 2. Ambil public client (Read-only - buat ngecek status transaksi)
  const publicClient = await viem.getPublicClient();

  console.log("Deploying with account:", walletClient.account.address);

  // 3. Proses Deploy Contract
  const hash = await walletClient.deployContract({
    abi: Artifact.abi,
    bytecode: Artifact.bytecode as `0x${string}`,
    args: [], // Masukkan argumen constructor di sini jika ada
  });

  console.log("Deployment tx hash:", hash);

  // 4. Tunggu konfirmasi blok (mining selesai)
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
  });

  console.log("✅ SimpleStorage deployed at:", receipt.contractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
