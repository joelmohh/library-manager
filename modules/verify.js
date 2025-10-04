function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }   
}
function loginRedirect(req, res, next) {
    if (req.session && req.session.userId) {
        if (req.session.type === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/student');
        }
    } else {
        return next();
    }
}
function adminOnly(req, res, next) {
    if (req.session && req.session.type === 'admin') {
        return next();  
    } else {
        return res.status(403).json({ message: 'Acesso negado, você não tem permissão para acessar este recurso.' });
    }
}

module.exports = { isLoggedIn, loginRedirect, adminOnly };