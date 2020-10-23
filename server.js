const express = require("express")
const Handlebars = require("handlebars")
const expressHandlebars = require("express-handlebars")
const {allowInsecurePrototypeAccess} = require("@handlebars/allow-prototype-access")

const {Restaurant, Menu, Item, db} = require("./models")
const { request } = require("express")

const app = express()

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public')) //this is a folder name that you will save your html etc files in. 
app.engine('handlebars', handlebars)
app.set("view engine", "handlebars")
//Insert congiguration for handling form POST requests:
app.use(express.urlencoded({ extended: true }))
app.use(express.json())


//------------ROUTES-----------//
app.get('/about', (request, response) => {
    response.render("about", {name: "Sarah"})
})
//------------RESTAURANTS-----------//
// Read ✅
app.get(['/','/restaurants'], async (request, response) => {
    const restaurants = await Restaurant.findAll({
        include: 'menus',
        nest: true
    })
    response.render("home", {restaurants: restaurants, date: new Date()})
})
// Create ✅
app.post(['/','/restaurants'], async(request,response)=>{
    await Restaurant.create(request.body)
    response.redirect("/") //redirect to home page
})
// Update ✅ (requires both GET and POST)
app.get('/restaurants/:id/edit', async(request,response)=>{
    const restaurant = await Restaurant.findByPk(request.params.id)
    response.render("restaurants_edit", {restaurant:restaurant})
})
app.post('/restaurants/:id/edit', async (request, response) => {
    const restaurant = await Restaurant.findByPk(request.params.id)
    await restaurant.update(request.body)
    response.redirect(`/restaurants/${restaurant.id}/menus`)
})
// Destroy ✅
app.get('/restaurants/:id/delete', async(request,response)=>{
    await Restaurant.findByPk(request.params.id)
    .then(restaurant => restaurant.destroy())
    response.redirect("/restaurants")
})
//------------MENUS-----------//
// Read ✅
app.get('/restaurants/:id/menus', async (request, response) => {
    const restaurant = await Restaurant.findByPk(request.params.id)
    const menus = await restaurant.getMenus({include: "items"})
    response.render("restaurant", {restaurant:restaurant, menus:menus})
})
// Create ✅
app.post("/restaurants/:id/menus", async(request,response)=>{
    const restaurant = await Restaurant.findByPk(request.params.id)
    const menu = await Menu.create({title: request.body.title, RestaurantId:request.params.id});
    // Add Item Name and Item Price
    await Item.create({name: request.body.name, price: request.body.price, MenuId: menu.id})
    response.redirect(`/restaurants/${restaurant.id}/menus`)
})
// Update ✅ (Just the menu name)
app.get('/restaurants/:restaurant_id/menus/:menu_id/edit', async(request,response)=>{
    const restaurant = await Restaurant.findByPk(request.params.restaurant_id)
    const menu = await Menu.findByPk(request.params.menu_id)
    response.render("menus_edit", {restaurant:restaurant, menu:menu})
})
app.post('/restaurants/:restaurant_id/menus/:menu_id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.restaurant_id)
    const menu = await Menu.findByPk(req.params.menu_id)
    await menu.update(req.body)
    res.redirect(`/restaurants/${restaurant.id}/menus`)
})
// Destroy ✅
app.get('/restaurants/:restaurant_id/menus/:menu_id/delete', async(request,response)=>{
    const restaurant = await Restaurant.findByPk(request.params.restaurant_id)
    await Menu.findByPk(request.params.menu_id)
    .then(menu => menu.destroy())
    response.redirect(`/restaurants/${restaurant.id}/menus`)
})
//------------ITEMS-----------//
// Read ✅
app.get('/restaurants/:restaurant_id/menus/:menu_id/items', async (request, response) => {
    const restaurant = await Restaurant.findByPk(request.params.restaurant_id)
    const menu = await Menu.findByPk(request.params.menu_id)
    const items = await menu.getItems()
    response.render("menu", {restaurant:restaurant, menu:menu, items:items})
})
// Create ✅ (add item on the items page)
app.post('/restaurants/:restaurant_id/menus/:menu_id/items', async (request, response) => {
    const restaurant = await Restaurant.findByPk(request.params.restaurant_id)
    const menu = await Menu.findByPk(request.params.menu_id)
    await Item.create({name: request.body.name, price: request.body.price, MenuId:menu.id})
    response.redirect(`/restaurants/${restaurant.id}/menus/${menu.id}/items`)
})
//Update✅
app.get('/restaurants/:restaurant_id/menus/:menu_id/items/:item_id/edit', async(request,response)=>{
    const restaurant = await Restaurant.findByPk(request.params.restaurant_id)
    const menu = await Menu.findByPk(request.params.menu_id)
    const item = await Item.findByPk(request.params.item_id)
    const items = await menu.getItems()
    response.render("menu", {restaurant:restaurant, menu:menu, items:items})
})
app.post('/restaurants/:restaurant_id/menus/:menu_id/items/:item_id/edit', async (req, res) => {
    const restaurant = await Restaurant.findByPk(req.params.restaurant_id)
    const menu = await Menu.findByPk(req.params.menu_id)
    const item = await Item.findByPk(req.params.item_id)
    await item.update(req.body)
    res.redirect(`/restaurants/${restaurant.id}/menus/${menu.id}/items`)
})
// Destroy ✅
app.get('/restaurants/:restaurant_id/menus/:menu_id/items/:item_id/delete', async(request,response)=>{
    const restaurant = await Restaurant.findByPk(request.params.restaurant_id)
    const menu = await Menu.findByPk(request.params.menu_id)
    await Item.findByPk(request.params.item_id)
    .then(item => item.destroy())
    response.redirect(`/restaurants/${restaurant.id}/menus/${menu.id}/items`)
})



//this is the point where the server is initialised. 
app.listen(3001, ()=>{
    console.log('port = ', 3001)
}) //port
