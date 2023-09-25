export var CardAction;
(function (CardAction) {
    CardAction[CardAction["PLAY"] = 0] = "PLAY";
    CardAction[CardAction["DISCARD"] = 1] = "DISCARD";
    CardAction[CardAction["GIVE"] = 2] = "GIVE";
    CardAction[CardAction["SELECT"] = 3] = "SELECT";
})(CardAction || (CardAction = {}));
