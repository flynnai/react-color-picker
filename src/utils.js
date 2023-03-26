// credit for these two: https://stackoverflow.com/a/54070620/12339112
// for `h` in [0,360], `s` in [0,1, `v` in [0,1]
export const hsv2rgb = (h, s, v) => {
    let f = (n, k = (n + h / 60) % 6) =>
        v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return {
        r: Math.round(f(5) * 255),
        g: Math.round(f(3) * 255),
        b: Math.round(f(1) * 255),
    };
};

// for r,g,b in [0, 255], gives h in [0,360) and s,v in [0,1]
export const rgb2hsv = (r, g, b) => {
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

export const rgb2Hex = (r, g, b) =>
    `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
        .toString(16)
        .padStart(2, "0")}`.toUpperCase();

export const hex2rgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
});
