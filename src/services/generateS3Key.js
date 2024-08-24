import crypto from "crypto";

const randomS3Key = (bytes = 18) =>
    crypto.randomBytes(bytes).toString("hex");

export default randomS3Key;