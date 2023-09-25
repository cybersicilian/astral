import {CardArgs} from "../../gameplay/cards/CardArgs";

export interface ITriggerable {
    fireEvents(name: string, args?: CardArgs): void
}