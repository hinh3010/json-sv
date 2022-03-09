const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const queryString = require('query-string');

// Đặt phần mềm trung gian mặc định (logger, static, cors và no-cache)
server.use(middlewares)

// Thêm các tuyến tùy chỉnh trước bộ định tuyến Máy chủ JSON
server.get('/echo', (req, res) => {
    res.jsonp(req.query)
})

// Để xử lý POST, PUT và PATCH, bạn cần sử dụng trình phân tích cú pháp nội dung
// Bạn có thể sử dụng cái được sử dụng bởi Máy chủ JSON
server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
    if (req.method === 'POST') {
        // req.body.createdAt = Date.now()
        // req.body.updatedAt = Date.now()
        req.body.createdAt = new Date(Date.now()).toString()
        req.body.updatedAt = new Date(Date.now()).toString()
    }
    if (req.method === 'PATCH') {
        // req.body.updatedAt = Date.now()
        req.body.updatedAt = new Date(Date.now()).toString()
    }
    // console.log(new Date(Date.now()).toString())
    // Tiếp tục đến bộ định tuyến Máy chủ JSON
    next()
})

// Đầu ra tùy chỉnh cho LIST với phân trang
router.render = (req, res) => {
    // Kiểm tra GET với phân trang
    // Nếu có, tùy chỉnh đầu ra 
    // console.log(req.query)
    const headers = res.getHeaders();

    const totalCountHeader = headers['x-total-count'];
    if (req.method === 'GET' && totalCountHeader) {
        const queryParams = queryString.parse(req._parsedUrl.query);
        // console.log(queryParams)

        const result = {
            data: res.locals.data,
            pagination: {
                _page: Number.parseInt(queryParams._page) || 1,
                _limit: Number.parseInt(queryParams._limit) || 10,
                _totalRows: Number.parseInt(totalCountHeader),
            },
        };

        return res.jsonp(result);
    }
    // Nếu không, giữ hành vi mặc định
    res.jsonp(res.locals.data);
}

// Sử dụng bộ định tuyến mặc định
// server.use(router)
server.use('/api', router)       // tạo thêm đuôi /api sau localhost
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
    console.log('JSON Server chạy')
})