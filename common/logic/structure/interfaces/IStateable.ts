import {AsJson} from "../utils/state/AbstractState";
import {CardArgs} from "../../gameplay/cards/CardArgs";

export interface IStateable<State> {
    toState(args: CardArgs): AsJson<State>&State
}