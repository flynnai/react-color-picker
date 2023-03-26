import { useEffect, useState } from "react";
import styles from "./App.module.scss";
import ColorPicker from "./ColorPicker";
import HexInput from "./HexInput";
import { hex2rgb, rgb2Hex } from "./utils";

const randomChannel = () => Math.floor(Math.random() * 256);
function App() {
    const [color, setColor] = useState({
        r: randomChannel(),
        g: randomChannel(),
        b: randomChannel(),
        a: 0xff,
    });
    useEffect(() => {
        document.body.style.backgroundColor = `rgba(${color.r},${color.g},${
            color.b
        },${color.a / 0xff})`;
    });

    return (
        <div
            className={styles.main}
            style={{
                backgroundColor: `rgba(${color.r},${color.g},${color.b},${
                    color.a / 0xff
                })`,
            }}
        >
            <ColorPicker width="500px" value={color} onChange={setColor} />

            <div className={styles.windowRight}>
                <h1>React Color Picker</h1>
                <p>
                    In true Reactive style, the component state is controlled
                    via <code>value</code> and <code>onChange</code> handlers.
                    Notice that the value below changes with the color, and how
                    editing it changes the selector.
                </p>
                <HexInput
                    value={rgb2Hex(color.r, color.g, color.b)}
                    setValue={(newVal) => {
                        setColor({ ...color, ...hex2rgb(newVal) });
                    }}
                    setAlpha={() => null}
                    hexInputRef={() => {}}
                />
            </div>
        </div>
    );
}

export default App;
