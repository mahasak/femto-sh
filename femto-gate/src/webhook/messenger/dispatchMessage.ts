import { Request, Response } from 'express';
import { WebhookEntry } from './types';
import { getTopic, isEligble } from '../../service/database';
import { redisClient } from '@mahasak/femto-shared/cache';
import { Snowflake } from "@theinternetfolks/snowflake";

export const dispatchMessage = async (req: Request, res: Response) => {
  const data = req.body;
  
  if (data && data.object && data.entry && data.object == 'page' && data.entry !== undefined) {
    data.entry.forEach(async (pageEntry: WebhookEntry) => {
  
      const is_eligible = await isEligble(pageEntry.id);
  
      if (await isEligble(pageEntry.id)) {
        const topics = await getTopic(pageEntry.id);
        topics.forEach(async (topic) => {
          const wrappedMessage = {
            trace_id: Snowflake.generate({timestamp: Date.now()}),
            contents: pageEntry
          };

          console.log(pageEntry);
          console.log(`publish message to [${topic}]`, JSON.stringify(pageEntry));
          await redisClient.publish(topic, JSON.stringify(pageEntry));
        });
      }
    });
  }

  res.sendStatus(200);
}
