var Choices;
(function (Choices) {
    Choices[Choices["PLAYER"] = 0] = "PLAYER";
    Choices[Choices["OPPONENT"] = 1] = "OPPONENT";
    Choices[Choices["CARD_IN_HAND"] = 2] = "CARD_IN_HAND";
    Choices[Choices["CARD_IN_DISCARD"] = 3] = "CARD_IN_DISCARD";
})(Choices || (Choices = {}));
var AIPointer;
(function (AIPointer) {
    AIPointer[AIPointer["SELF"] = 0] = "SELF";
    AIPointer[AIPointer["OPPONENT_MOST_CARDS"] = 1] = "OPPONENT_MOST_CARDS";
    AIPointer[AIPointer["OPPONENT_LEAST_CARDS"] = 2] = "OPPONENT_LEAST_CARDS";
    AIPointer[AIPointer["OPPONENT_RANDOM"] = 3] = "OPPONENT_RANDOM";
    AIPointer[AIPointer["PLAYER_RANDOM"] = 4] = "PLAYER_RANDOM";
    AIPointer[AIPointer["PLAYER_MOST_CARDS"] = 5] = "PLAYER_MOST_CARDS";
    AIPointer[AIPointer["PLAYER_LEAST_CARDS"] = 6] = "PLAYER_LEAST_CARDS";
    AIPointer[AIPointer["CARD_IN_HAND_LEAST_POWER"] = 7] = "CARD_IN_HAND_LEAST_POWER";
    AIPointer[AIPointer["CARD_IN_HAND_MOST_POWER"] = 8] = "CARD_IN_HAND_MOST_POWER";
    AIPointer[AIPointer["CARD_IN_HAND_RANDOM"] = 9] = "CARD_IN_HAND_RANDOM";
    AIPointer[AIPointer["CARD_IN_DISCARD_LEAST_POWER"] = 10] = "CARD_IN_DISCARD_LEAST_POWER";
    AIPointer[AIPointer["CARD_IN_DISCARD_MOST_POWER"] = 11] = "CARD_IN_DISCARD_MOST_POWER";
    AIPointer[AIPointer["CARD_IN_DISCARD_RANDOM"] = 12] = "CARD_IN_DISCARD_RANDOM";
    AIPointer[AIPointer["OPPONENT_MOST_TURNS_REMAINING"] = 13] = "OPPONENT_MOST_TURNS_REMAINING";
    AIPointer[AIPointer["OPPONENT_LEAST_TURNS_REMAINING"] = 14] = "OPPONENT_LEAST_TURNS_REMAINING";
    AIPointer[AIPointer["PLAYER_MOST_TURNS_REMAINING"] = 15] = "PLAYER_MOST_TURNS_REMAINING";
    AIPointer[AIPointer["PLAYER_LEAST_TURNS_REMAINING"] = 16] = "PLAYER_LEAST_TURNS_REMAINING";
})(AIPointer || (AIPointer = {}));
var Rarity;
(function (Rarity) {
    Rarity[Rarity["BASIC"] = 0] = "BASIC";
    Rarity[Rarity["COMMON"] = 1] = "COMMON";
    Rarity[Rarity["UNCOMMON"] = 2] = "UNCOMMON";
    Rarity[Rarity["RARE"] = 3] = "RARE";
    Rarity[Rarity["MYTHIC"] = 4] = "MYTHIC";
    Rarity[Rarity["LEGENDARY"] = 5] = "LEGENDARY";
    Rarity[Rarity["HAXOR"] = 6] = "HAXOR";
})(Rarity || (Rarity = {}));
export { Choices, AIPointer, Rarity };
