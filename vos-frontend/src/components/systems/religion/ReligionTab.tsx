import Client from "vos-common/runtime/Client";
import React from "react";

type ReligionTabProps = {
    client: Client
}

export default class ReligionTab extends React.Component<ReligionTabProps, {}> {
    constructor(props: ReligionTabProps) {
        super(props)
    }

    render() {
        return (
            <div>
                <h5>Religion</h5>
                
            </div>
        )
    }
}