const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tms', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});


// megecek dengan menambah satu data
// const contactSatu = new Contact({
//     nama: "Setiawan",
//     nohp: "371480734",
//     email: "setiawan@gmail.com"
// });

// menyimpan ke collection
// contactSatu.save()
//     .then((result) => {
//         console.log(result);
//     }).catch((err) => {
//         console.log(err);
//     }
// );




