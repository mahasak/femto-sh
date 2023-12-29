import { createLogger, transports, format } from "winston";
import { SeqTransport } from "@datalust/winston-seq";

const SEQ_SERVER = process.env.SEQ_SERVER ?? ""
const SEQ_API_KEY = process.env.SEQ_API_KEY ?? ""

const seqTransport = new SeqTransport({
  serverUrl: SEQ_SERVER,
  apiKey: SEQ_API_KEY,
  onError: ((e: any) => {
    console.error(e)
  }),
  handleExceptions: true,
  handleRejections: true,
});

export type LoggingMetadata = {
  applicationName?: string;
  module?: string;
  service?: string;
  country?: number;
};

console.log(seqTransport)

export const getLogger = (metadata?: LoggingMetadata) => {
  const defaultMetadata = {
    application: process.env.APPLICATION_NAME,
  }

  const parameterizeMetadata = metadata ?? { service: "none" }
  const allowTransport = []
  if (process.env.LOG_TO_CONSOLE === "1") {
    allowTransport.push(new transports.Console())
  }
  
  if (process.env.LOG_TO_SEQ === "1") {
    allowTransport.push(seqTransport)
  }
  
  return createLogger({
    transports: allowTransport,
    format: format.combine(
      format.colorize(),
      format.timestamp(),
      format.printf(({ timestamp, level, message, service }) => {
        return `[${timestamp}] ${service} ${level}: ${message}`;
      })
    ),
    defaultMeta: { ...defaultMetadata, ...parameterizeMetadata },
  });
}
