import {CardState, PlayerState} from "vos-common/logic/gameplay/player/Player";
import {GameState} from "vos-common/logic/structure/utils/CommEnum";
import React from "react";
import Client, {CompositeState} from "vos-common/runtime/Client";
import {Button, Col, Container, Row, Tab, TabPane, Tabs} from "react-bootstrap";
import {CardView} from "./CardView";
import PlayerCard from "./PlayerCard";
import {Choices} from "vos-common/logic/structure/utils/CardEnums";
import LogEntry from "./LogEntry";
import UpgradeTab from "./systems/upgrades/UpgradeTab";
import {TurnInterrupt} from "vos-common/logic/structure/utils/TurnInterrupt";
import ReligionTab from "./systems/religion/ReligionTab";


type PlayerViewProps = {
    comp: CompositeState,
    client: Client,
    cancel: () => void
}

//no yellow
//colors will have white text on them
const BG_COLORS = [
    "red",
    "blue",
    "green",
    "aquamarine",
    "purple",
    "orange",
    "brown",
    "black",
    "pink",
    "darkred"
]

enum TurnState {
    Draw,
    Give,
    Play,
    Discard,
    NotTurn
}

enum GiftingState {
    SelectingCard,
    SelectingPlayer,
    NotGifting
}

enum PlayState {
    SelectingCard,
    SelectingChoices,
    Resolving,
    NotPlaying
}

type PlayerViewState = {
    //gifting parameters
    giftingState?: GiftingState,
    selectedCardForGifting?: number

    //playing parameters
    playState?: PlayState,
    selectedCardForPlaying?: number,
    selectedChoicesForPlaying?: number[][],

    playAreaTab?: string
}

export class PlayerView extends React.Component<PlayerViewProps, PlayerViewState> {
    constructor(props: PlayerViewProps) {
        super(props)
        this.state = {
            giftingState: GiftingState.NotGifting,
            selectedCardForGifting: -1,
            playState: PlayState.NotPlaying,
            selectedCardForPlaying: -1,
            selectedChoicesForPlaying: [],
            playAreaTab: "discard"
        }
    }

    //on mount
    componentDidMount() {
        this.props.client.setActiveCardHandler(() => {
            this.setState({playState: PlayState.SelectingChoices})
        })
    }

