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
                {this.props.client.religion ? (
                    <div>
                        <h3>{this.props.client.religion.name}</h3>
                        <br/>
                        {this.props.client.religion.structure.map((structure, index) => {
                            if (this.props.client.religion.slots[index]) {
                                return (
                                    <div key={index}>
                                        <h5>{structure.name}</h5>
                                        <p>Slot: {this.props.client.religion.slots[index].name}</p>
                                        <p>{this.props.client.religion.slots[index].description}</p>
                                    </div>
                                )
                            } else {
                                return (
                                    <div key={index}>
                                        <h5>{structure.name}</h5>
                                        <p>Slot: Empty</p>
                                    </div>
                                )
                            }
                        })}
                    </div>
                ) : (<b>You haven't formed a religion yet!</b>)
                }
            </div>
        )
    }
}