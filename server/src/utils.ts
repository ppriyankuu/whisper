import { randomUUID } from "node:crypto";

const ANIME_FIRST_PARTS = [
    "Monkey D",
    "Uchiha",
    "Hatake",
    "Senju",
    "Hyuga",
    "Roronoa",
    "Kamado",
    "Kurosaki",
    "Sakata",
    "Fushiguro",
    "Okkotsu",
    "Zenitsu",
];

const ANIME_SECOND_PARTS = [
    "Luffy",
    "Hashirama",
    "Madara",
    "Itachi",
    "Kakashi",
    "Naruto",
    "Tanjiro",
    "Ichigo",
    "Gintoki",
    "Megumi",
    "Yuta",
    "Sasuke",
];

export function generateId(): string {
    return randomUUID();
}

export function generateUsername(existing: Set<string>): string {
    let name = "";

    do {
        const first =
            ANIME_FIRST_PARTS[Math.floor(Math.random() * ANIME_FIRST_PARTS.length)];
        const second =
            ANIME_SECOND_PARTS[Math.floor(Math.random() * ANIME_SECOND_PARTS.length)];

        name = `${first} ${second}`;
    } while (existing.has(name));

    return name;
}

