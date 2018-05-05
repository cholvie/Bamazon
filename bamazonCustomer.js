var mysql = require("mysql");
var inquirer = require("inquirer");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "password1234",
  database: "bamazon_db"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;

  // run the start function after the connection is made to prompt the user
  start();
});
       
  // query the database for all items being auctioned

  connection.query("SELECT * FROM bamazon", function(err, results) {
    if (err) throw err;

    // once you have the items are listed, prompt the user for which they'd like to purchase
    inquirer
      .prompt([
        {
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push(results[i].product_name);
            }
            return choiceArray;
          },
          message: "What would you like to buy?"
        },
        {
          name: "orderQuantity",
          type: "input",
          message: "How many would you like to buy?",
        }
      ])

      .then(function(answer) {

        // get the information of the chosen item

        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          }
        }

        // determine if stock was high enough
        if (chosenItem.stock_quantity < parseInt(answer.orderQuantity)) {

          //If there is enough stock_quantity for purchase quantity, update db, let the user know, and start over
          connection.query(
            "UPDATE bamazon SET ? WHERE ?",
            [
              {
                stock_quantity: answer.orderQuantity
              },
              {
                id: chosenItem.id
              }
            ],
            function(error) {
              if (error) throw err;
              console.log("Your selection was successfully!");
              start();
            }
          );
        }
        else {
          // there isn't enough stock for you quantity, so apologize and start over
          console.log("We apologize, our stock is too low for your order. Please select another quantity.");
          start();
        }
      });
  });

