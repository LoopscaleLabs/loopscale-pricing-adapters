import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import WhirlpoolIdl from '../contracts/whirlpool.json';
import { getProgramAddress, whirlpoolTokenBalances } from "../utils";

const whirlpoolProgram = (connection: Connection) => {
    const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default, signTransaction: (tx) => Promise.resolve(tx), signAllTransactions: (txs) => Promise.resolve(txs) },
        AnchorProvider.defaultOptions()
    );
    const program = new Program(WhirlpoolIdl, provider);
    return program;
};

function getWhirlpoolTokenAmounts(whirlpool: any, position: any, tokenADecimals: number, tokenBDecimals: number) {
    const positionLiquidityAmount = position.liquidity;
    const currentSqrtPrice = whirlpool.sqrtPrice;

    const lowerTickIndex = position.tickLowerIndex;
    const upperTickIndex = position.tickUpperIndex;
    const tokenAmounts = whirlpoolTokenBalances(positionLiquidityAmount, currentSqrtPrice, tokenADecimals, tokenBDecimals, lowerTickIndex, upperTickIndex)

    return tokenAmounts;
}

async function attemptParseWhirlpoolPositions(connection: Connection, positionMints: string[], decimalMap: Map<string, number>) {
    const program = whirlpoolProgram(connection) as any;
    const tokenBalances: {[position: string]: {[mint: string]: number} | undefined } = {};
    // Convert position mints to whirlpool PDAs
    const positionPdas = positionMints.map((mint) => {
        tokenBalances[mint] = undefined;
        const seeds = [Buffer.from("position"), new PublicKey(mint).toBytes()];
        return getProgramAddress(seeds, program.programId);
    });
    // Fetch raw PDA Data
    const accounts = [];
    for(let i = 0; i < positionPdas.length; i = i + 10) {
        const batch = positionPdas.slice(i, Math.min(i + 10, positionPdas.length));
        const accountBatch = await connection.getMultipleAccountsInfo(batch);
        accounts.push(...accountBatch);
    }

    const whirlpoolPositions = accounts.filter((account) => account !== null && account.data !== undefined);
    
    // Parse PDAs using whirlpool IDL
    const parsedPositions = whirlpoolPositions.map((account) => program.account.position.coder.accounts.decode('position', account?.data));
    
    // Fetch all Whirlpools
    const whirlpools = await program.account.whirlpool.all();

    // For each position PDA
    for (let i = 0; i < parsedPositions.length; i++) {
        const parsedPosition = parsedPositions[i];
        // Get Whirlpool for position
        const whirlpool = whirlpools.find((wp: any) => wp.publicKey.toString() == parsedPosition.whirlpool.toString()).account;
        const tokenAMint = whirlpool.tokenMintA.toString();
        const decimalA = decimalMap.get(tokenAMint);
        const tokenBMint = whirlpool.tokenMintB.toString();
        const decimalB = decimalMap.get(tokenBMint);

        // Get token amounts for position (Helper)
        // TODO error handling for missing decimals
        if (!decimalA || !decimalB) {
            console.warn(`Missing decimals for token mints: ${tokenAMint} or ${tokenBMint}`);
            continue;
        }
        // Get token amounts for position
        const tokenAmounts = getWhirlpoolTokenAmounts(whirlpool, parsedPosition, decimalA, decimalB);

        // Add to base token map
        tokenBalances[parsedPosition.positionMint.toString()] = {
            [tokenAMint]: tokenAmounts.depositA,
            [tokenBMint]: tokenAmounts.depositB
        };
    }
    // Return map
    return tokenBalances;
}

export async function parseAndConvertWhirlpoolPositions(connection: Connection, balances: {[mint: string]: number}, decimalMap: Map<string, number>) {
    try {
        // Determine which mints are whirlpool positions by filtering fro amount == 1, then attempting to fetch their Whirlpool PDA
        const potentialWhirlpoolPositions = Object.keys(balances).filter((mint) => balances[mint] == 1);
        const wpBalances = await attemptParseWhirlpoolPositions(connection, potentialWhirlpoolPositions, decimalMap);
        for (const mint of Object.keys(wpBalances)) {
            const wpBalance = wpBalances[mint];
            if (wpBalance !== undefined) {
                // Is a whirlpool position, add to balances
                const mintsInPosition = Object.keys(wpBalance);
                for (const mintInPosition of mintsInPosition) {
                    const amount = wpBalance[mintInPosition];
                    if (amount !== undefined) {
                        // Add to balances
                        balances[mintInPosition] = (balances[mintInPosition] || 0) + amount;
                    }
                }
                // Remove whirlpool position mint from balances
                delete balances[mint];
            }
        }
    } catch (error) {
        console.error("Error parsing whirlpool positions:", error);
        // Gracefully fail and return partially modified balances
        // This allows the rest of the pricing logic to continue
    }
    return balances;
}