const form = document.querySelector('form');
const usernameErr = document.getElementById('ue');
const passwordErr = document.getElementById('pe');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    usernameErr.textContent = "";
    passwordErr.textContent = "";

    const username = form.u.value;
    const password = form.p.value;

    try {
        const response = await axios.post('/auth/login', {
            username: username,
            password: password
        });

        if (response.data.status === 400) {
            switch (response.data.e) {
                case 'u':
                    usernameErr.textContent = "Tên đăng nhập không tồn tại";
                    break;
                case 'p':
                    passwordErr.textContent = "Mật khẩu không đúng";
                    break;
                default:
                    usernameErr.textContent = "";
                    passwordErr.textContent = "";
            }
        }

        if (response.data.status === 200) {
            location.assign('/')
        }
    } catch (error) {
        console.log('err:', error);
    }
});