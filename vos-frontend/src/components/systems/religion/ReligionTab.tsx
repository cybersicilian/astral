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
                <h6>Instead of playing a card, you may slot a card into your religion.</h6>
                {this.props.client.getReligion() ? (
                    <div>
                        <h3>{this.props.client.getReligion().name}</h3>
                        <br/>
                        {this.props.client.getReligion().structure.map((structure, index) => {
                            if (this.props.client.getReligion().slots[index]) {
                                return (
                                    <div key={index}>
                                        <h5>{structure.name}</h5>
                                        <p>Slot: {this.props.client.getReligion().slots[index].name}</p>
                                        <p>{this.props.client.getReligion().slots[index].text}</p>
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