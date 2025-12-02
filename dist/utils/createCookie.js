export const getCookie = (name, value, expires) => {
    const currentDay = Date.now();
    const expiresDay = new Date(currentDay + expires);
    const expiresStr = expiresDay.toUTCString();
    const part1 = `${name}=${value};`;
    const part2 = `HttpOnly; Secure; SameSite=Strict;`;
    const part3 = `Expires=${expiresStr};`;
    return part1 + part2 + part3;
};
