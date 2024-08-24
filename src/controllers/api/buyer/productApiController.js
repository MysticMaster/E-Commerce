import Product from "../../../models/productModel.js";
import Category from "../../../models/categoryModel.js";
import {DeleteObjectCommand, GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import s3 from "../../../config/s3.js";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import dotenv from "dotenv";
import generateS3Key from "../../../services/generateS3Key.js";

dotenv.config();
const bucketName = process.env.BUCKET_NAME;

