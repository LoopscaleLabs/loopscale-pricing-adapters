import { Connection } from "@solana/web3.js";
import { switchBaseDecimals, switchBaseDecimalsBn } from "../utils";

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
    "AqSfXMdsQ99ioNB3VhHXYsKFQDMDVFooh9JNv8Ap4bC": "5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5", //onyc
    "6oiDcfve7ybKUC8ysZmncC9iSuxQG2vrRkh3dgV7EKR4": "3ThdFZQKM6kRyVGLG48kaPg5TRMhYMKY1iCRa9xop1WC", //eusx
    "HNapfhQhXPCw5DsEJtkQPQqyNLC767Ax7CVxSkFZRtTB": "WFRGSWjaz8tbAxsJitmbfRuFV2mSNwy7BMWcCwaA28U", // fragsol feb 26
    "Bw6zsBWadivcKo1n2wEyF79pSrKDGyggif4a7wv3dtVi": "BULKoNSGzxtCqzwTvg5hFJg8fx6dqZRScyXe5LYMfxrn", // bulksol feb 26
    "9AuU8dyHDs7cuzVm9jcu5vmfJpN9dxnaZaB9Cuc5hdmC": "4sWNB8zGWHkh6UnmwiEtzNxL4XrN7uK9tosbESbJFfVs", // xSOL November 25
    "6bAbqESeDQRutBLyinoJrXUK9ELAUMXShd1pMWtQUz3N": "4sWNB8zGWHkh6UnmwiEtzNxL4XrN7uK9tosbESbJFfVs", // xSOL March 26
    "7vWj1UriSscGmz5wadAC8EkA8ndoU3M7WUifqxTC3Ysf": "6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG", // usx feb 26
    "Us2g6G3vfYVkz2Vbs8v7QayRGi6xTUDbyuELrHrK4md": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // usdc jun 4 26
    "3kctCXgt6pP3uZcek8SqNK2KZdQ6cqtj9hc3U46jhgBk": "6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG", // usx jun 1
    "BR2JKV9gPoJfX8A8DkFmo2yNQKCeGipg33oYaZ4EmjbW": "6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG", // usx jun 1 lp
    "BNR2FsHo8JrYGWx2V8yxG5GBWiG3uU8voi2eMGBHFwEj": "3ThdFZQKM6kRyVGLG48kaPg5TRMhYMKY1iCRa9xop1WC", // eusx jun 1
    "ZeqaGvENXeyDtb8mBrC3xi1Zi3zhCfKTV2vr2z5Bwao": "5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5", //onyc may 13
    "3gqhwFZtkU1dUyNN6taFp8sbnu3E5bmkumfjtoF9P9JD": "5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5", //onyc may 13 lp
    "CepgNWfh7p4pBenHCsWGC7ZfPwhFkskwvKXqmQMLnRRM": "BULKoNSGzxtCqzwTvg5hFJg8fx6dqZRScyXe5LYMfxrn", //bulksol jun 20
    "JBuRPTd6x3vq8R2Htr8rCr6yVjAmLaV6LfkSMH9TihsC": "BULKoNSGzxtCqzwTvg5hFJg8fx6dqZRScyXe5LYMfxrn", //bulksol lp jun 20
    "2W5zZccVq8AMdrg7P4b3NvBKJyzbdnytRy2CKEDHvhiJ": "5Y8NV33Vv7WbnLfq3zBcKSdYPrk7g2KoiQoe7M2tcxp5", // onyc sep 10
    "6gUU7UXtGgJ3tmeb2gXxQcVeM2L82bg9MzRYxu2YUspu": "6FrrzDk5mQARGc1TDYoyVnSyRdds1t4PbtohCD6p3tgG", // usx sep 16
    "2wZkuwSiDyHZuuZfS9C9kFkZNsgwHGjKtCxX3B6Ck6EX": "3ThdFZQKM6kRyVGLG48kaPg5TRMhYMKY1iCRa9xop1WC" // eusx sep 16
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

export function getExponentTokenBalancesBn(connection: Connection, balances: {[mint: string]: bigint}, decimalMap: Map<string, number>) {

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
                const underlyingAmount = switchBaseDecimalsBn(balances[exponentMint], exponentDecimals, underlyingDecimals);
                balances[underlyingMint] = (balances[underlyingMint] || 0n) + underlyingAmount;
                delete balances[exponentMint];  
            }
        }
    } catch (error) {
        console.error("Error in getExponentTokenBalances:", error);
        // Gracefully fail and return the original balances
    }

    return balances;
}