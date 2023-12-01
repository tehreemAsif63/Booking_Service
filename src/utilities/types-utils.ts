//changed to fix error in getSlots function, user is not a property of MessageData 

export type MessageData={ [key: string]: unknown }&{requestInfo:{user:{admin:boolean,id:string,email:string,userType:string}}};
export type MessagePayload={responseTopic:string,payload:MessageData,requestInfo:RequestInfo};
export type MessageHandler= (data:MessageData,requestInfo:RequestInfo) => Promise<unknown>;
