import { Connection } from "@solana/web3.js";
import { switchBaseDecimals } from "../utils";

export const UNDERLYING_EXPONENT_MINT_DATA: {[exponentMint: string]: string} = {
    "8adRViFUNTe3yexj2gbQtx929zBJtWJRM8TeTzYbQBgx": "WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U",
    "FxT7bPGvkS5jKF2vgnJ16MciHqtsNqxbcWTfFg7L136h": "kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B",
    "6T1BRYFLs9H4wnwEYuqZfPs6bshAM9ZcaS976tDDGuD": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "Aby6y5DYtTrhQD8i7JXLs4H3jdUTwSXDraYqnwn5tKbt": "WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U",
    "CuP74kGMbkJqMt5qmTytuFPSi3kjRvnFgiPPrPcMUfxB": "kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B",
    "EyTuhyTjQvT7HfX1wtD6CrmysDRN9fj9iLjQLx6T5yMY": "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    "34hCAWvkVsiSK8np5fED1CjMhKVUved8DpbdGnWJuopc": "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    "6RweeuQgwR4h7MEYHNwjCEUmBCDntxM89XZb7PcGZCDp": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "8d3Gd3P4VwCWXCs1hHtDDXyEdv5rRcf6APDwmPvDMupX": "WFRGB49tP8CdKubqCdt5Spo2BdGS4BpgoinNER5TYUm",
    "6iVwqDcVqatTobV1Cf3A38Zgw8omDBqctbxDpYoBbpmo": "HnnGv3HrSqjRpgdFmx7vQGjntNEoex1SU4e9Lxcxuihz", // shyusd,
    "6nHhcyQ4oJHedRKhpTT24XqjioSG7g7y8LacZDtkCYKP": "hy1opf2bqRDwAxoktyWAj6f3UpeHcLydzEdKjMYGs2u", // hylosolplus
    "6tvabwb17ucuRS26VYAcijfoN2Chd1gy7PMrk6DiYCQ5": "5YMkXAYccHSGnHn9nob9xEvv6Pvka9DZWH7nTbotTu9E", // hyusd
    "7Z3ZVXxdQ59DAKKacva9DFjdiFGj7fGK5JA2h51xFR9J": "hy1oXYgrBW6PVcJ4s6s2FKavRdwgWTXdfE69AxT7kPT", // hylosol
    "AqSfXMdsQ99ioNB3VhHXYsKFQDMDVFooh9JNv8Ap4bC": "5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5" //onyc
};

export function getExponentTokenBalances(connection: Connection, balances: {[mint: string]: number}, decimalMap: Map<string, number>) {

    try {
        const exponentMintKeys = Object.keys(UNDERLYING_EXPONENT_MINT_DATA);
        for (const exponentMint of exponentMintKeys) {
            if (balances[exponentMint] !== undefined) {
                const exponentDecimals = decimalMap.get(exponentMint);
                const underlyingMint = UNDERLYING_EXPONENT_MINT_DATA[exponentMint];
                const underlyingDecimals = decimalMap.get(underlyingMint);
                if (exponentDecimals === undefined || underlyingDecimals === undefined) {
                    throw new Error(`Missing decimals for exponent mint: ${exponentMint} or underlying mint: ${underlyingMint}`);
                }
                const underlyingAmount = switchBaseDecimals(balances[exponentMint], exponentDecimals, underlyingDecimals);
                balances[underlyingMint] = (balances[underlyingMint] || 0) + underlyingAmount;
                delete balances[exponentMint];  
            }
        }
    } catch (error) {
        console.error("Error in getExponentTokenBalances:", error);
        // Gracefully fail and return the original balances
    }

    return balances;
}