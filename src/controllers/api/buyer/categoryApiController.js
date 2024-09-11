import Category from "../../../schemas/categorySchema.js";
import dotenv from "dotenv";
import {HTTPResponse} from "../../../services/HTTPResponse.js";
import {getThumbnail} from "../../../services/fileFunctions.js";

dotenv.config();
const maxAge = 86400;

const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({status: true})
            .select('_id name thumbnail')
            .lean();
        const categoriesData = await Promise.all(categories.map(async category => {
            if (category.thumbnail) {
                category.thumbnail = await getThumbnail(category.thumbnail, maxAge, false);
            }
            return category;
        }));
        res.status(200).json(HTTPResponse(200, {categories: categoriesData}, 'Successful'));
    } catch (error) {
        console.log(`getCategories ${error.message}`);
        res.status(500).json(HTTPResponse(500, {}, 'Server error'));
    }
}

export default {
    getCategories
}
