//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://FelipeMT21:Felipevc_21@felipemt21.05plqhv.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new itm."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.>"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

// Item.insertMany(defaultItems)
//   .then(() => {
//     console.log("Successfully saved default items to DB.");
//   })
//   .catch(err => {
//     console.log(err);
//   })

app.get("/", async function (req, res) {

  try {
    const foundItems = await Item.find({});

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log("Successfully saved default items to DB.");
          res.redirect("/");
        })
        .catch(err => {
          console.log(err);
        })
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }

  } catch (err) {
    console.log(err);
  }

});

app.post("/", async function (req, res) {

  const nameItem = req.body.newItem;
  const nameList = req.body.list;

  const item = new Item({
    name: nameItem
  })

  if(nameList === "Today") {
    item.save();
    res.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({name: nameList})
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + nameList);
    } catch (err) {
      console.log(err);
    }
  }

});

app.post("/delete", async (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndDelete(checkedItemId)
     .then(() => {
      console.log("Successfully deleted checked item.");
      res.redirect("/");
     })
     .catch(err => {
      console.log(err);
     })
  } else {
    try {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}})
      res.redirect("/" + listName);
    } catch (err) {
      console.log(err);
    }
  }

});

app.get("/:customListName", async (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      })
      list.save();
      res.redirect("/" + customListName);
    } else {
      //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  } catch (err) {
    console.log(err);
  }
})

app.get("/about", function (req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port successfully");
});