import { Connection } from "@solana/web3.js";
import { switchBaseDecimals, switchBaseDecimalsBn } from "../utils";
import { reportError } from "../utils/errorContext";

const XSOL_MINT = "4sWNB8zGWHkh6UnmwiEtzNxL4XrN7uK9tosbESbJFfVs";
export const JITOSOL_MINT = "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn";

type PythFeedResponse = {
    parsed: {
        id: string,
        price: {
            price: string,
            conf: string,
            expo: number
        },
    }[],
}

export async function getXsolBalanceInJitoSol(connection: Connection, balances: {[mint: string]: number}, decimalMap: Map<string, number>) {

    try {
        const pythRequestXsol = "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x332e31d3fc656ca11dc8522f55791aa8dcd9dbeee0508ab880effc12a12b5c59";

        const response = await fetch(pythRequestXsol);
        if (!response.ok) {
            throw new Error(`Failed to fetch pyth data: ${response.status} ${response.statusText}`);
        }
    
        const pythResponse: PythFeedResponse = await response.json();
        const pythPriceData = pythResponse.parsed[0]?.price;
        if (!pythPriceData) {
            throw new Error(`No price found for XSol`);
        }

        const xsolPriceInJitoSol = parseInt(pythPriceData.price) * Math.pow(10, pythPriceData.expo);
        
        const xsolDecimals = decimalMap.get(XSOL_MINT);
        const jitoSolDecimals = decimalMap.get(JITOSOL_MINT);
        if (xsolDecimals === undefined || jitoSolDecimals === undefined) {
            throw new Error(`No decimals found for XSol`);
        }

        const jitoSolAmountXSolDecimals = xsolPriceInJitoSol * balances[XSOL_MINT];
        const jitoSolAmount = switchBaseDecimals(jitoSolAmountXSolDecimals, xsolDecimals, jitoSolDecimals);

        balances[JITOSOL_MINT] = (balances[JITOSOL_MINT] || 0) + jitoSolAmount;
        delete balances[XSOL_MINT]; 
    } catch (error) {
        console.error("Error in xsol balance fetch:", error);
        // Gracefully fail and return the original balances
    }

    return balances;
}

export async function getXsolBalanceInJitoSolBn(connection: Connection, balances: {[mint: string]: bigint}, decimalMap: Map<string, number>) {

    try {
        const balance = balances[XSOL_MINT];
        if (balance === undefined || balance === 0n) return balances;

        const pythRequestXsol = "https://hermes.pyth.network/v2/updates/price/latest?ids%5B%5D=0x332e31d3fc656ca11dc8522f55791aa8dcd9dbeee0508ab880effc12a12b5c59";

        const response = await fetch(pythRequestXsol);
        if (!response.ok) {
            throw new Error(`Failed to fetch pyth data: ${response.status} ${response.statusText}`);
        }

        const pythResponse: PythFeedResponse = await response.json();
        const pythPriceData = pythResponse.parsed[0]?.price;
        if (!pythPriceData) {
            throw new Error(`No price found for XSol`);
        }

        const xsolDecimals = decimalMap.get(XSOL_MINT);
        const jitoSolDecimals = decimalMap.get(JITOSOL_MINT);
        if (xsolDecimals === undefined || jitoSolDecimals === undefined) {
            throw new Error(`No decimals found for XSol`);
        }

        // Pyth price = mantissa * 10^expo, expo is typically negative for USD/asset pairs.
        // jitosol_native = xsol_native * mantissa * 10^expo (in xsol-decimals units)
        const mantissa = BigInt(pythPriceData.price);
        const expo = pythPriceData.expo;
        let jitoSolAmountXSolDecimals: bigint;
        if (expo >= 0) {
            jitoSolAmountXSolDecimals = balance * mantissa * (10n ** BigInt(expo));
        } else {
            jitoSolAmountXSolDecimals = (balance * mantissa) / (10n ** BigInt(-expo));
        }

        const jitoSolAmount = switchBaseDecimalsBn(jitoSolAmountXSolDecimals, xsolDecimals, jitoSolDecimals);

        balances[JITOSOL_MINT] = (balances[JITOSOL_MINT] || 0n) + jitoSolAmount;
        delete balances[XSOL_MINT];
    } catch (error) {
        console.error("Error in xsol balance fetch:", error);
        reportError("hylo", error);
    }

    return balances;
}