import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Enter } from "./Enter";
import Client from "varhub-ws-client";
import { Room } from "./Room";
import { QrCodeCanvas } from "./QrCodeCanvas";

export const App: FC = () => {

	const [connectedData, setConnectedData] = useState<{client: Client, team: "x"|"o"|"s", url: string}|null>(null);

	useEffect(() => {
		if (!connectedData) return;
		function onClose(){
			setConnectedData(null);
		}
		connectedData.client.events.on("close", onClose);
		return () => connectedData.client.events.off("close", onClose);
	}, [connectedData]);

	const inviteUrl = useMemo<string|null>(() => {
		if (!connectedData) return null;
		console.log("BUILD-URL", connectedData);
		const resultUrl = new URL(location.href);
		resultUrl.searchParams.set("url", connectedData.url);
		resultUrl.searchParams.set("room", connectedData.client.roomId);
		return resultUrl.href;
	}, [connectedData]);

	const share = useCallback(() => {
		void navigator.share({url: inviteUrl, title: "Join game", text: `Room id: ${connectedData.client.roomId}`});
	}, [inviteUrl, connectedData])


	if (!connectedData) return (
		<div>
			<Enter onCreateClient={setConnectedData}/>
		</div>
	);



	return (
		<>
		<Room client={connectedData.client} team={connectedData.team} />
		{inviteUrl !== null && (
			<div className="invite-info">

				<QrCodeCanvas data={inviteUrl} width="2000" height="2000" className="invite-image" />
				<div className="invite-room form-line">
					<a target="_blank" href={inviteUrl}>{connectedData.client.roomId}</a>
					<input type="button" onClick={share} value="share" />
				</div>
			</div>
			)}
		</>


	)
}
