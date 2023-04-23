const multer = require('multer');
const FILE_SIZE = 1024 * 1024 * 2;
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '/Integrify/react/mongodb/user-admin-management/server/src/helpers/uploads')
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + file.originalname)
    }
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: FILE_SIZE
    }
});
module.exports = upload;