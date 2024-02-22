import gameConfig from "../game.config";
/**
 * Generates a random uppercase string with length of `gameConfig.roomIdLength`
 * @returns the string
 */
export function generateRoomId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < gameConfig.roomIdLength; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}
