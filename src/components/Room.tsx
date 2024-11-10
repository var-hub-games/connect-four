import React, { FC, useCallback, useState, FormEventHandler, useEffect, useMemo } from "react";
import { GameRPC, GameState } from "../types.js";
import { QrCodeCanvas } from "./QrCodeCanvas.js";
import { RPCChannel, VarhubClient } from "@flinbein/varhub-web-client";
import useRPCState from "../use/useRPCState.js";
import useRPC from "../use/useRPC.js";

export interface RoomProps {
	client: VarhubClient,
	roomId: string,
	varhubUrl: string,
}

export const Room: FC<RoomProps> = ({client, roomId, varhubUrl}) => {

	const rpc: GameRPC = useMemo(() => new RPCChannel(client) as any, [client]);
	const gameState: GameState = useRPCState(rpc);

	const leave = useCallback(() => {
		history.replaceState({...history.state, join: false}, "");
		void client.close("leave");
	}, []);

	const inviteUrl = useMemo<string>(() => {
		const resultUrl = new URL(location.href);
		resultUrl.searchParams.set("url", varhubUrl);
		resultUrl.searchParams.set("room", roomId);
		return resultUrl.href;
	}, [client]);

	const share = useCallback(() => {
		void navigator.share({url: inviteUrl, title: "Join game", text: `Room id: ${"client.roomId"}`});
	}, [inviteUrl, client])

	return (
		<div>
			{gameState && <RoomGame rpc={rpc} gameState={gameState} />}
			<div className="form-line">
				<input type="button" value="LEAVE" onClick={leave}/>
			</div>
			<QrCodeCanvas data={inviteUrl} onClick={share} />
		</div>
	)
}

const RoomGame: FC<{rpc: GameRPC, gameState: GameState}> = ({rpc, gameState}) => {
	const [loading, setLoading] = useState(false);
	const [team, setTeam] = useState<"x"|"o"|null>(null);

	const join = useCallback(async (team: "x"|"o") => {
		try {
			setLoading(true);
			await rpc.joinTeam(team);
			setTeam(team);
		} finally {
			setLoading(false);
		}
	}, [team])

	const canTurn = team && !gameState.win && !gameState.turn || gameState.turn === team;

	return (
		<>
			<div className="flex-sb">
				{gameState.x==null ? (
					<div className="player-name _x _empty" onClick={() => join("x")}>join X team</div>
				) : (
					<div className="player-name _x">{gameState.x}</div>
				)}
				<div>VS</div>
				{gameState.o==null ? (
					<div className="player-name _o _empty" onClick={() => join("o")}>join O team</div>
				) : (
					<div className="player-name _o">{gameState.o}</div>
				)}
			</div>
			<RoomField rpc={rpc} canTurn={!loading && canTurn}/>
			{gameState.win !== null && <div>WINNER {gameState.win}: {gameState[gameState.win]}</div>}
			{team && <RoomGameControl gameState={gameState} rpc={rpc} team={team} />}

		</>
	);
}

interface RoomFieldProps {
	rpc: GameRPC,
	canTurn: boolean,
}
const RoomField: FC<RoomFieldProps> = ({rpc, canTurn}) => {
	const [_ignored, fieldState] = useRPC(() => new rpc.Field(), [rpc]);
	const [loading, setLoading] = useState(false);

	const move = useCallback(async (index: number) => {
		setLoading(true);
		try {
			await rpc.move(index);
		} finally {
			setLoading(false);
		}
	}, [rpc]);

	return (
		<div className="game-field">
			{fieldState?.data.map((row, index) => (
				<RoomRow key={index} index={index} row={row} onMove={move} canTurn={canTurn && !loading} height={fieldState?.height ?? 0}/>
			))}
		</div>
	)
}

interface RoomRowProps {
	row: ("x"|"o"|"X"|"O")[],
	index: number,
	canTurn: boolean,
	height: number
	onMove: (index: number) => void
}
const RoomRow: FC<RoomRowProps> = ({row, index, canTurn, height, onMove}) => {
	const canTurnHere = row.length < height && canTurn;
	const onClick = useCallback(() => {
		if (!canTurnHere) return;
		onMove(index);
	}, [canTurnHere]);

	return (
		<div className={"game-row _"+(canTurnHere?"active":"not-active")} onClick={onClick}>
			{row.map((item, index) => (
				<div key={index} className={"game-item _"+item}>
					{item}
				</div>
			))}
			{Array.from({length: height-row.length}).map((_, index) => (
				<div key={index} className="game-item _empty"></div>
			))}
		</div>
	)
}

const RoomGameControl: FC<{rpc: GameRPC, gameState: GameState, team: "x"|"o"}> = ({rpc, gameState, team}) => {
	const [loading, setLoading] = useState(false);

	const onSubmit = useCallback<FormEventHandler<HTMLFormElement>>(async (event) => {
		event.preventDefault();
		try {
			setLoading(true);
			const inputs = event.currentTarget.elements;
			const widthStr = (inputs.namedItem("width") as HTMLInputElement).value || "11";
			const heightStr = (inputs.namedItem("height") as HTMLInputElement).value || "7";
			const width = Number(widthStr);
			const height = Number(heightStr);
			await rpc.start(width, height);
		} finally {
			setLoading(false);
		}
	}, []);

	const joinTeam = useCallback(async (team: "x" | "o") => {
		try {
			setLoading(true);
			await rpc.joinTeam(team);
		} finally {
			setLoading(false);
		}

	}, []);

	return (
		<>
			{(gameState.x != null && gameState.o != null && !gameState.turn) && (
				<form onSubmit={onSubmit}>
					<div className="form-line">
						<input name="width" type="number" min={4} max={20} placeholder="width = 11" disabled={loading}/>
						<input name="height" type="number" min={4} max={20} placeholder="height = 7" disabled={loading}/>
						<input value="start" type="submit" disabled={loading}/>
					</div>
				</form>
			)}
		</>
	)
}
