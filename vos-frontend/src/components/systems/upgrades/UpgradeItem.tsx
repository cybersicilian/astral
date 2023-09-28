import {UpgradeData} from "vos-common/logic/gameplay/player/systems/Upgrade";
import {Button} from "react-bootstrap";

export default function UpgradeItem(props: { frozen: boolean, buy: () => void, upgrade: UpgradeData }) {
    return (
        <tr>
            <td>{props.upgrade.name}<br/><small><i>{props.upgrade.description}</i></small></td>
                    <td>{
                        props.upgrade.cost.map((cost, index) => {
                            return (
                                <span key={index}>
                        {cost.amt} {cost.resource}
                                    {index < props.upgrade.cost.length - 1 ? <span> + </span> : <></>}
                    </span>
                            )
                        })
                    }</td>
                    <td>
                        <Button disabled={props.frozen || props.upgrade.locked} onClick={props.buy}>Buy</Button>
                    </td>
        </tr>
    )
}