import {PutObjectCommand, GetObjectCommand, DeleteObjectCommand} from "@aws-sdk/client-s3";
import {extname} from "path";
import generateS3Key from "./generateS3Key.js";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import s3 from "../config/s3.js";
import dotenv from "dotenv";

dotenv.config();
const bucketName = process.env.BUCKET_NAME;

const uploadMedia = async (file, buffer) => {
    const fileExtension = extname(file.originalname);
    const fileName = generateS3Key() + fileExtension;

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.mimetype,
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        return fileName;
    } catch (error) {
        console.log(`ERROR upload media: ${error.message}`);
        throw error;
    }
}

const getMedia = async (fileName, maxAge) => {
    try {
        const getObjectParams = {
            Bucket: bucketName,
            Key: fileName
        };
        const command = new GetObjectCommand(getObjectParams);
        return await getSignedUrl(s3, command, {expiresIn: maxAge});
    } catch (error) {
        console.log(`ERROR get media: ${error.message}`);
        throw error;
    }
}

const deleteMedia = async (fileName) => {
    try {
        const deleteObjectParams = {
            Bucket: bucketName,
            Key: fileName
        };
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3.send(command);
    } catch (error) {
        console.log(`ERROR delete media: ${error.message}`);
        throw error;
    }
}

export {uploadMedia, getMedia, deleteMedia};