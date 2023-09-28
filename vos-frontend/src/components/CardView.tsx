import {CardState} from "vos-common/logic/gameplay/player/Player";
import React from "react";
import {Button} from "react-bootstrap";

type CardViewProps = {
    card: CardState
    chooseable: boolean,
    textOnly?: boolean
    onChoose: (card: CardState) => void
}

export class CardView extends React.Component<CardViewProps, {}> {
    render() {
        return (
            <div className="card" style={{
                width: "20vw",
                margin: "1%",
                verticalAlign: "top",
                padding: "1%",
            }}>
                <div className={`card-body rarity-${this.props.card.rarity}`} style={{
                    overflowY: "auto",
                }}>
                    <h5 className="card-title">{this.props.card.name}</h5>
                    {/*<h6 className="card-subtitle mb-2 text-muted">{this.props.power}</h6>*/}
                    {...this.props.card.text.split("\n").map((line) => {
                        return (<><p className="card-text">{line}</p>
                            <hr/>
                        </>)
                    })}
                    {this.props.card.props && (<p className="card-text">{JSON.stringify(this.props.card.props)}</p>)}
                </div>
                {!(this.props.textOnly ?? true) && (
                    <>
                        {
                            this.props.chooseable ? (
                                //    card footer that floats above the content
                                <div className="card-footer">
                                    <Button onClick={() => {
                                        this.props.onChoose(this.props.card)
                                    }}>Choose</Button>
                                </div>
                            ) : (
                                <div className={"card-footer"}>
                                    <Button disabled={true}>Choose</Button>
                                </div>
                            )
                        }
                    </>)}
            </div>
        )
    }
}