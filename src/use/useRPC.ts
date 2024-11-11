import { RPCChannel, RPCSource } from "@flinbein/varhub-web-client";
import { useEffect, useRef, useState } from "react";

export default function useRPC<T extends RPCChannel<any, unknown, any> | undefined>(
	createRPC: () => T,
	deps: any[]
): [rpc: T, state: undefined | (T extends {state: infer S} ? S : undefined), closed: boolean] {
	const [rpc, setRpc] = useState(() => createRPC())
	const [rpcState, setRpcState] = useState(() => rpc?.state)
	const [closed, setClosed] = useState(false)
	const firstRender = useRef(true);

	useEffect(() => {
		let newRpc;
		if (firstRender.current) {
			firstRender.current = false
			newRpc = rpc;
		} else {
			newRpc = createRPC();
			setClosed(false);
			setRpc(newRpc);
		}
		if (!newRpc) return;
		console.log("subscribe on rpc", newRpc);
		newRpc.on("state", setRpcState);
		newRpc.on("close", () => setClosed(true));
		return () => {
			console.log("close rpc");
			setRpcState(undefined);
			newRpc.close();
		}
	}, deps);

	return [rpc, rpcState, closed];
}
