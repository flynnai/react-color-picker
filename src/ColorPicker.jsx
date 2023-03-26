import { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.scss";
import ReactSlider from "react-slider";
import CopyIcon from "./CopyIcon";
import { ReactComponent as CheckMark } from "./circleGreenCheckMark.svg";
import HexInput from "./HexInput";
import { hex2rgb, hsv2rgb, rgb2Hex, rgb2hsv } from "./utils";

function ColorPicker({ width, value: initValue, onChange: componentOnChange }) {
    const initColorHsv = rgb2hsv(initValue.r, initValue.g, initValue.b);
    const [selectedHue, setSelectedHue] = useState(initColorHsv.h);
    const [selectedAlpha, setSelectedAlpha] = useState(initValue.a);
    const colorSquareRef = useRef(null);
    const hexInputRef = useRef(null);
    const [knobPosition, setKnobPosition] = useState({
        x: initColorHsv.s * 100,
        y: initColorHsv.v * 100,
    }); // as percent
    const [justCopied, setJustCopied] = useState(false);

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

    // Update controlled state on interior state change
    useEffect(() => {
        const { r, g, b } = knobColor;
        componentOnChange({ r, g, b, a: selectedAlpha });
    }, [knobColor.r, knobColor.g, knobColor.b, selectedAlpha]);

    // Update self if input value changed
    useEffect(() => {
        setSelectedAlpha(initValue.a);
        const { h, s, v } = rgb2hsv(initValue.r, initValue.g, initValue.b);
        setSelectedHue(h);
        setKnobPosition({ x: s * 100, y: v * 100 });
    }, [initValue]);

    const handleHexInputChange = (newVal) => {
        const { r, g, b } = hex2rgb(newVal);
        const { h, s, v } = rgb2hsv(r, g, b);

        let prevHex = rgb2Hex(knobColor.r, knobColor.g, knobColor.b);
        let newHex = rgb2Hex(r, g, b);

        if (prevHex === newHex) {
            return;
        }
        setKnobPosition({ x: s * 100, y: v * 100 });
        // edge case: if new value is gray, ignore hue change
        if (r === g && g === b) {
            // ignore hue change
            return;
        }
        setSelectedHue(h);
    };

    const copyColorToClipboard = () => {
        const input = hexInputRef.current;
        if (input) {
            input.select();
            navigator.clipboard.writeText(input.value);
            setJustCopied(true);
            setTimeout(() => {
                setJustCopied(false);
            }, 2500);
        }
    };

    return (
        <div className={styles.main} style={{ width }}>
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
                <div className={styles.slidersRow}>
                    <div className={styles.colorPreviewWrapper}>
                        <div
                            className={styles.colorPreview}
                            style={{
                                backgroundColor: `rgb(${knobColor.r}, ${knobColor.g}, ${knobColor.b})`,
                            }}
                        ></div>
                    </div>
                    <div className={styles.slidersWrapper}>
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
                </div>
            </div>
            <div className={styles.bottomRow}>
                <div className={styles.inputWrapper}>
                    <HexInput
                        value={rgb2Hex(
                            knobColor.r,
                            knobColor.g,
                            knobColor.b
                        ).toUpperCase()}
                        setValue={handleHexInputChange}
                        setAlpha={setSelectedAlpha}
                        hexInputRef={hexInputRef}
                    />
                    <div
                        className={styles.copyIconWrapper}
                        onClick={copyColorToClipboard}
                    >
                        {!justCopied ? (
                            <CopyIcon />
                        ) : (
                            <CheckMark className={styles.checkIcon} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ColorPicker;
