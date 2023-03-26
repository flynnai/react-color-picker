import { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.scss";
import ReactSlider from "react-slider";

const hslToRgb = (h, s, l) => {
    let r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};

const getKnobColor = (hue, x, y) => {
    let knobColor = hslToRgb(hue / 360, 1, 0.5);
    const whiteWeight = (100 - x) / 100;
    const blackWeight = (100 - y) / 100;
    const weightedAvg = (weight, a, b) => weight * a + (1 - weight) * b;
    knobColor.r = Math.floor(
        weightedAvg(
            blackWeight,
            0x00,
            weightedAvg(whiteWeight, 0xff, knobColor.r)
        )
    );
    knobColor.g = Math.floor(
        weightedAvg(
            blackWeight,
            0x00,
            weightedAvg(whiteWeight, 0xff, knobColor.g)
        )
    );
    knobColor.b = Math.floor(
        weightedAvg(
            blackWeight,
            0x00,
            weightedAvg(whiteWeight, 0xff, knobColor.b)
        )
    );

    return knobColor;
};

function ColorPicker() {
    const [selectedHue, setSelectedHue] = useState(0);
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

    const knobColor = getKnobColor(selectedHue, knobPosition.x, knobPosition.y);

    return (
        <div className={styles.main}>
            <div
                className={styles.colorSquare}
                style={{ backgroundColor: `hsl(${selectedHue}, 100%, 50%)` }}
                ref={colorSquareRef}
            >
                <div
                    className={styles.knob}
                    style={{
                        left: knobPosition.x + "%",
                        top: knobPosition.y + "%",
                        // backgroundColor: `hsl(${selectedHue}, ${
                        //     knobPosition.x
                        // }%, ${
                        //     knobPosition.y *
                        //     (0.5 + ((100 - knobPosition.x) / 100) * 0.5)
                        // }%)`,
                        backgroundColor: `rgb(${knobColor.r}, ${knobColor.g}, ${knobColor.b})`,
                        borderColor: knobPosition.y < 50 ? "white" : "black",
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
                    onChange={(value, index) => setSelectedHue(parseInt(value))}
                />
            </div>
            <div className={styles.alphaWrapper}>
                <div
                    className={styles.alphaGradient}
                    style={{
                        background:
                            "linear-gradient(to right, transparent, black)",
                    }}
                ></div>
                <ReactSlider
                    className={styles.alphaSlider}
                    thumbClassName={styles.alphaSliderThumb}
                    min={0}
                    max={255}

                    // value={selectedHue}
                    // onChange={(value, index) => setSelectedHue(parseInt(value))}
                />
            </div>
        </div>
    );
}

export default ColorPicker;
