import { RPCChannel, RPCSource } from "@flinbein/varhub-web-client";
import { useEffect, useState } from "react";

export default function useRPCState<T extends RPCChannel<any, unknown, any> | undefined>(
	rpc: T
): T extends undefined ? undefined : T extends RPCChannel<any, any, infer STATE> ? STATE : never {
	const [rpcState, setRpcState] = useState(() => rpc?.state)
	useEffect(() => {
		if (!rpc) return setRpcState(undefined);
		setRpcState(rpc.state);
		rpc.on("state", setRpcState);
		return () => void rpc.off("state", setRpcState);
	}, [rpc]);

	return rpcState as any;
}
