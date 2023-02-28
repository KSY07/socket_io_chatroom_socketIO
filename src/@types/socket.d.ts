import { listenerCount } from "process";
import { DefaultEventsMap, EventsMap, StrictEventEmitter } from "socket.io/dist/typed-events";

export declare class Socket<ListenEvents extends EventsMap = DefaultEventsMap, EmitEvents extends EventsMap = ListenEvents, ServerSideEvents extends EnvetsMap = DefaultEventsMap, SocketData = any> extends StrictEventEmitter<ListenEvents, EmitEvents, SocketReservedEventsMap> {
    type: string;
}