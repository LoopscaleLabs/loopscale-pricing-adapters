import * as toml from '@iarna/toml';
import { Connection, PublicKey, } from "@solana/web3.js";
import { StakePoolLayout } from '@solana/spl-stake-pool';
import { SOL_MINT } from '../utils';

type SanctumLstSumamry = {
    mint: string,
    pool: {
        program: string,
        pool: string,
    },
}

export async function fetchAndParseStakePools(url: string): Promise<SanctumLstSumamry[]> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch TOML file: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    try {
        const parsed = toml.parse(text);
        return parsed.sanctum_lst_list as unknown as SanctumLstSumamry[];
    } catch (err) {
        throw new Error(`Failed to parse TOML content: ${(err as Error).message}`);
    }
}

export async function deriveStakePoolExchangeRates(connection: Connection, balances: {[mint: string]: number}) {
    try {
        const stakePools = await fetchAndParseStakePools('https://raw.githubusercontent.com/igneous-labs/sanctum-lst-list/refs/heads/master/sanctum-lst-list.toml');

        const mintsWithBalance = Object.keys(balances);
        const poolsToSearch = stakePools.filter((sp) => mintsWithBalance.includes(sp.mint)).map((sp) => sp.pool.pool).filter((pool) => pool !== undefined).map((pool) => new PublicKey(pool));
        const accounts = await connection.getMultipleAccountsInfo(poolsToSearch);

        const stakePoolAccounts = accounts.map((acc) => acc != null && acc.data !== undefined && StakePoolLayout.decode(acc.data)).filter((acc) => acc !== undefined);
        for(let i = 0; i < stakePoolAccounts.length; i++) {
            const pool = stakePoolAccounts[i];
            const solRatio = pool.totalLamports / pool.poolTokenSupply;
            const existingMint = pool.poolMint.toBase58();
            if (existingMint) {
                const newSol = solRatio * balances[existingMint];
                balances[SOL_MINT] = balances[SOL_MINT] + newSol;
                delete balances[existingMint];
            }
        }
    } catch (error) {
        console.error("Error deriving stake pool exchange rates:", error);
        // Gracefully fail and return partially modified balances
        // This allows the rest of the pricing logic to continue
    }
    
    return balances;
}
