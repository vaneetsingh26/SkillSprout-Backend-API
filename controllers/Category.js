const Category = require('../models/Category');

//handler function
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.',
            })
        }

        //create entry in db
        const categoryDetails = await Category.create({
            name: name,
            description: description,
        });
        console.log('Category Details: ', categoryDetails);

        //return response
        return res.status(200).json({
            success: true,
            message: 'Category created successfully.',
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};


//get all categories
exports.showAllCategories = async (req, res) => {
    try {
        const allCategories = await Category.find({}, { name: true, description: true });
        res.status(200).json({
            success: true,
            message: 'All Categories shown successfully',
            data: allCategories,
        })
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


//get category page details
exports.categoryDetails = async (req, res) => {
    try {
        //get category id
        const { categoryId } = req.body;
        console.log("Category ID: ", categoryId);

        //get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
            })
            .exec()

        //handle the case when category is not found
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
            })
        }

        //handle the case when there are no courses
        if (selectedCategory.courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No Courses found for this category.',
            })
        }

        // 2. Get courses for different categories (for "Frequently Bought Together" or "Explore More")
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
        .populate({
            path: "courses",
            match: { status: "Published" }, // Must be published!
        })
        .exec();

        // Extract just the courses from those other categories
        let differentCourses = [];
        for (const category of differentCategories) {
            differentCourses.push(...category.courses);
        }

        //get top selling courses
        const allCategories = await Category.find()
            .populate({
                path: "courses",
                match: { status: "Published" },
                // We need instructor details for course cards
                populate: { path: "instructor" } 
            })
            .exec();
        const allCourses = allCategories.flatMap((category) => category.courses);
        
        const mostSellingCourses = allCourses
            .sort((a, b) => b.studentsEnrolled.length - a.studentsEnrolled.length)
            .slice(0, 10); // Using slice() instead of splice() to avoid mutating the original array

        //return response
        return res.status(200).json({
            success: true,
            message: 'Category details fetched successfully.',
            data: {
                selectedCategory,
                differentCourses,
                mostSellingCourses
            }
        });

    }
    catch (error) {
        console.log("Category Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}