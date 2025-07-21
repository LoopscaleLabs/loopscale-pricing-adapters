import { BN } from '@coral-xyz/anchor';
import AmmImpl from '@mercurial-finance/dynamic-amm-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
import { switchBaseDecimals } from '../utils';

export const UNDERLYING_METEORA_MINT_DATA: {[mint: string]: {
    pool: string,
    outMint: string,
}} = {
    "xLebAypjbaQ9tmxUKHV6DZU4mY8ATAAP2sfkNNQLXjf": {
        pool: "32D4zRxNc1EssbJieVHfPhZM3rH6CzfUPrWUuWxD9prG",
        outMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    }
}

async function getMeteoraPool(connection: Connection, pool: string) {
  const amm = await AmmImpl.create(connection, new PublicKey(pool));
  return amm;
}

export async function getMeteoraTokenBalances(connection: Connection, balances: {[mint: string]: number}, decimalMap: Map<string, number>) {
    try {
        const meteoraMintKeys = Object.keys(UNDERLYING_METEORA_MINT_DATA);
        for (const metMint of meteoraMintKeys) {
            if (balances[metMint] !== undefined) {
                const poolData = UNDERLYING_METEORA_MINT_DATA[metMint];
                const pool = poolData.pool;
                const outMint = poolData.outMint;
                const poolDecimals = decimalMap.get(metMint);
                const outMintDecimals = decimalMap.get(outMint);
                if (poolDecimals === undefined || outMintDecimals === undefined) {
                    throw new Error(`Missing decimals for exponent mint: ${poolDecimals} or underlying mint: ${outMintDecimals}`);
                }
                const amm = await getMeteoraPool(connection, pool);
                const quoteInput = 1_000_000;
                const quote = amm.getWithdrawQuote(
                    new BN(quoteInput),
                    0,
                    new PublicKey(outMint),
                );
                const scalar = quote.tokenAOutAmount.toNumber() / quoteInput;
                const scaledOutAmount = switchBaseDecimals(balances[metMint] * scalar, poolDecimals, outMintDecimals);

                balances[outMint] = (balances[outMint] || 0) + scaledOutAmount;
                delete balances[metMint];  
            }
        }
    } catch (error) {
        console.error("Error in getMeteoraTokenBalances:", error);
        // Gracefully fail and return the original balances
    }

    return balances;
}