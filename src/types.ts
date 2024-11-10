import type { RPCChannel } from "@flinbein/varhub-web-client";
import type {State} from "./controllers/index.js";
import type * as RoomMainModule from "./controllers/index.js";
export type GameState = Readonly<State>;
export type GameRPC = RPCChannel<typeof RoomMainModule, {}, GameState>
