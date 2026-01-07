import { Connection } from "@solana/web3.js";

// FLP.1 has DeFi Llama Feed
const FLP_MINT_TO_POOL_MAP: {[pool: string]: string} = {
    "KwhpybQPe9xuZFmAfcjLHj3ukownWex1ratyascAC1X": "AbVzeRUss8QJYzv2WDizDJ2RtsD1jkVyRjNdAzX94JhG", // FLP.2
    "D6bfytnxoZBSzJM7fcixg5sgWJ2hj8SbwkPvb2r8XpbH":"4PZTRNrHnxWBqLRvX5nuE6m1cNR8RqB4kWvVYjDkMd2H", // FLP.3
    "6HukhSeVVLQekKaGJYkwztBacjhKLKywVPrmcvccaYMz":"EngqvevoQ8yaNdtxY7sSh5J7NF74k3cDKi9v9pHi5H3B", // FLP.4
    "AKqWYgwiM198BsvuSqWQs1x5FSVRJfo8MNABEQjzsDJk":"9ihKZHm484XTwroZZYac2qMzpo1mGhWXHcaKGACB71U7" // FLP.r
};

type FlashResponse = {
    pools: {
        poolAddress: string,
        flpPrice: string,
    }[],
}

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function getUsdcBalanceOfFlp(connection: Connection, balances: {[mint: string]: number}, decimalMap: Map<string, number>) {

    try {
        const flashRequest = "https://dxjms0h859jb3.cloudfront.net/earn-page/data";

        const response = await fetch(flashRequest);
        if (!response.ok) {
            throw new Error(`Failed to fetch flash data: ${response.status} ${response.statusText}`);
        }
    
        const flashhResponse: FlashResponse = await response.json();
        const flashPriceData = flashhResponse.pools;
        if (!flashPriceData) {
            throw new Error(`No prices found for Flash`);
        }

        for(let i = 0; i < flashPriceData.length; i++) {
            const poolAddress = flashPriceData[i].poolAddress;
            const poolPrice = parseFloat(flashPriceData[i].flpPrice);

            const tokenMint = FLP_MINT_TO_POOL_MAP[poolAddress];
            if (tokenMint !== undefined) {
                const tokenBalance = balances[tokenMint];
                if (tokenBalance !== undefined) {
                    const usdcAmount = tokenBalance * poolPrice; // USDC and FLP.x all have 6 decimals so 1/1 conversion
                    balances[USDC_MINT] = (balances[USDC_MINT] || 0) + usdcAmount;
                    delete balances[tokenMint]; 
                }
            }
        }
    } catch (error) {
        console.error("Error in xsol balance fetch:", error);
        // Gracefully fail and return the original balances
    }

    return balances;
}

export async function getUsdcBalanceOfFlpBn(connection: Connection, balances: {[mint: string]: bigint}, decimalMap: Map<string, number>) {

    try {
        const flashRequest = "https://dxjms0h859jb3.cloudfront.net/earn-page/data";

        const response = await fetch(flashRequest);
        if (!response.ok) {
            throw new Error(`Failed to fetch flash data: ${response.status} ${response.statusText}`);
        }
    
        const flashhResponse: FlashResponse = await response.json();
        const flashPriceData = flashhResponse.pools;
        if (!flashPriceData) {
            throw new Error(`No prices found for Flash`);
        }

        for(let i = 0; i < flashPriceData.length; i++) {
            const poolAddress = flashPriceData[i].poolAddress;
            const poolPrice = parseFloat(flashPriceData[i].flpPrice);

            const tokenMint = FLP_MINT_TO_POOL_MAP[poolAddress];
            if (tokenMint !== undefined) {
                const tokenBalance = parseInt(balances[tokenMint].toString());
                if (tokenBalance !== undefined) {
                    const usdcAmount = BigInt((tokenBalance * poolPrice).toFixed(0)); // In Lamports
                    balances[USDC_MINT] = (balances[USDC_MINT] || 0n) + usdcAmount;
                    delete balances[tokenMint]; 
                }
            }
        }
    } catch (error) {
        console.error("Error in xsol balance fetch:", error);
        // Gracefully fail and return the original balances
    }

    return balances;
}