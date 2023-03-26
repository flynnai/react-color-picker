import { useEffect, useRef, useState } from "react";
import styles from "./ColorPicker.module.scss";
import ReactSlider from "react-slider";
import CopyIcon from "./CopyIcon";
import { ReactComponent as CheckMark } from "./circleGreenCheckMark.svg";

// credit for these two: https://stackoverflow.com/a/54070620/12339112
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

// for r,g,b in [0, 255], gives h in [0,360) and s,v in [0,1]
const rgb2hsv = (r, g, b) => {
    r /= 0xff;
    g /= 0xff;
    b /= 0xff;
    let v = Math.max(r, g, b),
        c = v - Math.min(r, g, b);
    let h =
        c &&
        (v === r ? (g - b) / c : v === g ? 2 + (b - r) / c : 4 + (r - g) / c);
    return {
        h: 60 * (h < 0 ? h + 6 : h),
        s: v && c / v,
        v,
    };
};

const rgb2Hex = (r, g, b) =>
    `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
        .toString(16)
        .padStart(2, "0")}`;

const hex2rgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
});

const joinClasses = (...args) => args.filter(Boolean).join(" ");

function HexInput({ value, setValue, setAlpha, hexInputRef }) {
    const [isInvalid, setIsInvalid] = useState(false);
    const [draft, setDraft] = useState(value);

    useEffect(() => {
        setDraft(value);
        setIsInvalid(false);
    }, [value]);

    const validateDraft = (e) => {
        let newVal = e.target.value;
        // already uppercased
        newVal = newVal.replaceAll(/[^0-9A-F]/g, "");
        if (newVal.length === 3 || newVal.length === 4) {
            // expand out
            newVal = Array.from(newVal)
                .map((c) => c + c)
                .join("");
        }

        if (newVal.length === 8) {
            let newAlpha = parseInt(newVal.slice(6), 16);
            setAlpha(newAlpha);
            newVal = newVal.slice(0, 6);
        }

        if (newVal.length !== 6) {
            setIsInvalid(true);
            return;
        }
        newVal = "#" + newVal;

        setValue(newVal);
        setDraft(newVal);
        setIsInvalid(false);
    };

    const handleChange = (e) => {
        let newVal = e.target.value;
        newVal = newVal.toUpperCase();
        setDraft(newVal);
    };

    const selectAll = (e) => {
        e.target.setSelectionRange(0, e.target.value.length);
    };

    return (
        <input
            type="text"
            value={draft}
            onChange={handleChange}
            onFocus={selectAll}
            className={joinClasses(
                styles.hexInput,
                isInvalid && styles.invalid
            )}
            placeholder="#xxxxxx"
            onBlur={validateDraft}
            ref={hexInputRef}
        ></input>
    );
}

function ColorPicker({ width, color, setColor }) {
    const initColor = rgb2hsv(color.r, color.g, color.b);
    const [selectedHue, setSelectedHue] = useState(initColor.h);
    const [selectedAlpha, setSelectedAlpha] = useState(color.a);
    const colorSquareRef = useRef(null);
    const hexInputRef = useRef(null);
    const [knobPosition, setKnobPosition] = useState({
        x: initColor.s * 100,
        y: initColor.v * 100,
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
        setColor({ r, g, b, a: selectedAlpha });
    }, [knobColor.r, knobColor.g, knobColor.b, selectedAlpha]);

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
