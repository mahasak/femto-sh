import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import {redisClient}   from "@femto-sh/femto-shared/cache";
import {changeHook, messageHook, postbackHook } from './service/hpp/webhook';
import { ChangesEvent, MessagingEvent } from '@femto-sh/femto-shared/types';

const app: Express = express();
const port = process.env.SERVER_PORT ?? 8082;
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
        try {
          const webhookEntry = JSON.parse(topicMessage)
          if (webhookEntry && webhookEntry.messaging) {
            const messaging = webhookEntry.messaging;
            messaging.forEach(async (message: any) => {
              await processWebhookMessages(message);
            });
          }

          if (webhookEntry && webhookEntry.changes) {
            webhookEntry.changes.forEach(async function (changes: ChangesEvent) {
              await changeHook(changes);
            });
          }
        } catch (error) {
          console.log("error")
          console.log(error)
        }
      }
    });

    await subscriber.subscribe(topic, (topicMessage) => {
      if(topicMessage !== null && topicMessage !== undefined) {
        console.log(topicMessage);
      }
    });
  })();
});

export const processWebhookMessages = async (event: MessagingEvent) => {
  if (event.message) {
    await receivedMessage(event)
  } else if (event.postback) {
    await postbackHook(event);
  } else {
    console.log(`Unable to process received messagingEvent: ${event}`)
  }
}

export const receivedMessage = async (event: MessagingEvent) => {
  if (event.message?.text) {
    await messageHook(event);
  }
}
