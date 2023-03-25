import { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.scss";

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
                    x:
                        ((e.clientX - rect.left) / colorSquare.clientWidth) *
                        100,
                    y:
                        ((e.clientY - rect.top) / colorSquare.clientHeight) *
                        100,
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
            colorSquare.addEventListener("mousemove", mouseMoveHandler);
            colorSquare.addEventListener("mousedown", mouseDownHandler);
            window.addEventListener("mouseup", mouseUpHandler);
            return () => {
                colorSquare.removeEventListener("mousemove", mouseMoveHandler);
                colorSquare.removeEventListener("mousedown", mouseDownHandler);
                window.removeEventListener("mouseup", mouseUpHandler);
            };
        }
    }, []);

    console.log(knobPosition);
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
                    }}
                >
                    test&nbsp;
                </div>
                <div className={styles.whiteGradient}></div>
                <div className={styles.blackGradient}></div>
            </div>
            <div className={styles.hueWrapper}>
                <input
                    type="range"
                    min="0"
                    max="359"
                    className={styles.hueSlider}
                    value={selectedHue}
                    onChange={(e) => setSelectedHue(parseInt(e.target.value))}
                />
            </div>
            <div className={styles.alphaWrapper}>
                <input
                    type="range"
                    min="0"
                    max="255"
                    className={styles.alphaSlider}
                />
            </div>
        </div>
    );
}

export default ColorPicker;
