import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import {GetObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import s3 from "../../config/s3.js";
import sharp from "sharp";
import dotenv from "dotenv";
import generateImageName from "../../services/generateImageName.js";

dotenv.config();
const bucketName = process.env.BUCKET_NAME;

const getCategoryPage = async (req, res) => {
    const sizePage = +req.query.size || 5;
    const currentPage = +req.query.page || 1;

    try {
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / sizePage);
        const categories = await Category.find()
            .sort({createAt: -1})
            .skip((currentPage - 1) * sizePage)
            .limit(sizePage);

        const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
            const categoryWithCount = {
                ...category.toObject(),
                productsCount: 0
            };

            if (categoryWithCount.imageKey) {
                const getObjectParams = {
                    Bucket: bucketName,
                    Key: categoryWithCount.imageKey,
                };

                const command = new GetObjectCommand(getObjectParams);
                categoryWithCount.imageUrl = await getSignedUrl(s3, command, { expiresIn: 60 });
            }

            categoryWithCount.productsCount = await Product.countDocuments({idCategory: categoryWithCount._id});

            return categoryWithCount;
        }));

       // for (const category of categoriesWithCounts) {
       //     console.log(`category: ${JSON.stringify(category, null, 2)}`);
       // }

        res.render('pages/main', {
            title: 'Quản lý danh mục',
            display: 'category',
            active: 'category',
            categories: categoriesWithCounts,
            currentPage: currentPage,
            totalPages: totalPages,
        });
    } catch (error) {
        console.log(`getCategoryPage ${error}`)
        res.redirect('/category/500')
    }
}

const getAddCategoryPage = (req, res) => {
    try {
        res.render('pages/main', {
            title: 'Thêm mới danh mục',
            display: 'addCategory',
            active: 'category'
        });
    } catch (error) {
        console.log(`getCategoryPage ${error}`)
        res.redirect('/category/500')
    }
}

const postAddCategory = async (req, res) => {
    try {
        if (!req.body) {
            return res.json({status: 400});
        }

        const {categoryName, status} = req.body;
        let imageKey = "";

        // console.log(`name: ${categoryName} status: ${status}`);
        // console.log(`file: ${req.file}`)

        const existingCategory = await Category.findOne({
            categoryName: new RegExp(`^${categoryName}$`, 'i')
        });

        if (existingCategory) {
            return res.json({status: 409});
        }

        if (req.file) {
            try {
                const buffer = await sharp(req.file.buffer)
                    .resize({height: 650, width: 650, fit: "cover"})
                    .toBuffer();

                imageKey = generateImageName();

                const params = {
                    Bucket: bucketName,
                    Key: imageKey,
                    Body: buffer,
                    ContentType: req.file.mimetype,
                };

                const command = new PutObjectCommand(params);
                await s3.send(command);
            } catch (error) {
                console.log("ERROR upload file: ", error);
                imageKey = "";
            }
        }

        await Category.create({
            categoryName: categoryName,
            imageKey: imageKey,
            status: JSON.parse(status)
        })
        res.json({status: 201})
    } catch (error) {
        console.log(`getCategoryPage ${error}`)
        res.json({status: 500})
    }
}

const addSuccess = (req, res) => {
    res.render('pages/notification', {
        code: 201,
        route: "category",
        title: "Thêm danh mục thành công",
        message: ""
    });
}

const add400 = (req, res) => {
    res.render('pages/notification', {
        code: 400,
        route: "category",
        title: "Lỗi nhập liệu",
        message: "Trông dữ liệu"
    });
}

const serverError = (req, res) => {
    res.render('pages/notification', {
        code: 500,
        route: "category",
        title: "Lỗi kết nối máy chủ",
        message: "Đã có lỗi phát sinh từ phía máy chủ. Vui lòng thử lại"
    });
}

export default {
    getCategoryPage,
    getAddCategoryPage,
    postAddCategory,
    addSuccess,
    add400,
    serverError
}