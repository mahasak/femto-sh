import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import {redisClient}   from "@femto-sh/femto-shared/cache";
import { ChangesEvent, MessagingEvent } from '@femto-sh/femto-shared/types';


const app: Express = express();
const port = process.env.SERVER_PORT ?? 8083;
const topic = process.env.REDIS_TOPIC_NAME ?? "";

console.log(topic)
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send(`Femto HPP Server`);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  (async () => {
    const subscriber = redisClient.duplicate();
    subscriber.on("message", function (channel, topicMessage) {
      console.log("test}")
      console.log("Message: " + topicMessage + " on channel: " + channel + " is arrive!");
      if (topicMessage && topicMessage !== "") {
        console.log(topicMessage);
      }
    });

    await subscriber.subscribe(topic, (topicMessage) => {
      if(topicMessage !== null && topicMessage !== undefined) {
        console.log(topicMessage);
      }
    });
  })();
});
