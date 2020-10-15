const express = require('express');
const router = express.Router();
const upload = require('../utils/fileStore');
// const Posts = require('../models/Post').Posts;
const Books = require('../models/books');
const deleteFile = require('../utils/deleteFile');



router.get('/', async (req, res) => {
    let books = await Books.find({});
    console.log(books);

    res.render('main/dashboard', { user: req.user, books: books });
});
router.get('/new', (req, res) => {
    res.render('main/new', { user: req.user });
});
router.get('/edit/:id', async (req, res) => {
    const book = await Books.findById(req.params.id);
    res.render('main/edit', { user: req.user, book: book });
});
router.post('/new', upload.array('file'), async (req, res) => {
    console.log(req.body);
    console.log(req.files);
    console.log(req.file);
    const tags = req.body.tags.split(' ');
    let newBook = new Books({
        title: req.body.title,
        qty: req.body.qty,
        desc: req.body.desc,
        isbn: req.body.isbn,
        tags: tags,

    });
    req.files.forEach(file => {
        newBook.images.push(file.id);
    });
    await newBook.save();
    console.log(newBook);
    req.flash('success_msg', 'book uploaded successfully');
    res.redirect('/main/new');
});
router.post('/edit/:id', upload.array('file'), async (req, res) => {
    let book = await Books.findById(req.params.id);
    book.title = req.body.title;
    book.desc = req.body.desc;
    book.qty = req.body.qty;
    book.isbn = req.body.isbn;
    if (req.body.tags) {
        const tags = req.body.tags.split(" ");
        tags.forEach(t => {
            book.tags.push(t);
        });

    }
    await book.save();
    req.flash('success_msg', "Book details updated successfully");
    res.redirect(`/main/edit/${book.id}`);

});
router.get('/delete/:id', async (req, res) => {
    const book = await Books.findByIdAndDelete(req.params.id);
    const files = book.images;
    files.forEach(async (id) => {
        await deleteFile(id);
    })
    console.log(book);
    res.redirect('/main/');
})

router.post('/search', async (req, res) => {
    const tags = req.body.tags.split(' ');
    console.log(tags);
    reqBooks = [];
    const books = await Books.find({});
    tags.forEach(t => {
        t = t.toUpperCase();
        books.forEach(p => {
            if (reqBooks.findIndex(r => r == p) == -1 && p.tags.findIndex(tag => tag == t) != -1)
                reqBooks.push(p);
        })


    })


    res.render('main/dashboard', { user: req.user, books: reqBooks });




});





module.exports = router;