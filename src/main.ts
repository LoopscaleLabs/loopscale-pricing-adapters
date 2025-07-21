import express, { Request, Response } from 'express';
import cors from 'cors';
import { getDecimalMap } from './utils';
import { Connection, PublicKey } from '@solana/web3.js';
import { deriveStakePoolExchangeRates, getRateXTokenBalances, parseAndConvertWhirlpoolPositions, UNDERLYING_RATEX_MINT_DATA } from './pricing';
import { getExponentTokenBalances, UNDERLYING_EXPONENT_MINT_DATA } from './pricing';
import { getMeteoraTokenBalances } from './pricing/meteora';
const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 80;

// Enable CORS for all routes
app.use(cors());

// Parse JSON bodies
app.use(express.json());

app.get('/', async (_req: Request, res: Response) => {
  return res.send('ack');
});

const handler = {
    "whirlpools": parseAndConvertWhirlpoolPositions,
    "sanctum": deriveStakePoolExchangeRates,
    "exponent": getExponentTokenBalances,
    "ratex": getRateXTokenBalances,
    "meteora": getMeteoraTokenBalances
};

app.post(
  "/decompile_mints",
  async (req: Request, res: Response) => {
    try {
      let balances = req.body.rawBalances;

      const mints = Object.keys(balances).map((mint) => new PublicKey(mint));
      mints.push(...Object.values(UNDERLYING_EXPONENT_MINT_DATA).map((mint) => new PublicKey(mint)));
      mints.push(...Object.values(UNDERLYING_RATEX_MINT_DATA).map((mint) => new PublicKey(mint)));

      const url = process.env.SOLANA_RPC_URL;
      if (!url) {
        return res.status(500).json({ error: "SOLANA_RPC_URL environment variable is not set." });
      }
      const connection = new Connection(url, "confirmed");

      const decimalMap = await getDecimalMap(connection, mints);

      const handlers = Object.keys(handler) as (keyof typeof handler)[];

      for (const handlerName of handlers) {
        balances = await handler[handlerName](connection, balances, decimalMap);
      }

      res.json(balances);
    } catch (error) {
      console.error("Error processing request:", error);
    }
  },
);

app.listen(HTTP_PORT, () => {
  console.log(`Server is running at http://localhost:${HTTP_PORT}`);
});