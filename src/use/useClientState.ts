import { VarhubClient } from "@flinbein/varhub-web-client";
import { useEffect, useState } from "react";

function getClientStateObject(client: VarhubClient|undefined){
	return {
		defined: client != null,
		ready: client?.ready ?? false,
		closed: client?.closed ?? false,
	}
}

export default function useClientStatus(client?: VarhubClient|undefined) {
	const [state, setState] = useState(() => getClientStateObject(client));

	useEffect(() => {
		const update = () => setState(getClientStateObject(client));
		update();
		if (!client) return;
		client.on("open", update);
		client.on("close", update);
		return () => {
			client.off("open", update);
			client.off("close", update);
		}
	}, [client]);

	return state;
}
