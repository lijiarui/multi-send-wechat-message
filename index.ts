const http = require('http')
const url = require('url')
const server = new http.Server()
server.listen(8000)
server.on('request', function (request, response) {
  console.log('Recived request!')
  const params = url.parse(request.url, true).query;
  const profile = params['profile']
  const msg = params['msg']
  console.log(`request params: ${JSON.stringify(params)}`)
  if (profile && msg) {
    terminalService(profile, msg)
  }
})
console.log('Server running on port 8000.')

function terminalService(profile, msg) {
  console.log(profile)
  console.log(msg)
  const exec = require('child_process').exec;
  const child = exec(`export DISPLAY=:99.0  && TEST_PROFILE=${profile} MSG=${msg} ts-node example/newyear.ts`)

  child.stdout.on('data', function(data) {
    console.log('stdout: ' + data);
  });
  child.stderr.on('data', function(data) {
    console.log('stdout: ' + data);
  });
  child.on('close', function(code) {
    console.log('closing code: ' + code);
  });
}
