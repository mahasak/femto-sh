import { getPrisma } from "@mahasak/femto-shared/prisma";
import { redisCache } from "@mahasak/femto-shared/cache";

export const genOrderId = async (shop_id: string): Promise<string> => {
  const prisma = await getPrisma();

  const order = await prisma.sequencer.upsert({
    where: { name: shop_id },
    create: {
      name: shop_id,
      data: 1
    },
    update: {
      data: {
        increment: 1
      }
    }
  });

  // Todo: Extract order formatting function to config
  return order.data.toString().padStart(5, '0');
}

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

export const isEligble = async (page_id: string) => {
  const channelData = await genChannelData("FACEBOOK_PAGE", page_id);
  return channelData !== undefined && channelData.ref_id === page_id;
}

export const getTopic = async (page_id: string): Promise<string[]> => {
  const topic: string[] = [];
  const channelData = await genChannelData("FACEBOOK_PAGE", page_id);

  channelData.registries?.forEach((registry: any) => {
    topic.push(registry.application.topic);
  })

  return topic;
}
