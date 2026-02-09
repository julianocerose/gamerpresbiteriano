export interface Point {
    x: number;
    y: number;
}

/**
 * MASTER CHECKPOINTS (Normalized: X -0.5 to 0.5, Y 0 to 1)
 * Based on the path_xy_corrigido.txt analysis.
 */
export const MASTER_PATH: Record<number, Point> = {
    "0": { "x": 0, "y": 0.05 },
    "50": { "x": -0.045, "y": 0.065 },
    "80": { "x": -0.13, "y": 0.1 },
    "125": { "x": -0.15, "y": 0.1125 },
    "160": { "x": -0.18, "y": 0.1875 },
    "200": { "x": -0.1, "y": 0.25 },
    "240": { "x": -0.1, "y": 0.25 },
    "275": { "x": -0.06, "y": 0.2875 },
    "320": { "x": 0.03, "y": 0.2875 },
    "350": { "x": 0.1, "y": 0.3125 },
    "400": { "x": 0.13, "y": 0.3438 },
    "425": { "x": 0.08, "y": 0.3875 },
    "480": { "x": 0.02, "y": 0.3937 },
    "520": { "x": -0.095, "y": 0.4 },
    "560": { "x": -0.14, "y": 0.425 },
    "600": { "x": -0.21, "y": 0.475 },
    "640": { "x": -0.23, "y": 0.5 },
    "700": { "x": -0.25, "y": 0.55 },
    "720": { "x": -0.25, "y": 0.55 },
    "760": { "x": -0.2, "y": 0.5875 },
    "800": { "x": -0.13, "y": 0.6 },
    "840": { "x": -0.1, "y": 0.575 },
    "880": { "x": -0.059, "y": 0.5 },
    "950": { "x": 0.31, "y": 0.575 },
    "1000": { "x": 0, "y": 0.475 }
};

const SORTED_XP = Object.keys(MASTER_PATH).map(Number).sort((a, b) => a - b);

/**
 * Calculates a position along the trail using LERP between master points.
 * @param xp Current progress (0 to 1000)
 * @returns {Point} Normalized coordinates
 */
export function getTrailPosition(xp: number): Point {
    // Clamp XP
    const targetXp = Math.max(0, Math.min(1000, xp));

    // Find surrounding marcos (checkpoints)
    let prevXp = SORTED_XP[0];
    let nextXp = SORTED_XP[SORTED_XP.length - 1];

    for (let i = 0; i < SORTED_XP.length; i++) {
        if (SORTED_XP[i] <= targetXp) prevXp = SORTED_XP[i];
        if (SORTED_XP[i] >= targetXp) {
            nextXp = SORTED_XP[i];
            break;
        }
    }

    // If we are exactly on a point
    if (prevXp === nextXp) return MASTER_PATH[prevXp];

    // LERP logic
    const fraction = (targetXp - prevXp) / (nextXp - prevXp);
    const p0 = MASTER_PATH[prevXp];
    const p1 = MASTER_PATH[nextXp];

    return {
        x: p0.x + (p1.x - p0.x) * fraction,
        y: p0.y + (p1.y - p0.y) * fraction
    };
}
