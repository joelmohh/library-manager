function isLoggedIn(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({ message: 'Usuário não autenticado' });
    }   
}
function loginRedirect(req, res, next) {
    if (req.session && req.session.userId) {
        // Redireciona baseado no tipo de usuário
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
        return res.status(403).json({ message: 'Acesso negado' });
    }
}

module.exports = { isLoggedIn, loginRedirect, adminOnly };