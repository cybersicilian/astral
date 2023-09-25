//a log entry is a react component that formats whatever is in between its tags

import {CardView} from "./CardView";
import PlayerCard from "./PlayerCard";
import {useState} from "react";
import Client from "vos-common/runtime/Client";

export default function LogEntry(props: { client: Client, content: string }) {
    let content = props.content;

    const [value, setValue] = useState(-1);

    let cards = [];
    //match any content in between §§ and §§
    let matches = content.match(/§§(.*?)§§/g);
    let elements = [];
    //iterate over the matches
    if (!matches) {
        elements.push(content)
    } else {
        matches.forEach((match, id) => {
            //push any content before this match to elements if this is the first match
            let index = content.indexOf(match);
            if (index > 0 && id == 0) {
                elements.push(<span dangerouslySetInnerHTML={{__html: content.substring(0, index)}}></span>);
            }


            let bits = match.substring(2, match.length - 2).split("§");
            //the first bit is the text to display
            //the second bit is card or player (show a CardView or a PlayerCard)
            //the third bit is the state to pass in
            let text = bits[0];
            let type = bits[1];
            let state = bits[2];
            let stateObj = JSON.parse(state);
            if (type === "card") {
                cards.push(<CardView key={cards.length}
                                     chooseable={false}
                                     onChoose={() => {
                                     }}
                                     card={stateObj}/>);
            } else {
                cards.push(<PlayerCard key={cards.length}
                                       color={"red"}
                                       currentTurn={false}
                                       host={false}
                                       client={props.client}
                                       player={stateObj}/>);
            }
            elements.push(<a href={"#"} onMouseEnter={() => {
                setValue(id)
            }}  onMouseLeave={() => {
                setValue(-1)
            }} dangerouslySetInnerHTML={{__html: text}}></a>)

            //push any content between this match and the next match to elements
            let nextIndex = content.indexOf(matches[id + 1]);
            if (nextIndex > 0) {
                elements.push(<span
                    dangerouslySetInnerHTML={{__html: content.substring(index + match.length, nextIndex)}}></span>);
            } else {
                elements.push(<span dangerouslySetInnerHTML={{__html: content.substring(index + match.length)}}></span>);
            }
        })
    }
    return (
        <>
            {...elements}
            {value >= 0 && cards[value]}
        </>
    )
}