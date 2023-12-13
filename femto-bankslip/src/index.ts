import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import { redisClient } from "./service/redis"
import { bankslipDetectionChangesHook, bankslipDetectionMessageHook, bankslipDetectionPostbackHook, bankslipDetectionQuickReplyHook } from './service/bankslip';
import { ChangesEvent, MessagingEvent } from './types';
const app: Express = express();
const port = process.env.PORT ?? 8081;

app.use(express.json());

app.get('/', async (req: Request, res: Response) => {
  res.send(`Express + TypeScript Server`);
});

app.listen(port, async () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  (async () => {
    const subscriber = redisClient.duplicate();

    subscriber.on("message", function (channel, topicMessage) {
      console.log("Message: " + topicMessage + " on channel: " + channel + " is arrive!");
      if (topicMessage && topicMessage !== "") {
        try {
          const webhookEntry = JSON.parse(topicMessage)
          if (webhookEntry && webhookEntry.messaging) {
            const messaging = webhookEntry.messaging;
            messaging.forEach(async (message: any) => {
              await processWebhookMessages(message);
            });
            // await bankslipDetectionMessageHook(event)
          }

          if (webhookEntry && webhookEntry.changes) {
            webhookEntry.changes.forEach(async function (changes: ChangesEvent) {
              await bankslipDetectionChangesHook(changes);
            });
          }
        } catch (error) {
          console.log(error)
        }
      }
    });

    await subscriber.subscribe('bankslip_prod', (topicMessage) => {
      console.log(topicMessage);
    });
  })();
});

export const processWebhookMessages = async (event: MessagingEvent) => {
  if (event.message) {
    await receivedMessage(event)
  } else if (event.postback) {
    await bankslipDetectionPostbackHook(event);
  } else {
    console.log(`Unable to process received messagingEvent: ${event}`)
  }
}

export const receivedMessage = async (event: MessagingEvent) => {
  if (event.message?.text) {
    await bankslipDetectionMessageHook(event);
  }

  if (event.message?.quick_reply) {
    const quickReplyPayload = event.message.quick_reply.payload
    console.log(`Quick reply with [${quickReplyPayload}]`);
    await bankslipDetectionQuickReplyHook(event);
  }
}