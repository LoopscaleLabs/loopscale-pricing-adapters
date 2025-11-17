import { Connection } from "@solana/web3.js";
import { switchBaseDecimals } from "../utils";

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