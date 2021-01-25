const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
//onst {clearHash} =  require('../services/cache')
const cleanCache =  require('../middlewares/cleanCache');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    
    const blogs = await Blog
    .find({ _user: req.user.id })
    .cache({key: req.user.id});
    
    res.send(blogs);

  });

  app.post('/api/blogs', requireLogin, cleanCache, async (req, res) => {
    //Keep in mind: 'cleanCache' middleware has a trick inside and it is going to be executed after route handler
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
    //clearHash(req.user.id);
  });
};
