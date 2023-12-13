import { getPrisma } from "./prisma";
import { redisCache } from "./redis";

export const genChannelData = async (channel_type: string, page_id: string) => {
  const prisma = await getPrisma();
  const cacheKey = `FEMTO_${channel_type}_${page_id}`;

  const cachedData = await redisCache.getItem<string>(cacheKey);

  if (cachedData) {
    return JSON.parse(cachedData);
  }

  const channelData = await prisma.merchantChannel.findMany({
    where: {
      ref_type: channel_type,
      ref_id: page_id,
    },
    include: {
      registries: {
        where: {
          enabled: true,
        },
        include: {
          application: {
            where: {
              enabled: true,
            }
          }
        }
      },
    }
  });

  await redisCache.setItem(cacheKey, JSON.stringify(channelData[0]), { isCachedForever: true });

  return channelData[0];
}
