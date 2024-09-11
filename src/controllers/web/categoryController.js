import Category from "../../schemas/categorySchema.js";
import Product from "../../schemas/productSchema.js";
import sharp from "sharp";
import dotenv from "dotenv";
import {uploadMedia, getMedia, deleteMedia} from "../../services/s3Function.js";
import {HTTPResponse} from "../../services/HTTPResponse.js";

dotenv.config();
const maxAge = 720;

const getCategoryPage = async (req, res) => {
    const sizePage = +req.query.size || 5;
    const currentPage = +req.query.page || 1;

    try {
        const totalCategories = await Category.countDocuments();
        const totalPages = Math.ceil(totalCategories / sizePage);
        const categories = await Category.find()
            .sort({createdAt: -1})
            .skip((currentPage - 1) * sizePage)
            .limit(sizePage)
            .select('_id name thumbnail status');

        const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
            const categoryWithCount = {
                ...category.toObject(),
                productsCount: 0
            };

            if (categoryWithCount.thumbnail) {
                categoryWithCount.thumbnail = await getMedia(categoryWithCount.thumbnail, maxAge);
            }

            categoryWithCount.productsCount = await Product.countDocuments({idCategory: categoryWithCount._id});

            return categoryWithCount;
        }));

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
        res.redirect('/categories/500')
    }
}

const getCategoryDetail = async (req, res) => {
    try {
        const category = await Category.findOne({_id: req.params.id});
        if (!category) {
            return res.redirect('/categories/404')
        }

        const categoryData = {
            ...category.toObject(),
            products: []
        };

        if (categoryData.thumbnail) {
            categoryData.thumbnail = await getMedia(categoryData.thumbnail, maxAge);
        }

        categoryData.products = await Product.find({categoryId: categoryData._id})

        res.render('pages/main', {
            title: `${categoryData.name}`,
            display: 'categoryDetail',
            category: categoryData,
            active: 'category'
        });

    } catch (error) {
        console.log(`getCategoryDetail ${error}`)
        res.redirect('/categories/500')
    }
}

const postAddCategory = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {name, privateAttribute, status} = req.body;
        let thumbnail = "";

        const existingCategory = await Category.findOne({
            name: new RegExp(`^${name}$`, 'i')
        });

        if (existingCategory) {
            return res.json({status: 409});
        }

        if (req.file) {

        }

        await Category.create({
            name: name,
            thumbnail: thumbnail,
            privateAttribute:privateAttribute,
            status: JSON.parse(status)
        });
        res.json({status: 201})
    } catch (error) {
        console.log(`getCategoryPage ${error}`)
        res.json({status: 500})
    }
}

const patchUpdateCategory = async (req, res) => {
    try {
        if (!req.body) {
            return res.json({status: 400});
        }

        const category = await Category.findOne({_id: req.params.id});
        if (!category) {
            return res.redirect('/categories/404')
        }

        if (Object.keys(req.body).length === 0) {
            return res.status(400).json(HTTPResponse(400, {}, 'Invalid data'));
        }

        const {name, status} = req.body;

        if (name && name !== "") {
            const existingCategory = await Category.findOne({
                name: new RegExp(`^${name}$`, 'i')
            });

            if (existingCategory) {
                return res.json({status: 409});
            }

            category.name = name
        }

        if (status !== null && status === false) {
            const product = await Product.findById({_id: category._id}).select('_id');
            if (product) {
                return res.json({status: 408});
            }
        }

        if (req.file) {
            try {
                const buffer = await sharp(req.file.buffer)
                    .resize({height: 650, width: 650, fit: "cover"})
                    .toBuffer();
                if (category.thumbnail) {
                    await deleteMedia(category.thumbnail)
                    category.thumbnail = await uploadMedia(req.file, buffer);
                } else {
                    category.thumbnail = await uploadMedia(req.file, buffer)
                }
            } catch (error) {
                console.log("ERROR upload file: ", error);
            }
        }

        await category.save();
        res.json({status: 200})
    } catch (error) {
        console.log(`putUpdateCategory ${error}`)
        res.redirect('/categories/500')
    }
}

const addSuccess = (req, res) => {
    res.render('pages/notification', {
        code: 201,
        route: "categories",
        title: "Thêm danh mục thành công",
        message: ""
    });
}

const add400 = (req, res) => {
    res.render('pages/notification', {
        code: 400,
        route: "categories",
        title: "Lỗi nhập liệu",
        message: "Trống dữ liệu"
    });
}

const categoryNotFound = (req, res) => {
    res.render('pages/notification', {
        code: 404,
        route: "categories",
        title: "Lỗi dữ liệu",
        message: "Danh mục không tồn tại"
    });
}

const serverError = (req, res) => {
    res.render('pages/notification', {
        code: 500,
        route: "categories",
        title: "Lỗi kết nối máy chủ",
        message: "Đã có lỗi phát sinh từ phía máy chủ. Vui lòng thử lại"
    });
}

export default {
    getCategoryPage,
    getAddCategoryPage,
    postAddCategory,
    getCategoryDetail,
    patchUpdateCategory,
    addSuccess,
    add400,
    categoryNotFound,
    serverError
}
