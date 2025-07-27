const Router = require('express').Router();

const User = require('../../models/User');

Router.post('/add', async (req, res) => {
    const { username, fullName, email, password, type } = req.body;

    try {
        const user = new User({
            username,
            fullName,
            email,
            password,
            type
        });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
Router.post('/remove/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

Router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { username, fullName, email, password, type } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(id, {
            username,
            fullName,
            email,
            password,
            type
        }, { new: true });
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = Router;   
