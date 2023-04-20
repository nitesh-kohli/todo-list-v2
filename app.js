//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// installed and added mongoose in app.js
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//created a new database named as todolistDB
mongoose.connect("mongodb+srv://admin-nitesh:test123@cluster0.eaotll0.mongodb.net/todolistDB",{useNewUrlParser:true});


//create a new schema
const itemsSchema = {
  name:String
};

//create a new mongoose model based on schema
// Item is a collection
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Welcome to your todolist!"
});

const item2 = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name:String,
  items : [itemsSchema]
};

const List = mongoose.model("list",listSchema);




app.get("/", function(req, res) {

  Item.find({})
    .then(function(foundItems){
      
      if(foundItems.length === 0){

        Item.insertMany(defaultItems)
      .then(function(){
        console.log("successfully saved deafult items to DB");

      })
      .catch(function(err){
        console.log(err);
      });
      res.redirect("/");
      }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
      }

     
  })
  .catch(function(err){
    console.log(err);
  })

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName ==="Today"){
    //save the item into our collection
  item.save();
  //to show item on the page
  res.redirect("/");
  } else{
    List.findOne({name:listName})
          .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+ listName);
          })
          .catch(function(err){
            console.log(err);
          });
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      console.log("successfully deleted checked item.");
      res.redirect("/");
    })
    .catch(function(err){
      console.log(err);
    });
  } else{
    List.findOneAndUpdate({name : listName},{$pull:{items:{_id:checkedItemId}}})
          .then(function(foundList){
           
              res.redirect("/"+listName);
          })
          .catch(function(err){
            console.log(err);
          });
  }

  
});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);


 List.findOne({name:customListName})
        .then(function(foundList){
          if(foundList == null){
            const list = new List({
              name: customListName,
              items:defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
          }
          else{
            res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
          }
        })
        .catch(function(err){
          console.log(err);
        })
      
 
});









app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});
