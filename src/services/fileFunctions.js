import {getMedia, uploadMedia} from "./s3Function.js";
import sharp from "sharp";

const getThumbnail = async (path, maxAge, includePath = true) => {
    if (!path) return null;

    const result = {
        url: await getMedia(path, maxAge)
    };

    if (includePath) {
        result.path = path;
    }

    return result;
};

const getMediaData = async (mediaPaths, maxAge, includePath = true) => {
    if (!mediaPaths || mediaPaths.length === 0) return null;

    return await Promise.all(
        mediaPaths.map(async (path) => {
            const mediaData = {
                url: await getMedia(path, maxAge)
            };

            if (includePath) {
                mediaData.path = path;
            }

            return mediaData;
        })
    );
};

const uploadThumbnail = async (file) => {
    if(!file){
        return null
    }

    try {
        const buffer = await sharp(file.buffer)
            .resize({height: 550, width: 550, fit: "cover"})
            .toBuffer();

        return await uploadMedia(file, buffer);
    } catch (error) {
        console.log("ERROR upload file: ", error);
        return null;
    }
}

const uploadFiles = async (files) => {
    const images = [];
    const videos = [];

    for (const file of files) {
        const mimeType = file.mimetype;
        try {
            if (mimeType.startsWith('image/')) {
                const buffer = await sharp(file.buffer)
                    .resize({height: 550, width: 550, fit: "cover"})
                    .toBuffer();
                const fileName = await uploadMedia(file, buffer);
                images.push(fileName);
            } else if (mimeType.startsWith('video/')) {
                const fileName = await uploadMedia(file, file.buffer);
                videos.push(fileName);
            }
        } catch (error) {
            console.log(`ERROR upload ${mimeType.startsWith('image/') ? 'image' : 'video'}: `, error.message);
        }
    }

    return {images, videos};
};


export {
    getThumbnail,
    getMediaData,
    uploadThumbnail,
    uploadFiles
}
