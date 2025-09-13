function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }   
}
function loginRedirect(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/dashboard');
    } else {
        return next();
    }
}
function adminOnly(req, res, next) {
    if (req.session && req.session.type === 'admin') {
        return next();  
    } else {
        return res.status(403).json({ message: 'Acesso negado' });
    }
}

module.exports = { isLoggedIn, loginRedirect, adminOnly };