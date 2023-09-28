import React from "react";
import Client from "vos-common/runtime/Client";
import {Button} from "react-bootstrap";
import UpgradeItem from "./UpgradeItem";

type UpgradeShopProps = {
    client: Client,
    canBuy: boolean
}

export default class UpgradeTab extends React.Component<UpgradeShopProps, {}> {
    constructor(props: UpgradeShopProps) {
        super(props)
    }

    render() {
        return (
            <div>
                <h5>Upgrade Shop</h5>
                <h6>Instead of playing a card, you may purchase an upgrade</h6>
                <table>
                    <thead>
                    </thead>
                    <tbody>
                    {this.props.client.getUpgrades().map((upgrade, index) => {
                        return (<UpgradeItem buy={() => {
                            this.props.client.buyUpgrade(index)
                        }} frozen={!this.props.canBuy} upgrade={upgrade}/>)
                    })}
                    </tbody>
                </table>
            </div>
        )
    }

}