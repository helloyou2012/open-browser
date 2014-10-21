var os = require('os');

function _isLoopback(addr) {
  return /^127\.0\.0\.1$/.test(addr)
    || /^fe80::1$/.test(addr)
    || /^::1$/.test(addr)
    || /^::$/.test(addr);
};

exports.address = function address() {
  var interfaces = os.networkInterfaces(),
    all,
    family = 'ipv4',
    loopback = '127.0.0.1';

  var all = Object.keys(interfaces).map(function(nic) {
    var addresses = interfaces[nic].filter(function(details) {
      details.family = details.family.toLowerCase();
      if (details.family !== family || _isLoopback(details.address)) {
        return false;
      } else {
        return true;
      }
    });

    return addresses.length ? addresses[0].address : undefined;
  }).filter(Boolean);

  return !all.length ? loopback : all[0];
};