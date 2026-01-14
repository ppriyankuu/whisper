"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateId = generateId;
exports.generateUsername = generateUsername;
const node_crypto_1 = require("node:crypto");
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
function generateId() {
    return (0, node_crypto_1.randomUUID)();
}
function generateUsername(existing) {
    let name = "";
    do {
        name = ANIME_NAMES[Math.floor(Math.random() * ANIME_NAMES.length)];
    } while (existing.has(name));
    return name;
}
