/**
 * Generates a random uppercase string with length of `4`
 * @returns the string
 */
export function generateRoomId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 4; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
}
export function generateId() {
    const dateString = Date.now().toString(4);
    const randomness = Math.random().toString(4).substr(2);
    return dateString + randomness;
}
