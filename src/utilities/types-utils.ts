export type MessageData={ [key: string]: unknown };
export type MessagePayload={responseTopic:string,payload:MessageData}
export type MessageHandler= (data:MessageData) => Promise<unknown>;
