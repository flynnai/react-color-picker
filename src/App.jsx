import { useState } from "react";
import styles from "./App.module.scss";
import ColorPicker from "./ColorPicker";

function App() {
    const [color, setColor] = useState({ r: 0, g: 0, b: 120, a: 0xff });
    return (
        <div
            className={styles.main}
            style={{
                backgroundColor: `rgba(${color.r},${color.g},${color.b},${
                    color.a / 0xff
                })`,
            }}
        >
            <ColorPicker width="500px" color={color} setColor={setColor} />
        </div>
    );
}

export default App;
