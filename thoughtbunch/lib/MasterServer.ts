import {WebSocket, WebSocketServer} from "ws";
import AbstractClient from "./rooms/AbstractClient";
import AbstractRoom from "./rooms/AbstractRoom";

export default class MasterServer {
    private serverObj: WebSocketServer | undefined = undefined
    private serverPort: number = 15912

    private logEntries: string[]
    private clients: { [key: string]: AbstractClient } = {}

    private rooms: { [key: string]: AbstractRoom } = {}

    constructor(port: number = 15912) {
        this.logEntries = []
        this.serverPort = port
    }

    static createName() {
        let name = [
            ["Critter", "Cole", "Cheddar", "Swiss", "Sewer", "Moist", "Crusty", "Crunchy", "Crispy", "Bam", "Bang", "Slam", "Meow", "Bark", "Grand", "Del", "Dip", "Rich", "Povert", "Rogue", "Joleto", "Tad", "Italian", "Spicy", "Salty", "Sweet", "Sour", "Bitter", "Stinky", "Irritating", "Meaty", "Cool", "Neato", "Awesome", "Sassy"],
            ["bug", "amole", "lotion", "bacon", "slice", "sliver", "fluid", "myn", "ian", "jess", "tad", "Loaf", "Crust", "Crunch", "Crisp", "Ioli", "Head", "Ino", "Pants", "Zilla", "Shirt", "Shoes", "Hat", "Glove", "Sock", "Spaghetti", "Oritto", "Ravioli", "Gnocchi", "Chilada", "Pierogi", "Burrito", "Taco", "Enchilada", "Tamale", "Changa", "Dilla", "Nachos", "Tilla", "Chip", "Salsa", "Guacamole", "Asaurus", "Eratops"],
            [" Mc", " ", " ", " ", " ", " ", " ", " ", " Mac", " O'"],
            ["Pan", "Tad", "Crap", "Gene", "Friendly", "Spicy", "Hate", "Spinach", "Slam", "Magic", "Eraser", "Bougie", "Ball", "Supremo", "Bean", "Burger", "Bread", "Biscuit", "Bacon", "Bun", "Biscuit", "Burger", "Bread", "Kitty", "Wood", "Morning", "Soft", "Hard", "Raging", "", ""],
            ["Plumbing", "Orama", "Adic", "Tastic", "Full", "Loaf", "Fruit", "Table", "Chair", "Brian", "Brain", "Atomy", "Acist", "Ologist", "Doofus", "Dorkus", "Itis", "Person", "Biden", "Trump", "Obama", "Bush", "Clinton", "Reagan", "Carter", "Folk", "Ford", "Sandal", "Muncher", "Potato", "Whiskey", "Bourbon"]
        ].map((name, index) => {
            let select = name[Math.floor(Math.random() * name.length)]
            if (index > 0 && !select.startsWith(" ")) {
                select = select.toLowerCase()
            }
            return select
        }).join("")
        return name.split(" ").map((s) => s[0].toUpperCase() + s.substring(1).toLowerCase()).join(" ")
    }

    init() {
        this.serverObj = new WebSocketServer({
            port: this.serverPort
        })
    }
}