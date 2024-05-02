// -------------------------------------
// -- return passed string as boolean --
// -------------------------------------
export function toBoolean(str = 'false') {
    const normalizedStr = str.trim().toLowerCase();
    const truthyValues = ['true', 'yes', '1'];
    const falsyValues = ['false', 'no', '0', '', 'null', 'undefined'];

    if (truthyValues.includes(normalizedStr)) {
        return true;
    } else if (falsyValues.includes(normalizedStr)) {
        return false;
    }

    return false;
}

// -------------------------
// -- AWS Creds Extractor --
// -------------------------
export function extractAWSCreds(token) {
    const keyParts = token.split(".")

    if (keyParts.length !== 3 || !keyParts[1].startsWith("AKIA") || keyParts[1].length !== 20){
        return {
            error: true,
            message: "Invalid AWS API key"
        };
    }

    const [ AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY ] = keyParts;
    return {
        error: false,
        credentials: {
            AWS_REGION,
            AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY
        }
    };
}
