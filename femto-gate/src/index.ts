import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import { messengerRoutes } from './webhook/messenger/routes';
import { Snowflake } from "@theinternetfolks/snowflake";
import { clearChannelCache,  verifyApiKey, updateChannelData }from '@mahasak/femto-shared/data'

const app: Express = express();
const port = process.env.PORT ?? 8080;

app.use(express.json())

app.get('/', async (req: Request, res: Response) => {
  const response = {
    req_id: Snowflake.generate({ timestamp: Date.now() }),
    message: 'Femto Gate Server'
  }
  res.send(response);
});

app.post('/reset_config', async (req: Request, res: Response) => {
  const channel = req.body.channel ?? "";
  const channel_id = req.body.channel_id ?? "";

  if (channel !== "" && channel_id !== "") {
    await clearChannelCache(channel,channel_id)
  }

  res.send({result: true});
});

app.post('/update_config', async (req: Request, res: Response) => {
  const apiKey = req.header('x-api-key') ?? "";
  const channel = req.body.channel ?? "";
  const channel_id = req.body.channel_id ?? "";
  const token = req.body.token ?? "";

  const checkApiKey = await verifyApiKey(apiKey);

  if(!checkApiKey) {
    res.send({result: false});
  } else {
    await updateChannelData(channel, channel_id, token)
    await clearChannelCache(channel,channel_id)
    res.send({result: true});
  }
});

app.use(messengerRoutes);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});