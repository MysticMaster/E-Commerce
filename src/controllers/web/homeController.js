const getHomePage = (req, res) => {
    res.render('pages/main', {title: 'Trang chủ', display: 'home', active: 'home'});
}

export default getHomePage;