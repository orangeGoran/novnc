var serve = require('koa-static-server');
var koa = require("koa")
var router = require("koa-router")
var bodyParser = require('koa-bodyparser');
var views = require("co-views");
var render = views("templates", { map: { html: 'swig' }});
var seq = require('sequelize')

var sequelize = new seq('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  pool: {
    max: 5,
    min: 0,
    idle: 1000
  },
  storage: 'banana.sqlite'
});


var Templates = sequelize.define('templates', {
  name: {
    type: seq.STRING,
  },
  horizontal: {
    type: seq.INTEGER,
  },
  vertical: {
    type: seq.INTEGER,
  },
}, {
  timestamps: false,
  tableName: 'templates',
  paranoid: 'true'
})

var Jsons = sequelize.define('jsons', {
  name: {
    type: seq.STRING,
  },
  host: {
    type: seq.STRING
  },
  port: {
    type: seq.STRING,
  },
  password: {
    type: seq.STRING,
  },
  horizontal: {
    type: seq.INTEGER,
  },
  vertical: {
    type: seq.INTEGER,
  },
}, {
  timestamps: false,
  tableName: 'jsons',
  paranoid: 'true'
})

Jsons.belongsTo(Templates, {foreignKey: 'templ'})

Jsons.sync()
Templates.sync()
// sequelize.drop()

const app = koa()
const vnc = router()

app.use(bodyParser());


app.use(serve({rootDir: 'routes'}))
app.use(serve({rootDir: 'node_modules', rootPath: '/scriptsNode'}))
app.use(serve({rootDir: 'bower_components', rootPath: '/scriptsBower'}))
app.use(serve({rootDir: 'templates', rootPath: '/templates'}))
app.use(serve({rootDir: 'public/js', rootPath: '/js'}))
app.use(serve({rootDir: 'public/css', rootPath: '/css'}))
app.use(serve({rootDir: 'public/images', rootPath: '/images'}))
app.use(vnc.routes(), vnc.allowedMethods())

vnc.get('/', function * (next){
  this.body = yield render("/index");
});

// vnc.get('/banana',neki)
vnc.get('/getAllTemplates', getAllTemplates)
vnc.post('/createTemplate', createTemplate)
vnc.get('/getElementsByTemplate/:id',getElementsByTemplate)
vnc.delete('/deleteTemplate/:id',deleteTemplate)
vnc.delete('/deleteElement/:tmplId/:elId',deleteElement)
vnc.post('/createElement/:id', createElement)
vnc.post('/updateElement/:id', updateElement)
vnc.post('/updateTemplate/:id', updateTemplate)

function * updateTemplate () {
  let id = this.params.id
  let input = this.request.body
  try{
    let neki = yield sequelize.query("UPDATE templates SET name='" + input.name + "' WHERE id="+id , { type: sequelize.QueryTypes.UPDATE})
    this.body = {
      status: 'SUCCESS',
      message: 'Template updated'
    }
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}


function * updateElement () {
  let id = this.params.id
  let input = this.request.body
  try{
    let neki = yield sequelize.query("UPDATE Jsons SET name='" + input.name + "', host='" + input.host + "', password='" + input.password + "', port=" + input.port +" WHERE id="+id , { type: sequelize.QueryTypes.UPDATE})
    this.body = {
      status: 'SUCCESS',
      message: 'Json updated'
    }
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}

function * createElement() {
  let id = this.params.id
  let input = this.request.body
  try{
    let neki = yield sequelize.query("INSERT INTO Jsons(name, host, password, templ, port, horizontal, vertical) VALUES('" + input.name + "','" + input.host + "','" + input.password + "'," + id + ",'" + input.port +"','" + input.horizontal +"','" + input.vertical +"')", { type: sequelize.QueryTypes.INSERT})
    this.body = {
      status: 'SUCCESS',
      message: 'Json created'
    }
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}

function * getAllTemplates() {
  try{
    let neki = yield sequelize.query("SELECT * FROM templates ORDER BY name", { type: sequelize.QueryTypes.SELECT})
    this.body = neki
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}
function * createTemplate() {
  try{
    let neki = yield sequelize.query("INSERT INTO templates(name,horizontal,vertical) VALUES('" + this.request.body.name + "','" + this.request.body.horizontal + "','" + this.request.body.vertical + "')", { type: sequelize.QueryTypes.INSERT})
    this.body = {
      status: 'SUCCESS',
      message: 'Template created'
    }
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}

function * getElementsByTemplate() {
  let id = this.params.id
  try{
    let neki = yield sequelize.query("SELECT * FROM jsons WHERE templ =" + id, { type: sequelize.QueryTypes.SELECT})
    this.body = neki
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}
function * deleteTemplate() {
  try{
    let neki = yield sequelize.query("DELETE FROM Templates WHERE id = " + this.params.id,{ type: sequelize.QueryTypes.INSERT})
    this.body = {
      status: 'SUCCESS',
      message: 'Template deleted'
    }
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}
function * deleteElement() {
  let id = this.params.elId
  let id1 = this.params.tmplId
  try{
    let neki = yield sequelize.query("DELETE FROM Jsons WHERE id = " + id + " AND templ = " + id1,{ type: sequelize.QueryTypes.DELETE})
    this.body = {
      status: 'SUCCESS',
      message: 'Json deleted'
    }
  }catch(err){
    this.status = 500
    this.body = { status: 'ERROR', message: err.message }
  }
}


const port = 1234
app.listen(port, () => console.log('Koa listening on port: ' + port))
