import {redisClient}   from "@femto-sh/femto-shared/cache";

export const log = async (payload: any) => {
  await redisClient.publish('logger', JSON.stringify(payload));
}