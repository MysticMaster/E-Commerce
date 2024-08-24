import Category from "../../models/categoryModel.js";
import Product from "../../models/productModel.js";
import sharp from "sharp";
import dotenv from "dotenv";
import {uploadMedia, getMedia, deleteMedia} from "../../services/s3Function.js";

dotenv.config();
const maxAge = 360;

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
                categoryWithCount.imageUrl = await getMedia(categoryWithCount.imageKey, maxAge);
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

                imageKey = await uploadMedia(req.file, buffer);
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

const getCategoryDetail = async (req, res) => {
    try {
        const category = await Category.findOne({_id: req.params.id});
        if (!category) {
            return res.redirect('/category/404')
        }

        const categoryData = {
            ...category.toObject(),
            products: []
        };

        if (categoryData.imageKey) {
            categoryData.imageUrl = await getMedia(categoryData.imageKey, maxAge);
        }

        categoryData.products = await Product.find({categoryId: categoryData._id})

        res.render('pages/main', {
            title: `${categoryData.categoryName}`,
            display: 'categoryDetail',
            category: categoryData,
            active: 'category'
        });

    } catch (error) {
        console.log(`getCategoryDetail ${error}`)
        res.redirect('/category/500')
    }
}

const putUpdateCategory = async (req, res) => {
    try {
        if (!req.body) {
            return res.json({status: 400});
        }

        const category = await Category.findOne({_id: req.params.id});
        if (!category) {
            return res.redirect('/category/404')
        }

        const {categoryName, status} = req.body;
        let imageKey = "";

        console.log(`name: ${categoryName} status: ${status}`);
        // console.log(`file: ${req.file}`)

        const existingCategory = await Category.findOne({
            categoryName: new RegExp(`^${categoryName}$`, 'i')
        });

        if (existingCategory && existingCategory.categoryName !== categoryName) {
            return res.json({status: 409});
        }

        if (req.file) {
            try {
                const buffer = await sharp(req.file.buffer)
                    .resize({height: 650, width: 650, fit: "cover"})
                    .toBuffer();

                imageKey = await uploadMedia(req.file, buffer);

                if (category.imageKey) {
                    await deleteMedia(categoryName.imageKey)
                }
            } catch (error) {
                console.log("ERROR upload file: ", error);
                imageKey = "";
            }
        }

        await Category.findOneAndUpdate(
            {_id: category._id},
            {
                categoryName: categoryName,
                imageKey: imageKey || category.imageKey,
                status: JSON.parse(status)
            }, {new: true});
        res.json({status: 200})
    } catch (error) {
        console.log(`putUpdateCategory ${error}`)
        res.redirect('/category/500')
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

const categoryNotFound = (req, res) => {
    res.render('pages/notification', {
        code: 404,
        route: "category",
        title: "Lỗi dữ liệu",
        message: "Danh mục không tồn tại"
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
    getCategoryDetail,
    putUpdateCategory,
    addSuccess,
    add400,
    categoryNotFound,
    serverError
}