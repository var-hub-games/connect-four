import RPC from "varhub:rpc";
import room, {type Connection} from "varhub:room";
import Players from "varhub:players"

const players = new Players<{team: "x"|"o"}>(room, (_c, name) => name ? String(name) : undefined);

export type FieldState = {
	height: number;
	data: ("x"|"o"|"X"|"O")[][];
};

const field = new RPC({}, {height: 0, data: []} as FieldState)

export interface State {
	win: "x" | "o" | null;
	x: string | null;
	o: string | null;
	turn: string | null;
}

RPC.default.setState({
	win: null,
	x: null,
	o: null,
	turn: null,
} satisfies State);

function updateState(data: Partial<State>){
	const state = {...RPC.default.state, ...data};
	RPC.default.setState(state);
}

function resetGame(){
	for (let player of players) player.setTeam(undefined);
	updateState({x: null, o: null, turn: null, win: null});
	field.setState({height: 0, data: []});
}

// players

players.on("offline", player => player.kick());
players.on("leave", player => {
	if (player.team) resetGame();
})

function getOppositeTeam(team: "x"| "o" | null){
	if (team === "x") return "o";
	if (team === "o") return "x";
	return null;
}

const directions: [number, number][] = [[0, 1], [1, 1], [1, 0], [1, -1]]
function checkWin(colNumber: number, rowNumber: number, team: "x"|"o"){
	const winPoints = checkWinPoints(field.state.data, colNumber, rowNumber, team, 4);
	if (!winPoints) return false;
	const winType = ({x: "X", o: "O"} as const)[team];
	const dataCopy = field.state.data.map(row => [...row])
	for (const [row, col] of winPoints) dataCopy[row][col] = winType;
	field.setState(state => ({...state, data: dataCopy}));
	updateState({win: team, turn: null});
	return true;
}

function checkWinPoints(map: ("x"|"o"|"X"|"O")[][], colNumber: number, rowNumber: number, team: "x"|"o", winLength: number): null | [number, number][]{
	const totalWinPoints: [number, number][] = [];
	for (const dir of directions) {
		const winPoints: [number, number][] = [];
		let point: [number, number] = [colNumber, rowNumber];
		while (true) {
			const value = map[point[0]]?.[point[1]];
			if (value !== team) break;
			winPoints.push(point);
			point = [point[0]+dir[0], point[1]+dir[1]]
		}
		point = [colNumber-dir[0], rowNumber-dir[1]];
		while (true) {
			const value = map[point[0]]?.[point[1]];
			if (value !== team) break;
			winPoints.push(point);
			point = [point[0]-dir[0], point[1]-dir[1]]
		}
		if (winPoints.length >= winLength) totalWinPoints.push(...winPoints);
	}
	if (totalWinPoints.length === 0) return null;
	return totalWinPoints;
}

// exports

export function joinTeam(this: Connection, team: "x" | "o") {
	const player = players.get(this);
	if (!player) throw new Error("wrong state");
	if (team !== "x" && team !== "o") throw new Error("wrong team");
	if (players.getTeam(team).size) throw new Error("team is taken");
	player.setTeam(team);
	updateState({
		x: [...players.getTeam("x")][0]?.name ?? null,
		o: [...players.getTeam("o")][0]?.name ?? null,
		win: null,
		turn: null
	});
}

export function start(this: Connection, rows: number = field.state.data.length, height: number = field.state.height) {
	const player = players.get(this);
	if (!player?.team) throw new Error("wrong group");
	if (RPC.default.state.turn !== null) throw new Error("wrong state");
	if (RPC.default.state.x == null || RPC.default.state.o == null) throw new Error("no players");

	if (!Number.isInteger(rows)) throw new Error("rows format");
	if (!Number.isInteger(height)) throw new Error("height format");
	if (rows < 4 || rows > 20) throw new Error("rows format");
	if (height < 4 || height > 20) throw new Error("height format");

	field.setState({
		height,
		data: Array.from({length: rows}).map(() => [])
	});
	updateState({win: null});
}

export function move(this: Connection, colNumber: number){
	const player = players.get(this);
	if (!player?.team) throw new Error("wrong group");
	const team = player.team;
	if (RPC.default.state.turn && player.team !== RPC.default.state.turn) throw new Error("wrong group");
	if (RPC.default.state.win) throw new Error("wrong group");

	if (!Number.isInteger(colNumber)) throw new Error("wrong colNumber");
	if (colNumber < 0 || colNumber >= field.state.data.length) throw new Error("colNumber out of bounds");

	const col = field.state.data[colNumber];
	if (col.length >= field.state.height) throw new Error("height out");
	field.setState(state => ({
		...state,
		data: state.data.map((row, i) => i === colNumber ? [...row, team] : row)
	}));
	const hasTurns = field.state.data.some(({length}) => length < field.state.height);
	const hasWinner = checkWin(colNumber, col.length - 1, team);
	if (!hasWinner) updateState({turn: hasTurns ? getOppositeTeam(team) : null})
	return true;
}

export const Field = () => field;
