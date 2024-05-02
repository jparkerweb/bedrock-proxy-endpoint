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
export function extractAWSCreds(input) {
    // Find the index of "AKIA" which is the start of the second part
    const startIndex = input.indexOf("AKIA");
    if (startIndex === -1) {
        return null; // "AKIA" not found, return null or handle as needed
    }

    // Define the length of the second part
    const lengthOfAWS_ACCESS_KEY_ID = 20;

    // Extract the second part
    const AWS_ACCESS_KEY_ID = input.substring(startIndex, startIndex + lengthOfAWS_ACCESS_KEY_ID);

    // Extract the first part (everything before the second part)
    const AWS_REGION = input.substring(0, startIndex);

    // Extract the third part (everything after the second part)
    const AWS_SECRET_ACCESS_KEY = input.substring(startIndex + lengthOfAWS_ACCESS_KEY_ID);

    return { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY };
}
