import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import {redisClient}   from "@femto-sh/femto-shared/cache";
import { ChangesEvent, MessagingEvent } from '@femto-sh/femto-shared/types';
import { getLogger } from "./logger"

const app: Express = express();
const port = process.env.SERVER_PORT ?? 8083;
const topic = process.env.REDIS_TOPIC_NAME ?? "";
const logger = getLogger();


app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send(`Femto HPP Server`);
});

process.on('SIGTERM', () => {
  console.log('Cleaning up on SIGTERM');
  if(logger) {
    logger.close()
  }
});

process.on('SIGINT', () => {
  console.log('Cleaning up on SIGINT');
  if(logger) {
    logger.close()
  }
});


app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);

  (async () => {
    const subscriber = redisClient.duplicate();
    subscriber.on("message", function (channel:string , topicMessage: any) {
      console.log("Message: " + topicMessage + " on channel: " + channel + " is arrive!");
      if (topicMessage && topicMessage !== "") {
        const message = JSON.parse(topicMessage);
        console.log(message);
        //logger.info(topicMessage.message, {name: "World"});)
        const metadata:any = {application: "femto-sh"}
        if(message.id) {
          metadata.id = message.id;
        }
        if(message.module) {
          metadata.module = message.module;
        }

        console.log()
        logger.info("Message {id} received", metadata);
      }
    });

    await subscriber.subscribe(topic, (topicMessage: any) => {
      if(topicMessage !== null && topicMessage !== undefined) {
        console.log(topicMessage);
      }
    });
  })();
});
