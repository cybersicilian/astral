import * as React from "react";
import Client from "vos-common/runtime/Client";

type ConnectionScreenProps = {
    onSubmit: (connString: string, user: string) => void
}

type ConnectionScreenState = {
    connString?: string,
    user?: string
}

export class ConnectionScreen extends React.Component<ConnectionScreenProps, ConnectionScreenState> {
    constructor(props: ConnectionScreenProps) {
        super(props)
        this.state = {
            connString: undefined,
            user: undefined
        }
    }

    render() {
        //the connection screen provides a place to input an ip and port
        //it then passes that to the main app
        return (
            <div>
                <h1>The Valley of Sadness</h1>
                <h4>Now with extra crap!</h4>
                <form onSubmit={(e) => {
                    e.preventDefault()
                    let connString = this.state.connString ?? ""
                    let user = this.state.user ?? ""
                    if (connString.length == 0) { connString = "wss://vos-server.onrender.com" }
                    this.props.onSubmit(connString, user)
                }}>
                    <input type="text" name="user" placeholder="username" onChange={(event) => {
                        //@ts-ignore
                        this.setState({ user: (event.target as HTMLInputElement).value })
                    }} />
                    <input type="text" name="connString" placeholder="ip:port" onChange={(event) => {
                        //@ts-ignore
                        this.setState({ connString: (event.target as HTMLInputElement).value })
                    }}/>
                    <input type="submit" value="Connect" />
                </form>
            </div>
        )
    }
}