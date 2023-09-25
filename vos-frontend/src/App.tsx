import * as React from "react";
import './App.css'
import Client from "vos-common/runtime/Client.ts";
import {ConnectionScreen} from "./components/ConnectionScreen";
import {WebSocket} from "vite";
import {PlayerView} from "./components/PlayerView";
import 'bootstrap/dist/css/bootstrap.min.css';

type AppProps = {

}

type AppState = {
    client?: Client
}

export class App extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props)
        this.state = {
            client: undefined
        }
    }

    render() {
        if (!this.state.client) {
            return (
                <ConnectionScreen onSubmit={(connString, user) => {
                    console.log("Connecting to " + connString)
                    let client = new Client(user)
                    client.setStateChangeHandler((cards, player, game) => {
                        this.forceUpdate()
                    })
                    client.setMessageHandler((msg) => {
                        alert(msg)
                    })
                    client.setDisconnectHandler(() => {
                        alert("Connection lost")
                        this.setState({client: undefined})
                    })
                    client.connect(connString)
                    this.setState({client: client})
                }}/>
            )
        } else {
            return (
                <PlayerView client={this.state.client} comp={this.state.client.state()} cancel={() => { this.setState({client: undefined})}}/>
            )
        }
    }
}
