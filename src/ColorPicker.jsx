import { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.scss";
import ReactSlider from "react-slider";

// for `h` in [0,360], `s` in [0,1, `v` in [0,1]
const hsv2rgb = (h, s, v) => {
    let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return {
        r: Math.round(f(5) * 255),
        g: Math.round(f(3) * 255),
        b: Math.round(f(1) * 255),
    };
};

const rgb2Hex = (r, g, b) =>
    `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
        .toString(16)
        .padStart(2, "0")}`;

function ColorPicker() {
    const [selectedHue, setSelectedHue] = useState(0);
    const [selectedAlpha, setSelectedAlpha] = useState(0);
    const colorSquareRef = useRef(null);
    const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 }); // as percent

    useEffect(() => {
        const colorSquare = colorSquareRef.current;
        if (colorSquare) {
            let isMouseDown = false;

            const updateKnobPosition = (e) => {
                const rect = colorSquare.getBoundingClientRect();

                setKnobPosition({
                    x: Math.max(
                        0,
                        Math.min(
                            100,
                            ((e.clientX - rect.left) /
                                colorSquare.clientWidth) *
                                100
                        )
                    ),
                    y: Math.max(
                        0,
                        Math.min(
                            100,
                            ((e.clientY - rect.top) /
                                colorSquare.clientHeight) *
                                100
                        )
                    ),
                });
            };
            const mouseMoveHandler = (e) => {
                if (isMouseDown) {
                    updateKnobPosition(e);
                }
            };
            const mouseDownHandler = (e) => {
                isMouseDown = true;
                updateKnobPosition(e);
            };
            const mouseUpHandler = (e) => {
                isMouseDown = false;
            };
            window.addEventListener("mousemove", mouseMoveHandler);
            colorSquare.addEventListener("mousedown", mouseDownHandler);
            window.addEventListener("mouseup", mouseUpHandler);
            return () => {
                window.removeEventListener("mousemove", mouseMoveHandler);
                colorSquare.removeEventListener("mousedown", mouseDownHandler);
                window.removeEventListener("mouseup", mouseUpHandler);
            };
        }
    }, []);

    const knobColor = hsv2rgb(
        selectedHue,
        knobPosition.x / 100,
        knobPosition.y / 100
    );

    return (
        <div className={styles.main}>
            <div className={styles.topRow}>
                <div
                    className={styles.colorSquare}
                    style={{
                        backgroundColor: `hsl(${selectedHue}, 100%, 50%)`,
                    }}
                    ref={colorSquareRef}
                >
                    <div
                        className={styles.knob}
                        style={{
                            left: knobPosition.x + "%",
                            top: knobPosition.y + "%",
                            backgroundColor: `rgb(${knobColor.r}, ${knobColor.g}, ${knobColor.b})`,
                            borderColor:
                                knobPosition.y < 50 ? "white" : "black",
                        }}
                    >
                        &nbsp;
                    </div>
                    <div className={styles.whiteGradient}></div>
                    <div className={styles.blackGradient}></div>
                </div>
                <div className={styles.hueWrapper}>
                    <ReactSlider
                        className={styles.hueSlider}
                        thumbClassName={styles.hueSliderThumb}
                        min={0}
                        max={359}
                        value={selectedHue}
                        onChange={(value, index) =>
                            setSelectedHue(parseInt(value))
                        }
                    />
                </div>
                <div className={styles.alphaWrapper}>
                    <div className={styles.alphaCheckers}></div>
                    <div
                        className={styles.alphaGradient}
                        style={{
                            background: `linear-gradient(to right, transparent, hsl(${selectedHue}, 100%, 50%))`,
                        }}
                    ></div>

                    <ReactSlider
                        className={styles.alphaSlider}
                        thumbClassName={styles.alphaSliderThumb}
                        min={0}
                        max={255}
                        value={selectedAlpha}
                        onChange={(value, index) =>
                            setSelectedAlpha(parseInt(value))
                        }
                    />
                </div>
            </div>
            <div className={styles.bottomRow}>
                <input
                    type="text"
                    value={rgb2Hex(
                        knobColor.r,
                        knobColor.g,
                        knobColor.b
                    ).toUpperCase()}
                    className={styles.hexInput}
                ></input>
            </div>
        </div>
    );
}

export default ColorPicker;
