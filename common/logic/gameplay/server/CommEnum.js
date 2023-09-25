export var CommEnum;
(function (CommEnum) {
    //admin
    CommEnum[CommEnum["CONNECTED"] = 0] = "CONNECTED";
    CommEnum[CommEnum["DISCONNECTED"] = 1] = "DISCONNECTED";
    CommEnum[CommEnum["SET_NAME"] = 2] = "SET_NAME";
    CommEnum[CommEnum["UPDATE_PLAYER_STATE"] = 3] = "UPDATE_PLAYER_STATE";
    CommEnum[CommEnum["SERVER_MSG"] = 4] = "SERVER_MSG";
    //host commands
    CommEnum[CommEnum["ADD_BOT"] = 5] = "ADD_BOT";
    CommEnum[CommEnum["KICK_PLAYER"] = 6] = "KICK_PLAYER";
    //upgrade shop
    CommEnum[CommEnum["TRANSFER_UPGRADE_SHOP"] = 7] = "TRANSFER_UPGRADE_SHOP";
    CommEnum[CommEnum["BUY_UPGRADE"] = 8] = "BUY_UPGRADE";
    //marketplace
    CommEnum[CommEnum["TRANSFER_MARKETPLACE"] = 9] = "TRANSFER_MARKETPLACE";
    //turn phases
    CommEnum[CommEnum["DRAW_CARD"] = 10] = "DRAW_CARD";
    CommEnum[CommEnum["PLAY_CARD"] = 11] = "PLAY_CARD";
    CommEnum[CommEnum["GIVE_CARD"] = 12] = "GIVE_CARD";
    CommEnum[CommEnum["DISCARD_TO_HAND"] = 13] = "DISCARD_TO_HAND";
    //choices
    CommEnum[CommEnum["GET_CHOICES"] = 14] = "GET_CHOICES";
    CommEnum[CommEnum["CHOICE_LIST"] = 15] = "CHOICE_LIST";
    //error codes
    CommEnum[CommEnum["ERROR"] = 16] = "ERROR";
})(CommEnum || (CommEnum = {}));
