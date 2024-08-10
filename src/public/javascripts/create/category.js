document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('category-form');
    const categoryNameInput = form.querySelector('input[name="categoryName"]');
    const categoryImageInput = form.querySelector('input[name="image"]');
    const categoryNameError = document.getElementById('category_name_error');
    const categoryImageError = document.getElementById('category_image_error');

    categoryNameInput.addEventListener('focus', () => {
        categoryNameError.textContent = '';
    });

    categoryImageInput.addEventListener('focus', () => {
        categoryImageError.textContent = '';
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        categoryNameError.textContent = '';
        categoryImageError.textContent = '';

        const categoryName = categoryNameInput.value.trim();
        const categoryImage = categoryImageInput.files[0];

        let hasError = false;

        console.log(`name: ${categoryName} image: ${categoryImage}`);

        if (!categoryName) {
            categoryNameError.textContent = 'Tên danh mục không được để trống.';
            hasError = true;
        }

        if (!categoryImage) {
            categoryImageError.textContent = 'Ảnh danh mục không được để trống.';
            hasError = true;
        }

        if (hasError) {
            return;
        }

        const formData = new FormData(form);

        let statusCode;

        try {
            const response = await axios.post('/category', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            statusCode = response.data.status;

            switch (statusCode) {
                case 201:
                    window.location.href = '/category/201';
                    break;
                case 400:
                    window.location.href = '/category/400';
                    break;
                case 409:
                    document.getElementById('category_name_error').textContent = 'Tên danh mục đã tồn tại.';
                    break;
                case 500:
                    window.location.href = '/category/500';
                    break;
                default:
                    console.error('Unhandled status code:', statusCode);
                    break;
            }
        } catch (error) {
            window.location.href = '/category/500';
        } finally {
            if (statusCode !== 409) {
                form.reset();
            }
        }

    });
});
