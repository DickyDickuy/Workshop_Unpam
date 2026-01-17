// frontend/my-app/services/blockchain.service.ts

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Cek apakah URL backend sudah diset
if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL belum diset di .env.local!");
}

export async function getBlockchainValue() {
  try {
    const res = await fetch(`${BACKEND_URL}/blockchain/value`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Error fetching value: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Gagal mengambil blockchain value:", error);
    throw error;
  }
}

export async function getBlockchainEvents() {
  try {
    const res = await fetch(`${BACKEND_URL}/blockchain/events`, {
      method: "POST", // Pakai POST karena kirim Body
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        fromBlock: 0,
        toBlock: 0,
      }),
    });

    if (!res.ok) {
      throw new Error(`Error fetching events: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Gagal mengambil blockchain events:", error);
    return [];
  }
}
