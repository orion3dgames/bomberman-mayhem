import gameConfig from "../game.config";
import { animals, colors } from "./namesDictionary";
import { uniqueNamesGenerator } from "unique-names-generator";

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

/**
 * Generates a random username
 * @returns the username
 */
export function generateUserName(): string {
    return uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: " ",
        style: "capital",
    });
}
