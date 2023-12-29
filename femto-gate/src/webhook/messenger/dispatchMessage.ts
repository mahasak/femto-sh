import { Request, Response } from 'express';
import { LogFormat, WebhookEntry, WrappedMessage } from './types';
import { getTopic, isEligble } from '../../service/database';
import { redisClient } from '@femto-sh/femto-shared/cache';
import { Snowflake } from "@theinternetfolks/snowflake";
import {log} from "../../service/logger"



export const dispatchMessage = async (req: Request, res: Response) => {
  const data = req.body;
  
  if (data && data.object && data.entry && data.object == 'page' && data.entry !== undefined) {
    data.entry.forEach(async (pageEntry: WebhookEntry) => {
  
      const is_eligible = await isEligble(pageEntry.id);
  
      if (await isEligble(pageEntry.id)) {
        const topics = await getTopic(pageEntry.id);
        topics.forEach(async (topic) => {
          const wrappedMessage: WrappedMessage = {
            traceId: Snowflake.generate({timestamp: Date.now()}),
            pageEntry: pageEntry
          };

          console.log(wrappedMessage);
          console.log(`publish message to [${topic}]`, JSON.stringify(wrappedMessage));

          const payload: LogFormat = {
            level: "info",
            module: "gate",
            traceId: wrappedMessage.traceId,
            message: "[{application}] [{module}] - Request with trace ID {traceId} started"
          }

          await log(payload);
          await redisClient.publish(topic, JSON.stringify(wrappedMessage));
        });
      }
    });
  }

  res.sendStatus(200);
}
