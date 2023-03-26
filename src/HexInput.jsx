import { useState, useEffect } from "react";
import styles from "./HexInput.module.scss";

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
        newVal = newVal.toUpperCase();
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

export default HexInput;
