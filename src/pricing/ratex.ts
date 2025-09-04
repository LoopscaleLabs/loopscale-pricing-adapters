import { Connection } from "@solana/web3.js";
import { switchBaseDecimals } from "../utils";

export const UNDERLYING_RATEX_MINT_DATA: {[exponentMint: string]: string} = {
    "nzjiFvnfhU1C7p2WrH44ap9peywJqNFpZDDK2N2NZ5w": "WFRGB49tP8CdKubqCdt5Spo2BdGS4BpgoinNER5TYUm",
    "E21wktAmr1L1Rtp1PJrLoG5BmcSoxdLkBcxBroXkDFAc": "WFRGB49tP8CdKubqCdt5Spo2BdGS4BpgoinNER5TYUm",
    "CAb6jxHAG4nf1A9iqxq13rvPDXuLjePS3ySceVpPkH98": "WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U",
    "2qwUBG181wtExip2zmE9DitEt1FieWgWsnReeAsA2rHw": "WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U",
    "H6j2ShQNXieBh5rpH2Er7NEwPenzT7Z1sXTe7Z9gbCtQ": "59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw",
    "AfC9nF128ZfRJrjbuipoiHuZVFvKTWNBMY53oW8PbFNy": "59obFNBzyTBGowrkif5uK7ojS58vsuWz3ZCvg6tfZAGw",
    "9u4L9adN74QT8mF1NffTKybgZeL87LtzQ81djiPDZ9fH": "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    "EJGt7pmcxugyLpEiqoR6tv4jESCPV4atqoeCtiVadeqz": "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    "5Xbc27QAWa5v2SQKqM4rteoPyyEJ43FwEj1yH6iEnhR7": "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    "F3GhNdzjguv1gkh5ZN8DGTydkHJ4gDjokQkeMg6u97mu": "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6",
    "67GnjhPJJ8vY18mwFqp8Nm1DuYwva9Yuj8CC2udFn2Z2": "YUYAiJo8KVbnc6Fb6h3MnH2VGND4uGWDH4iLnw7DLEu",
    "upkimiQcDJKbD2k2atEzAYzZAmANGdAf33qAAvmmAjV": "kySo1nETpsZE2NWe5vj2C64mPSciH1SppmHb4XieQ7B",
    "HAk9AHsSguyHxvbM16yYa7weQzFtfNVH9ohuQRmLs2v1": "Eh6XEPhSwoLv5wFApukmnaVSHQ6sAnoD9BmgmwQoN2sN"
};

export function getRateXTokenBalances(connection: Connection, balances: {[mint: string]: number}, decimalMap: Map<string, number>) {
    try {
        const rateXMintKeys = Object.keys(UNDERLYING_RATEX_MINT_DATA);
        for (const rateXMint of rateXMintKeys) {
            if (balances[rateXMint] !== undefined) {
                const rateXDecimals = decimalMap.get(rateXMint);
                const underlyingMint = UNDERLYING_RATEX_MINT_DATA[rateXMint];
                const underlyingDecimals = decimalMap.get(underlyingMint);
                if (rateXDecimals === undefined || underlyingDecimals === undefined) {
                    throw new Error(`Missing decimals for exponent mint: ${rateXMint} or underlying mint: ${underlyingMint}`);
                }
                const underlyingAmount = switchBaseDecimals(balances[rateXMint], rateXDecimals, underlyingDecimals);
                balances[underlyingMint] = (balances[underlyingMint] || 0) + underlyingAmount;
                delete balances[rateXMint];  
            }
        }
    } catch (error) {
        console.error("Error in getRateXTokenBalances:", error);
        // Gracefully fail and return the original balances
    }
    
    return balances;
}