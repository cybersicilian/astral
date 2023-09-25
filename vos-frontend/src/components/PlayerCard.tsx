import React from "react";
import {PlayerState} from "vos-common/logic/gameplay/player/Player";
import Client from "vos-common/runtime/Client";
import {Button} from "react-bootstrap";

type PlayerCardProps = {
    player: PlayerState,
    color: string,
    currentTurn: boolean,
    host: boolean,
    client: Client,

    chooseable?: boolean,
    onChoose?: (player: PlayerState) => void
}

export default class PlayerCard extends React.Component<PlayerCardProps, {}> {
    constructor(props: PlayerCardProps) {
        super(props)
    }

    render() {
        return (
            <div style={{
                backgroundColor: this.props.color,
                color: "white",
                flexBasis: "20%",
                padding: "1%",
                margin: "1%",
                borderRadius: "5px",
                border: this.props.currentTurn ? "4px solid gold" : "none",
            }}>
                <h6>{this.props.player.name}{this.props.player.you && (<b> (You)</b>)}</h6>
                {this.props.chooseable ? (
                    <Button onClick={() => {
                        this.props.onChoose(this.props.player)
                    }}>Choose</Button>
                ) : (
                    <Button disabled={true}>Choose</Button>
                )}
                {/* kick player button; disabled for now */}
                {/*{(!this.props.player.you && this.props.host) && (*/}
                {/*    <Button variant={"danger"} onClick={() => {*/}
                {/*        this.props.client.kickPlayer(this.props.player.order)*/}
                {/*    }}>Kick</Button>*/}
                {/*)}*/}
                <hr/>
                <div style={{
                    //    align text to the left
                    textAlign: "left"
                }}>
                    <span>Cards: {this.props.player.cards}/{this.props.player.handsize}<br/></span>
                    {this.props.player.skipped > 0 && (<span>Skipped Turns: {this.props.player.skipped}<br/></span>)}
                    <span>Turns: {this.props.player.turnsRemaining}<br/></span>
                    {this.props.player.canWin && (
                        <span>Victory in Reach! ({this.props.player.winReason})<br/></span>)}
                    {Object.keys(this.props.player.props).length > 0 && (
                        <><span>Properties:<br/></span>
                            {Object.keys(this.props.player.props).map((key) => {
                                if (typeof this.props.player.props[key] === "object") {
                                    return null;
                                }
                                if (typeof this.props.player.props[key] === "object") {
                                    return null;
                                }
                                return (<span>{key}: {this.props.player.props[key] as string|number|boolean}<br/></span>)
                            })}
                        </>)}
                </div>
            </div>
        )
    }

}