// mengambil module 
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const { body, validationResult, check, Result } = require('express-validator');
const methodOverride = require('method-override');

// koneksi db dan model
require('./utils/db');
const Contact = require('./model/contact')

// module flash message
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

// setting modul
const app = express();
const port = 3000;

// set-up method override
app.use(methodOverride('_method'));

// set-up view engine untuk ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(expressLayouts);
app.use(express.urlencoded({extended : true}));

// konfigurasi flash message
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 6000},
    secret: 'secret',
    resave: true,
    saveUninitialized : true
}));
app.use(flash());

// Halaman Home
app.get('/', (req, res, next) => {
    // res.sendFile('./index.html', {root: __dirname});
    const murid = [
        {
            nama: "thomas",
            email: "thomas@gmail.com"
        },
        {
            nama: "alex",
            email: "alex@gmail.com"
        },
        {
            nama: "bhizzer",
            email: "bhizzer@gmail.com"
        },
    ];
    res.render('index', {
        nama: "Thomas",
        title: "home",
        murid,
        layout: 'layouts/main'
    });
});

// Halaman About
app.get('/about', (req, res) => {
    res.render('about', {
        layout: 'layouts/main',
        title: 'about',
    });
});

// Halaman Login
app.get('/login', (req, res) => {
    res.render('login', {
        
    })
});

// Halaman Contact
app.get('/contact', async (req, res) => {
    // if(!req.cookies.token){
    //     return res.redirect('/login')
    // };
    
    const contacts = await Contact.find();
    
    res.render('contact', {
        layout: 'layouts/main',
        title: 'contact',
        contacts,
        msg: req.flash('msg')
    });
});

// halaman tambah data contact
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: "Form tambah contact",
        layout: 'layouts/main',

    });
});

// proses tambah data contact
app.post('/contact', [
        body('nama').custom( async (value) => {
            const duplikat = await Contact.findOne({ nama: value });
            if(duplikat){
                throw new Error('Nama contact sudah terdaftar');
            }
            return true;
        }),
        check('email', 'Email tidak valid').isEmail(),
        check('nohp', 'Nomor hp tidak valid').isMobilePhone('id-ID'),
    ],
    (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.render('add-contact', {
                title : 'form tambah data contact',
                layout : 'layouts/main',
                errors: errors.array(),
            })
        } else {
            Contact.insertMany(req.body, (err, result) => {
                // mengirimkan flash message
                req.flash('msg', 'data contact berhasil ditambahkan');
                
                res.redirect('/contact');
            });

        }
    }
);

// proses menghapus / delete contact dengan get
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({nama: req.params.nama});

//     // jika contact tidak ada
//     if(!contact){
//         res.status(404);
//         res.send('<h1>404</h1>')
//     } else {
//         Contact.deleteOne({_id: contact._id}).then((result) => {
//             req.flash('msg', 'data contact berhasil dihapus');
                
//             res.redirect('/contact');
//         });
//     } 
// });

app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'data contact berhasil dihapus');
            
        res.redirect('/contact');
    });
});

// untuk mengedit data contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })
    
    res.render('edit-contact', {
        title : "Edit contact",
        layout : "layouts/main",
        contact,
    });
});

//proses ubah data
app.put('/contact', [
    body('nama').custom( async (value, {req}) => {
        const duplikat = await Contact.findOne({nama: value});
        if(value !== req.body.oldNama && duplikat){
            throw new Error('Nama contact sudah terdaftar');
        }
        return true;
    }),
    check('email', 'Email tidak valid').isEmail(),
    check('nohp', 'Nomor hp tidak valid').isMobilePhone('id-ID'),
    ],
    (req, res)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            res.render('edit-contact', {
                title : 'form ubah data contact',
                layout : 'layouts/main',
                errors: errors.array(),
                contact: req.body
            })
        } else {
            Contact.updateOne(
                {
                    _id: req.body._id
                },
                {
                    $set: {
                        nama: req.body.nama,
                        email: req.body.email,
                        nohp: req.body.nohp,
                    },
                },
            ).then((result) => {
                // mengirimkan flash message
                req.flash('msg', 'data contact berhasil diubah');
                
                res.redirect('/contact');
            })
        }
    }
);

// Halaman detail contact
app.get('/contact/:nama', async (req, res) => {
    // const contact = findContact(req.params.nama);
    const contact = await Contact.findOne({ nama: req.params.nama });
    
    res.render('detail', {
        layout: 'layouts/main',
        title: 'detail',
        contact,
    });
});

app.listen(port, () => {
    console.log(`Contact App | listening at http://localhost:${port}`);
});

