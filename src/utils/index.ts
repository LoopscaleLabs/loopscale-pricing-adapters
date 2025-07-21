import { Connection, PublicKey } from "@solana/web3.js";
import { unpackMint } from "@solana/spl-token";

export const SOL_MINT = "So11111111111111111111111111111111111111112";
export * from "./clmm_math";

export const getProgramAddress = (seeds: Array<Buffer | Uint8Array>, programId: PublicKey) => {
    const [key] = PublicKey.findProgramAddressSync(seeds, programId);
    return key;
};

export async function getDecimalMap(connection: Connection, mintAddresses: PublicKey[]): Promise<Map<string, number>> {
    const mintDecimalsMap = new Map();

    const allAccounts = [];
    for (let i = 0; i < mintAddresses.length; i += 100) {
        const batch = mintAddresses.slice(i, i + 100);
        const accounts = await connection.getMultipleAccountsInfo(batch);
        allAccounts.push(...accounts);
    }

    allAccounts.forEach((accountInfo, idx) => {
        const mintPubkey = mintAddresses[idx].toString();

        if (accountInfo) {
            const mintData = unpackMint(mintAddresses[idx], accountInfo, accountInfo.owner);
            mintDecimalsMap.set(mintPubkey, mintData.decimals);
        } else {
            console.warn(`Mint account not found: ${mintPubkey}`);
            mintDecimalsMap.set(mintPubkey, null);
        }
    });
    return mintDecimalsMap;
}

export const switchBaseDecimals = (amount: number, fromDecimals: number, toDecimals: number): number => {
    if (fromDecimals === toDecimals) {
        return amount;
    }
    const exponent = toDecimals - fromDecimals;
    return amount * Math.pow(10, exponent);
}