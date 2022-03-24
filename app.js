// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();
//place below the const app = exress();
//copy exactly the same.

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public")); // to be able to access css in list.ejs

mongoose.connect("mongodb+srv://dipakgiri:qGc2ZzqNbNXqiFh0@cluster0.js7sd.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema);

const item1  = new Item({
  name:'welcome to your todo list'
})
const item2 = new Item({
  name:'hit the plus to add todo'
})
const item3 = new Item({
  name:'go to scheool'
})

const defaultItems = [item1, item2, item3];

const listschema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listschema);


//GET function for home route
app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
      if (foundItems.length == 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            console.log('inserted successfully.');
          }
        }); 
        res.redirect("/");
      } else {
        res.render("list", {listTitle:"today", newListItems: foundItems});
}
})  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list 
        const list = new List({
        name: customListName,
        items: defaultItems
      });

        list.save();
        res.redirect("/" + customListName);
      } else {
        //show an existing list ..
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });

    }
  }
})
  
 })

//POST function for home route
app.post("/", function (req, res) {
  // console.log(req.body);
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});
  
app.post("/delete", function (req, res) {
  const checkItemid = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkItemid, function (err) {
      if (!err) {
        console.log('successfully deleted checked!');
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemid } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      });
  }
 
});



//POST function for home route
app.post("/work", function(req,res){
  const item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

//GET function for About route

app.get("/about", function(req,res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
console.log("Server has started successfully !!");
});