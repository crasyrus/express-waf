(function() {

    var _config;
    var _patterns = [];
    var _blocker;
    var _logger;

    function XSSModule(config, blocker, logger) {
        var _xemplar = require('xemplar');
        _patterns.push(_xemplar.security.xss.simple);
        _patterns.push(_xemplar.security.xss.img);
        _patterns.push(_xemplar.security.xss.paranoid);
        _blocker = blocker;
        _logger = logger;
    };

    XSSModule.prototype.check = function(req, res, cb) {
        var _host = req.ip;

        if (req.method === 'GET' || req.method === 'DELETE') {
            checkGetOrDeleteRequest(req, res, cb);
        } else if (req.method === 'POST' || req.method === 'PUT') {
            checkPostOrPutRequest(req, res, cb);
        }
        
        function checkPostOrPutRequest(req, res, cb) {
            if (req.body) {
                req.body.forEach(function (reqElement) {
                    _patterns.forEach(function (pattern) {
                        if (pattern.test(reqElement) && _blocker.blockHost) {
                            handleAttack(_host);
                        }
                    });
                });
            }
            if (cb) {
                cb();
            }
        }

        function checkGetOrDeleteRequest(req, res, cb) {
            var _url = req.url;
            _patterns.forEach(function(pattern) {
                if (pattern.test(_url) && _blocker.blockHost) {
                    handleAttack(_host);
                }
            });
            if (cb) {
                cb();
            }
        };

        function handleAttack(_host) {
            _blocker.blockHost(_host);
            _logger.logAttack('XSSAttack', _host);
            res.status(403).end();
        };
    };

    module.exports = XSSModule;

})();