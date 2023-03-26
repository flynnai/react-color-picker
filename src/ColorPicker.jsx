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

// for `h` in [0,360], `s` in [0,1, `v` in [0,1]
function hsv2rgb(h, s, v) {
    let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return {
        r: Math.round(f(5) * 255),
        g: Math.round(f(3) * 255),
        b: Math.round(f(1) * 255),
    };
}

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

    const knobColor = hsv2rgb(
        selectedHue,
        knobPosition.x / 100,
        knobPosition.y / 100
    );

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

                    // value={selectedHue}
                    // onChange={(value, index) => setSelectedHue(parseInt(value))}
                />
            </div>
        </div>
    );
}

export default ColorPicker;
