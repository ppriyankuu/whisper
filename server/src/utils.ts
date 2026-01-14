import { randomUUID } from "node:crypto";

const ANIME_NAMES = [
    "Luffy",
    "Zoro",
    "Naruto",
    "Sasuke",
    "Itachi",
    "Madara",
    "Kakashi",
    "Tanjiro",
    "Goku",
    "Vegeta",
    "Gojo",
    "Megumi",
    "Yuta",
    "Ichigo",
    "Eren",
    "Levi",
    "Mikasa",
    "Gintoki",
    "Saitama",
    "Killua",
    "Gon",
];

export function generateId(): string {
    return randomUUID();
}

export function generateUsername(existing: Set<string>): string {
    let name = "";

    do {
        name = ANIME_NAMES[Math.floor(Math.random() * ANIME_NAMES.length)];
    } while (existing.has(name));

    return name;
}