    render() {
        if (!this.props.comp.player || !this.props.comp.game || !this.props.comp.cards) {
            //loading indicator
            return (
                <div>
                    <h2>Loading...</h2><br/>
                    <Button onClick={() => {
                        this.props.cancel()
                    }}>Cancel</Button>
                </div>
            )
        }
        if (this.props.comp.game.players.length < this.props.comp.game.config.minPlayers) {
            return (
                <div>
                    <h2>Waiting for more players...</h2><br/>
                    <h4>{this.props.comp.game.players.length} / {this.props.comp.game.config.minPlayers}</h4>
                    <Button onClick={() => {
                        this.props.cancel()
                    }}>Cancel</Button>
                </div>
            )
        }

        //this is the turn's state machine
        let state: TurnState = TurnState.NotTurn
        if (parseInt(this.props.comp.game.activeTurn) == this.props.comp.player.order) {
            state = TurnState.Draw
            if (this.props.comp.game.turnPhase == 1) {
                state = TurnState.Give
                if (this.state.giftingState == GiftingState.NotGifting) {
                    this.setState({giftingState: GiftingState.SelectingCard})
                } else if (this.state.giftingState == GiftingState.SelectingCard) {
                    if (this.state.selectedCardForGifting > -1) {
                        this.setState({giftingState: GiftingState.SelectingPlayer})
                    }
                }
            }
            if (this.props.comp.game.turnPhase == 2) {
                state = TurnState.Play
                if (this.state.playState == PlayState.NotPlaying) {
                    this.setState({playState: PlayState.SelectingCard})
                } else if (this.state.playState == PlayState.SelectingCard) {
                    if (this.props.client.hasActiveCard()) {
                        //move to selecting choices
                        this.setState({playState: PlayState.SelectingChoices})
                    }
                } else if (this.state.playState == PlayState.SelectingChoices) {
                    let allChoicesMade = !this.props.client.nextChoiceToMake();
                    if (allChoicesMade) {
                        //move to resolving
                        this.setState({playState: PlayState.Resolving})
                    }
                } else {
                    //play the selected card with the selected choices
                    this.props.client.playActiveCard()
                }
            } else {
                if (this.state.playState != PlayState.NotPlaying) {
                    this.setState({playState: PlayState.NotPlaying})
                }
            }
            if (this.props.comp.game.turnPhase == 3) {
                state = TurnState.Discard
            }
        }

        //useful flags for the turn to shorthand logic
        let NEXT_CHOICE = this.props.client.nextChoiceToMake()


        //you can pick a card if you are the selecting card stage of the gifting state
        let FLAG_CAN_PICK_CARD = false
        let FLAG_CAN_PICK_CARD_IN_YARD = FLAG_CAN_PICK_CARD ||
            (state == TurnState.Play && this.state.playState == PlayState.SelectingChoices &&
                NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.CARD_IN_DISCARD))
        let FLAG_CAN_PICK_CARD_IN_HAND = FLAG_CAN_PICK_CARD || (state == TurnState.Give && this.state.giftingState == GiftingState.SelectingCard) ||
            (state == TurnState.Play && this.state.playState == PlayState.SelectingCard) ||
            (state == TurnState.Play && this.state.playState == PlayState.SelectingChoices
                && NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.CARD_IN_HAND) ||
                (state == TurnState.Discard))
        let FLAG_CAN_PICK_PLAYER = (state == TurnState.Play && this.state.playState == PlayState.SelectingChoices
            && NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.PLAYER))
        let FLAG_CAN_PICK_OPPONENT = FLAG_CAN_PICK_PLAYER ||
            (state == TurnState.Give && this.state.giftingState == GiftingState.SelectingPlayer) ||
            (state == TurnState.Play && this.state.playState == PlayState.SelectingChoices
                && NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.OPPONENT))

        //the top bar should be the player's name, whose turn it is, and what turn phase it is on (and the deck stats)
        //on the right should be all the players and their state
        return (
            <Container style={{
                height: "100vh",
                width: "100vw",
                margin: 0,
                display: "flex",
                flexDirection: "column",
            }}>
                <Row style={{
                    //    center align content vertically
                    alignItems: "center",
                    justifyContent: "center",
                    flexBasis: "80px",
                    flexGrow: 0,
                    flexShrink: 0
                }}>
                    <Col md={2}>
                        <h4>{this.props.comp.player.name}</h4>
                    </Col>
                    <Col md={2}>
                        {this.props.comp.game.players[this.props.comp.game.activeTurn].name}'s turn
                    </Col>
                    <Col md={2}>
                        {state == TurnState.NotTurn && (<>
                            {this.props.client.remainingInterrupts() > 0 && (<>
                                <h4>
                                    Select {this.props.client.remainingInterrupts()} more card{this.props.client.remainingInterrupts() > 1 ? "s" : ""} for this ability
                                </h4>
                            </>)}
                        </>)}
                        {state == TurnState.Draw && (<>
                            <Button onClick={() => this.props.client.drawCard()}>Draw Card</Button>
                        </>)}
                        {state == TurnState.Give && (<>
                            <h4>Gifting Phase</h4><br/>
                            {this.state.giftingState == GiftingState.SelectingCard && (<h6>Select a card</h6>)}
                            {this.state.giftingState == GiftingState.SelectingPlayer && (<h6>Select a player</h6>)}
                        </>)}
                        {state == TurnState.Play && (<><h4>Play Phase</h4><br/>
                            {this.state.playState == PlayState.SelectingCard && (<h6>Select a card</h6>)}
                            {this.state.playState == PlayState.SelectingChoices && (<h6>Select
                                choices<br/>{NEXT_CHOICE ? Object.values(Choices)[NEXT_CHOICE.choice] : ""}<br/>({this.props.client.choiceStr()})
                            </h6>)}
                            {this.state.playState == PlayState.Resolving && (<h6>Resolving</h6>)}
                        </>)}
                        {state == TurnState.Discard && (<h4>Discard Phase</h4>)}
                        {/*{["Draw", "Give", "Play", "Discard"][this.props.comp.game.turnPhase] + " Phase"}*/}
                    </Col>
                    <Col md={2}>
                        {this.props.comp.game.deck} cards in deck<br/>
                        {this.props.comp.game.discard.length} cards in discard
                    </Col>
                    <Col md={2}>
                        {this.props.comp.player.host && (
                            <Button onClick={() => {
                                this.props.client.addBot()
                            }}>Add Bot</Button>
                        )}
                        <Button variant={"danger"} onClick={() => {
                            this.props.client.disconnect()
                            this.props.cancel()
                        }}>Leave</Button>
                    </Col>
                </Row>
                <Row style={{
                    //cover the page with the row
                    width: "100%",
                    flexBasis: "40vh",
                    flexShrink: 1,
                    flexGrow: 0,
                }}>
                    <Col md={3} style={{
                        overflowY: "scroll",
                        maxHeight: "40vh"
                    }}>
                        <div>

                            {/*     in here is all the player data */}
                            {this.props.comp.game.players.map((player: PlayerState, index: number) => {
                                return (
                                    <PlayerCard key={index}
                                                player={player}
                                                color={BG_COLORS[index]}
                                                currentTurn={parseInt(this.props.comp.game.activeTurn) == index}
                                                host={this.props.comp.player.host}
                                                client={this.props.client}
                                                chooseable={FLAG_CAN_PICK_PLAYER || (!player.you && FLAG_CAN_PICK_OPPONENT)}
                                                onChoose={(playerState) => {
                                                    if (state == TurnState.Give && this.state.giftingState == GiftingState.SelectingPlayer) {
                                                        this.props.client.giveCard(this.state.selectedCardForGifting, index)
                                                        this.setState({
                                                            giftingState: GiftingState.NotGifting,
                                                            selectedCardForGifting: -1
                                                        })
                                                    } else if (state == TurnState.Play) {
                                                        if (this.state.playState == PlayState.SelectingChoices && NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.PLAYER || NEXT_CHOICE.choice === Choices.OPPONENT)) {
                                                            this.props.client.makeNextChoice(index)
                                                            this.forceUpdate()
                                                        }
                                                    }
                                                }}
                                    />
                                )
                            })}
                        </div>
                    </Col>
                    <Col md={9}>
                        {/*    game play area*/}
                        <Row style={{
                            border: "4px solid black",
                            borderRadius: "5px",
                            height: "100%"
                        }}>
                            <Tabs
                                id="game-area"
                                activeKey={this.state.playAreaTab}
                                onSelect={(k) => {
                                    this.setState({playAreaTab: k})
                                }}
                                className="mb-3 playArea-tabs"
                                fill>
                                <Tab eventKey="discard" title="Discard">
                                    <div className={"discardHolder"}>
                                        {
                                            [...this.props.comp.game.discard].reverse().map((card: CardState, index: number) => {
                                                return (
                                                    <CardView chooseable={FLAG_CAN_PICK_CARD_IN_YARD}
                                                              onChoose={(card) => {
                                                                  if (state == TurnState.Play) {
                                                                      if (this.state.playState == PlayState.SelectingChoices && NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.CARD_IN_DISCARD)) {
                                                                          this.props.client.makeNextChoice(this.props.comp.game.discard.length - (index + 1))
                                                                          this.forceUpdate()
                                                                      }
                                                                  }
                                                              }}
                                                              key={this.props.comp.game.discard.length - (index + 1)}
                                                              card={card}/>
                                                )
                                            })
                                        }
                                    </div>
                                </Tab>
                                {Object.keys(this.props.comp.game.uis).map((ui, index) => {
                                    // console.log(this.props.comp.game.uis)
                                    if (this.props.comp.game.uis[ui]) {
                                        switch (ui) {
                                            case "upgrade":
                                                return (<Tab eventKey={"upgrades"} title={"Upgrade Shop"}>
                                                    <UpgradeTab
                                                        canBuy={(state == TurnState.Play && this.state.playState == PlayState.SelectingCard)}
                                                        client={this.props.client}/>
                                                </Tab>)
                                            case "religion":
                                                return (
                                                    <Tab eventKey={"religion"} title={"Religion"}>
                                                        <ReligionTab client={this.props.client}/>
                                                    </Tab>
                                                )
                                        }
                                    }
                                })}
                                <Tab eventKey="logs" title="Game Logs">
                                    <div className={"gameLogs"}>
                                        <pre>
                                            {this.props.comp.game.logs.map((log, index) => {
                                                return (
                                                    <><LogEntry client={this.props.client} content={log} key={index}></LogEntry><br/></>
                                                )
                                            })}
                                        </pre>
                                    </div>
                                </Tab>
                            </Tabs>
                        </Row>
                    </Col>
                </Row>

                <Row style={{
                    flexBasis: "40vh",
                    flexGrow: 2,
                    width: "98vw"
                }}>
                    <div className={"cardHolder"}>
                        {
                            this.props.comp.cards.map((card: CardState, index: number) => {
                                return (
                                    <CardView
                                        textOnly={false}
                                        selectedTab={this.state.playAreaTab}
                                        chooseable={(FLAG_CAN_PICK_CARD_IN_HAND &&
                                            ((!(this.state.playState == PlayState.SelectingChoices && index == this.state.selectedCardForPlaying) && (card.playable || !(this.state.playState == PlayState.SelectingCard && state == TurnState.Play))))) ||
                                            ((state == TurnState.NotTurn && this.props.comp.player.interrupts.length > 0 && !this.props.client.choseInterrupt(index))) ||
                                            ((state == TurnState.Play && this.state.playState == PlayState.SelectingCard && this.state.playAreaTab == "religion" && this.props.client.cachedReligion().validity[index]))}
                                        onChoose={(card) => {
                                            if (state == TurnState.Give) {
                                                this.setState({
                                                    giftingState: GiftingState.SelectingPlayer,
                                                    selectedCardForGifting: index
                                                })
                                            } else if (state == TurnState.Play) {
                                                if (this.state.playState == PlayState.SelectingCard && this.state.playAreaTab == "religion") {
                                                    this.props.client.addReligiousTenant(index)
                                                } else if (this.state.playState == PlayState.SelectingCard && card.playable) {
                                                    this.props.client.selectCardToPlay(index)
                                                    this.setState({
                                                        selectedCardForPlaying: index
                                                    })
                                                } else if (this.state.playState == PlayState.SelectingChoices && NEXT_CHOICE && (NEXT_CHOICE.choice === Choices.CARD_IN_HAND)) {
                                                    this.props.client.makeNextChoice(index)
                                                    this.forceUpdate()
                                                }
                                            } else if (state == TurnState.Discard) {
                                                this.props.client.discardToHandSize(index)
                                            } else if (state == TurnState.NotTurn) {
                                                this.props.client.addInterrupt(index)
                                                this.setState({})
                                            }
                                        }}
                                        key={index}
                                        card={card}/>
                                )
                            })
                        }
                    </div>
                </Row>
            </Container>
        )

    }
}