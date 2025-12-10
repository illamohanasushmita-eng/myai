export function calculateLifePathNumber(dateOfBirth: string): number {
    // Format: YYYY-MM-DD
    const digits = dateOfBirth.replace(/\D/g, '').split('').map(Number);
    let sum = digits.reduce((a, b) => a + b, 0);

    // Reduce to single digit (unless 11, 22, 33 - Master numbers, optional, but let's stick to 1-9 for simplicity)
    while (sum > 9) {
        sum = String(sum).split('').map(Number).reduce((a, b) => a + b, 0);
    }
    return sum;
}

export function getBirthDayColor(dateOfBirth: string) {
    const date = new Date(dateOfBirth);
    const day = date.getDay(); // 0 = Sunday, 1 = Monday...

    const colors = [
        { day: 'Sunday', color: 'Gold / Orange', hex: '#FFD700' },    // Sun
        { day: 'Monday', color: 'White / Silver', hex: '#C0C0C0' },   // Moon
        { day: 'Tuesday', color: 'Red', hex: '#FF4500' },             // Mars
        { day: 'Wednesday', color: 'Green', hex: '#32CD32' },         // Mercury
        { day: 'Thursday', color: 'Yellow', hex: '#FFD700' },         // Jupiter
        { day: 'Friday', color: 'Pink / White', hex: '#FF69B4' },     // Venus
        { day: 'Saturday', color: 'Blue / Black', hex: '#000080' },   // Saturn
    ];

    return colors[day];
}

export const LUCKY_GEMS: Record<number, string> = {
    1: "Ruby",
    2: "Pearl",
    3: "Yellow Sapphire",
    4: "Hessonite",
    5: "Emerald",
    6: "Diamond",
    7: "Cat's Eye",
    8: "Blue Sapphire",
    9: "Red Coral"
};
