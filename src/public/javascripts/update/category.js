document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('category-form');
    const id = form.querySelector('input[name="id"]');
    const categoryNameInput = form.querySelector('input[name="categoryName"]');
    const categoryNameError = document.getElementById('category_name_error');
    const submitButton = form.querySelector('button[type="submit"]');
    const inputs = form.querySelectorAll('input');
    const radioButtons = form.querySelectorAll('input[name="status"]');

    const checkForChanges = () => {
        let hasChanges = false;

        inputs.forEach(input => {
            if (input.type !== 'radio' && input.value !== input.defaultValue) {
                hasChanges = true;
            }
        });

        radioButtons.forEach(radio => {
            if (radio.checked !== radio.defaultChecked) {
                hasChanges = true;
            }
        });

        submitButton.disabled = !hasChanges;
        submitButton.classList.toggle('btn-disabled', !hasChanges);
        submitButton.classList.toggle('btn-enabled', hasChanges);
    };

    inputs.forEach(input => {
        input.addEventListener('input', checkForChanges);
    });
    radioButtons.forEach(radio => {
        radio.addEventListener('change', checkForChanges);
    });

    categoryNameInput.addEventListener('focus', () => {
        categoryNameError.textContent = '';
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        categoryNameError.textContent = '';

        const categoryName = categoryNameInput.value.trim();

        let hasError = false;

        if (!categoryName) {
            categoryNameError.textContent = 'Tên danh mục không được để trống.';
            hasError = true;
        }

        if (hasError) {
            return;
        }

        const formData = new FormData(form);

        let statusCode;

        try {
            const response = await axios.put(`/categories/${id.value}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            statusCode = response.data.status;

            switch (statusCode) {
                case 200:
                    alert("Cập nhật danh mục thành công");
                    window.location.reload();
                    break;
                case 400:
                    window.location.href = '/categories/400';
                    break;
                case 408:
                    alert("Tồn tại sản phẩm đang giao bán, không thể hủy kích hoạt");
                    break;
                case 409:
                    categoryNameError.textContent = 'Tên danh mục đã tồn tại.';
                    break;
                case 500:
                    window.location.href = '/categories/500';
                    break;
                default:
                    console.error('Unhandled status code:', statusCode);
                    break;
            }
        } catch (error) {
            window.location.href = '/categories/500';
        } finally {
            if (statusCode !== 409) {
                form.reset();
                checkForChanges();
            }
        }
    });

    checkForChanges();
});
