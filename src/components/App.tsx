import React, { FC, useCallback, useState } from "react";
import { Enter } from "./Enter.jsx";
import { Room } from "./Room.jsx";
import type { VarhubClient } from "@flinbein/varhub-web-client";
import useClientState from "../use/useClientState.js";


export const App: FC = () => {
	const [client, setClient] = useState<VarhubClient|undefined>();
	const clientState = useClientState(client);
	const [roomId, setRoomId] = useState<string>("");
	const [varhubUrl, setVarhubUrl] = useState<string>("");

	const onCreate = useCallback((client: VarhubClient, roomId: string, varhubUrl: string) => {
		setClient(client);
		setRoomId(roomId);
		setVarhubUrl(varhubUrl);
		client.on("close", (r) => console.log("-----closed", r));
		client.on("error", (r) => console.log("-----error", r));
	}, []);

	const clear = useCallback(() => {
		history.replaceState({...history.state, join: false}, "");
		setClient(undefined);
	}, [])

	if (!client) return (
		<div>
			<Enter onCreate={onCreate}/>
			<div style={{display: "flex"}}>
				{"CONNECT-FOUR".split("").map((c, i) => {
					const classList = ["_x", "_o", "_X", "_O"];
					const rndClass = classList[Math.floor(Math.random() * classList.length)];
					return <div key={i} className={"game-item "+rndClass}>{c}</div>
				})}
			</div>

		</div>
	);

	if (clientState.closed) return (
		<div>
			<h1>Closed</h1>
			<div className="form-line">
				<input type="button" onClick={clear} value={"restart"} />
			</div>
		</div>
	);

	if (!clientState.ready) return (
		<div>
			<h1>Connecting...</h1>
			<div className="form-line">
				<input type="button" onClick={clear} value={"cancel"} />
			</div>
		</div>
	);

	return (
		<Room client={client} roomId={roomId} varhubUrl={varhubUrl}/>
	)
}
