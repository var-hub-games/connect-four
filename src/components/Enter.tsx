import React, { FC, useCallback, useState, FormEventHandler, useEffect } from "react";
import { Varhub, type VarhubClient } from "@flinbein/varhub-web-client";
import roomIntegrity from "../controllers?varhub-bundle:integrity" with {type: "css"};

export const Enter: FC<{onCreate: (data: VarhubClient, roomId: string, url: string) => void}> = (props) => {
	const [loading, setLoading] = useState(false);

	const [initValues] = useState(() => {
		const searchParams = new URLSearchParams(location.search);

		const url = searchParams.get("url") ?? history?.state?.url ?? "https://varhub.dpohvar.ru";
		const room = searchParams.get("room") ?? history?.state?.room ?? "";
		const name = history?.state?.name ?? "";
		const join = history?.state?.join ?? false;
		let autofocusField = "url";
		if (url) autofocusField = "room";
		if (url && room) autofocusField = "name";

		if (searchParams.has("url") || searchParams.has("room")) {
			const currentUrl = new URL(location.href);
			currentUrl.search = "";
			history.replaceState({ url, room, name }, "", currentUrl);
		}
		return { url, room, name, join, autofocusField };
	});

	const [room, setRoom] = useState(initValues.room);
	const [url, setUrl] = useState(initValues.url);
	const [name, setName] = useState(initValues.name);

	const enterRoom = useCallback(async (url: string, room:string, clientName:string) => {
		try {
			setLoading(true)
			const [client, newRoomId] = await createRoomAndClient(url, room, clientName);
			window.history.replaceState({url, room: newRoomId, name: clientName, join: true}, "");
			props.onCreate(client, newRoomId, url);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false)
		}
	}, [room]);

	useEffect(() => {
		console.log("INIT-VALUES", initValues);
		if (initValues.url && initValues.room && initValues.name && initValues.join) {
			void enterRoom(initValues.url, initValues.room, initValues.name);
		}
	}, []);

	const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>((event) => {
		event.preventDefault();
		const inputs = event.currentTarget.elements;
		const action = (event as any).nativeEvent?.["submitter"]?.name ?? "join" as string;
		const url = (inputs.namedItem("url") as HTMLInputElement).value;
		const room = action === "join" ? (inputs.namedItem("room") as HTMLInputElement).value : "";
		const name = (inputs.namedItem("name") as HTMLInputElement).value;
		void enterRoom(url, room, name);
	}, []);

	const selectRoom = useCallback((room: string) => {
		setRoom(room);
		if (url && name) void enterRoom(url, room, name);
	}, [url, name])

	return (
		<form onSubmit={onSubmit}>
			<div>
				<input autoFocus={initValues.autofocusField==="url"} disabled={loading} name="url" type="text" placeholder="https://server-address" value={url} onChange={(e) => setUrl(e.target.value)} required/>
			</div>
			<div>
				<input autoFocus={initValues.autofocusField==="room"} disabled={loading} name="room" type="text" placeholder="room (create new if empty)" value={room} onChange={(e) => setRoom(e.target.value)}/>
			</div>
			<div>
				<input autoFocus={initValues.autofocusField==="name"} disabled={loading} name="name" type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} required/>
			</div>
			<div className="form-line">
				<input disabled={(loading || !room)} type="submit" name="join" value="join" />
				<input disabled={loading} type="submit" name="create" value="create new" />
			</div>
			{!loading && <SearchRooms selectRoom={selectRoom} url={url} key={url}/>}
		</form>
	);
}

async function createRoomAndClient(url: string, roomId: string, name: string){
	const hub = new Varhub(url);
	if (!roomId) {
		const roomCreateOptions = await import("../controllers?varhub-bundle");
		const roomData = await hub.createRoom("ivm", {
			...roomCreateOptions,
			message: `${name}`
		});
		roomId = roomData.id;
		console.log("ROOM CREATED", roomData);
	}
	console.log("JOIN ROOM", roomId, name, roomIntegrity);
	return [
		hub.join(roomId, {integrity: roomIntegrity, params: [name]}),
		roomId
	] as const;
}

const SearchRooms: FC<{selectRoom: (value: string) => void, url: string}> = ({selectRoom, url}) => {
	const [loading, setLoading] = useState(false);
	const [roomMap, setRoomMap] = useState<Record<string, string>>({});

	const search = useCallback(async () => {
		try {
			const varhub = new Varhub(url);
			setLoading(true);
			const rooms = await varhub.findRooms(roomIntegrity);
			setRoomMap(rooms);
		} finally {
			setLoading(false);
		}
	}, []);

	if (!url) return null;

	return (
		<>
			<div className="form-line">
				<input type="button" onClick={search} disabled={loading} value={`Search rooms ${roomIntegrity.substring(0, 8)}`}/>
			</div>
			{Object.entries(roomMap).map(([key, message]) => (
				<input
					key={key}
					title={roomMap[key]}
					type="button"
					onClick={() => selectRoom(key)} disabled={loading}
					value={`${key}: ${message}`}
				/>
			))}
		</>
	)
}
